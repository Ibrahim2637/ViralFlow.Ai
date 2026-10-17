import { NextResponse } from 'next/server';
import { triggerN8nWorkflow } from '@/lib/n8n';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { mode, topic, message, target_duration, audience, webhookUrl } = body;

    const contentPackage = await triggerN8nWorkflow({
      mode: mode || (topic ? 'direct' : 'discover'),
      topic: topic || message,
      target_duration: target_duration || 30,
      audience: audience || 'Developers and tech founders',
      webhookUrl
    });

    return NextResponse.json({ success: true, content_package: contentPackage, ...contentPackage });
  } catch (err: any) {
    console.error('[n8n API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'n8n workflow execution failed' },
      { status: 500 }
    );
  }
}

