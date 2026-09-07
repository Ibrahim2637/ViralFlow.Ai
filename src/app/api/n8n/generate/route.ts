import { NextResponse } from 'next/server';
import {
  triggerN8nWorkflow
} from '@/lib/n8n';

export async function POST(request: Request) {
  try {
    const { topic, message, webhookUrl } = await request.json();
    const query = topic || message || 'AI tools for developers';

    const contentPackage = await triggerN8nWorkflow(query, webhookUrl);
    return NextResponse.json({ success: true, content_package: contentPackage });
  } catch (err: any) {
    console.error('[n8n API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'n8n workflow execution failed' },
      { status: 500 }
    );
  }
}
