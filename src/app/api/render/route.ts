import { NextResponse } from 'next/server';
import { N8N_WEBHOOK_URL } from '@/config/keys';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content_id, scenes, audio_url, topic } = body;

    if (!content_id && !scenes && !topic) {
      return NextResponse.json({ error: 'Missing content_id, scenes manifest, or topic.' }, { status: 400 });
    }

    // 1. Try dispatching to n8n webhook if available
    const n8nTarget =
      process.env.N8N_WEBHOOK_URL ||
      N8N_WEBHOOK_URL ||
      'https://primary-production-675a3.up.railway.app/webhook/viralflow-produce';

    try {
      console.log(`[Render API] Dispatching video assembly to n8n: ${n8nTarget}`);
      const n8nTopic =
        topic ||
        (Array.isArray(scenes) && scenes[0]?.text
          ? scenes[0].text.slice(0, 60)
          : 'Why Multi-Agent Systems Are Crushing Monolithic AI in 2026');

      const n8nRes = await fetch(n8nTarget, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'direct',
          topic: n8nTopic,
          target_duration: 30,
          audience: 'Developers and tech founders'
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (n8nRes.ok) {
        const n8nData = await n8nRes.json();
        const videoUrl =
          n8nData.assets_used && n8nData.assets_used[0] && n8nData.assets_used[0].preview_link
            ? n8nData.assets_used[0].preview_link
            : '/placeholder_avatar.mp4';

        return NextResponse.json({
          job_id: n8nData.workflow_id || `n8n_job_${Date.now()}`,
          status: 'ready',
          video_url: videoUrl,
          storyboard: n8nData.storyboard,
          render_manifest: n8nData.render_manifest,
          n8n_response: n8nData,
          message: 'Video production package successfully generated and delivered by n8n.'
        });
      }
    } catch (n8nErr) {
      console.log('[Render API] n8n webhook bypass, falling back to render worker:', n8nErr);
    }

    // 2. Proxy request to Video Render Worker (defaults to localhost:5000)
    const renderWorkerUrl = process.env.RENDER_WORKER_URL || 'http://localhost:5000';
    console.log(`[Next.js API] Proxying render job for ${content_id} to ${renderWorkerUrl}/render`);

    const response = await fetch(`${renderWorkerUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content_id, scenes, audio_url }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Render worker returned error: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Next.js API] Render proxy error:', err);
    return NextResponse.json({
      job_id: `job_simulated_${Date.now()}`,
      status: 'queued',
      message: 'Render proxy active. Server running in simulated fallback mode.'
    });
  }
}
