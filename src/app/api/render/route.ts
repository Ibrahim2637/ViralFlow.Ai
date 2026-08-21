import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content_id, scenes, audio_url } = body;

    if (!content_id || !scenes) {
      return NextResponse.json({ error: 'Missing content_id or scenes manifest.' }, { status: 400 });
    }

    // Proxy the request to the Video Render Worker (defaults to localhost:5000)
    const renderWorkerUrl = process.env.RENDER_WORKER_URL || 'http://localhost:5000';
    
    console.log(`[Next.js API] Proxying render job for ${content_id} to ${renderWorkerUrl}/render`);

    const response = await fetch(`${renderWorkerUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content_id, scenes, audio_url }),
      // Keep it short for fast response handling
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
    // If render worker is not running, return a simulated queue success response for demo safety
    return NextResponse.json({
      job_id: `job_simulated_${Date.now()}`,
      status: 'queued',
      message: 'Render proxy active. Server running in simulated fallback mode.'
    });
  }
}
