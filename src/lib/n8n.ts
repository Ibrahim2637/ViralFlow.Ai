import { N8N_WEBHOOK_URL } from '@/config/keys';

export interface N8nContentPackage {
  generated_at?: string;
  creator_dna?: any;
  opportunity?: {
    title?: string;
    source?: string;
    overall_score?: number;
    reasoning?: string;
  };
  script?: {
    title?: string;
    hook?: string;
    duration_seconds?: number;
    scenes?: Array<{
      start: number;
      end: number;
      voiceover: string;
      visual_type: string;
      caption?: string;
      search?: string;
    }>;
    claims?: Array<{
      text: string;
      needs_source: boolean;
    }>;
  };
  fact_check?: {
    safe_to_publish?: boolean;
    fact_check?: any[];
  };
  broll_assets?: Array<{
    id: number;
    video_url: string;
    preview_image: string;
  }>;
  final_video_url?: string;
  render_status?: string;
}

export async function triggerN8nWorkflow(topicOrQuery: string, webhookUrlOverride?: string): Promise<N8nContentPackage> {
  const targetUrl =
    webhookUrlOverride ||
    N8N_WEBHOOK_URL ||
    'http://localhost:5678/webhook/viralflow-generate';

  console.log('[n8n Client] Dispatching request to webhook: ' + targetUrl);

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: topicOrQuery,
      topic: topicOrQuery
    }),
    signal: AbortSignal.timeout(90000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('n8n webhook error (' + res.status + '): ' + errorText);
  }

  const json = await res.json();
  return json.content_package || json;
}
