import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { systemPrompt, userMessage, prompt } = await request.json();
    const sys = systemPrompt || 'You are an AI viral content creation assistant.';
    const msg = userMessage || prompt || 'Generate a viral video script topic and ideas.';
    
    const result = await callGemini(sys, msg);
    return NextResponse.json({ result, script: result });
  } catch (err: any) {
    console.error('[LLM API Error]:', err);
    return NextResponse.json({ error: err.message || 'LLM generation failed' }, { status: 500 });
  }
}
