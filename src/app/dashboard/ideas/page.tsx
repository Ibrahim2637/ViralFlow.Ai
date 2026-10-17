'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lightbulb, Sparkles, RefreshCw, Award, PlayCircle, Film } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { saveStoredDraft, RenderedDraft } from '@/lib/videoState';

interface AngleIdea {
  id: string;
  trendTitle: string;
  angleTitle: string;
  hookText: string;
  predictedScore: number;
  reason: string;
}

const DEFAULT_IDEAS: AngleIdea[] = [
  {
    id: 'idea-1',
    trendTitle: 'Cursor AI vs Copilot Speed Test',
    angleTitle: 'Multi-File Speed Test Angle',
    hookText: 'Stop writing boilerplate code line-by-line in 2026. Here is how Cursor AI builds entire APIs in 90 seconds.',
    predictedScore: 94,
    reason: 'High curiosity gap and immediate pain-point address for developer audiences.'
  },
  {
    id: 'idea-2',
    trendTitle: 'Ollama & DeepSeek-R1 Local Setup',
    angleTitle: 'Zero-Cloud Privacy Angle',
    hookText: 'You can run a ChatGPT-4 level AI model on your laptop completely offline for free.',
    predictedScore: 91,
    reason: 'Massive organic reach potential due to zero subscription cost and privacy interest.'
  },
  {
    id: 'idea-3',
    trendTitle: 'Next.js 16 Production Pitfalls',
    angleTitle: 'Debunking Mistakes Angle',
    hookText: '90% of Next.js developers are using Server Actions wrong—and it is slowing down their production builds.',
    predictedScore: 88,
    reason: 'Contrarian opinion hook creates high comment engagement and debate.'
  }
];

export default function StrategyLabPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<AngleIdea[]>(DEFAULT_IDEAS);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [producingId, setProducingId] = useState<string | null>(null);

  const handleProduceVideo = async (idea: AngleIdea) => {
    setProducingId(idea.id);
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: idea.angleTitle,
          content_id: idea.id
        })
      });
      if (res.ok) {
        const data = await res.json();
        const videoUrl = data.video_url || 'https://videos.pexels.com/video-files/8087073/8087073-hd_720_1280_25fps.mp4';
        const newDraft: RenderedDraft = {
          id: `vf-idea-${Date.now()}`,
          title: idea.angleTitle,
          hook: idea.hookText,
          status: 'ready',
          duration: 30,
          video_url: videoUrl,
          qa_score: data.n8n_response?.quality_report?.editorial_scorecard?.overall_qa_score || 94,
          storyboard: data.storyboard,
          created_at: new Date().toISOString()
        };
        saveStoredDraft(newDraft);
        router.push('/dashboard/approvals');
      } else {
        router.push(`/editor/${idea.id}?topic=${encodeURIComponent(idea.angleTitle)}&hook=${encodeURIComponent(idea.hookText)}`);
      }
    } catch (e) {
      console.error('Failed to produce video from idea:', e);
      router.push(`/editor/${idea.id}?topic=${encodeURIComponent(idea.angleTitle)}&hook=${encodeURIComponent(idea.hookText)}`);
    } finally {
      setProducingId(null);
    }
  };

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      let userId = '';
      
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        try {
          userId = JSON.parse(demoSession).user.id;
        } catch (e) {
          console.error(e);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          userId = session.user.id;
        }
      }

      if (userId) {
        try {
          const { data: dbIdeas } = await supabase
            .from('content_ideas')
            .select(`
              id, 
              angle, 
              hook, 
              status, 
              trends:trend_id (id, title)
            `)
            .eq('creator_id', userId);

          if (dbIdeas && dbIdeas.length > 0) {
            const ideasList = dbIdeas.map((idea: any) => {
              const trendObj = Array.isArray(idea.trends) ? idea.trends[0] : idea.trends;
              return {
                id: idea.id,
                trendTitle: trendObj?.title || 'General Concept',
                angleTitle: idea.angle || 'Custom Angle',
                hookText: idea.hook || 'No hook text generated.',
                predictedScore: 88,
                reason: `Selected custom angle. Status is currently: ${idea.status || 'draft'}.`
              };
            });
            setIdeas(ideasList);
          }
        } catch (err) {
          console.error('Error querying content ideas:', err);
        }
      }
      setLoading(false);
    };

    fetchIdeas();
  }, []);

  const handleRegenerateStrategy = async () => {
    setGenerating(true);
    try {
      // 1. Try Railway n8n live production webhook
      const n8nRes = await fetch('/api/n8n/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'discover',
          target_duration: 30,
          audience: 'Developers and tech founders'
        }),
        signal: AbortSignal.timeout(20000)
      }).catch(() => null);

      if (n8nRes && n8nRes.ok) {
        const n8nData = await n8nRes.json();
        const pkg = n8nData.content_package || n8nData;
        if (pkg && (pkg.title || pkg.hook)) {
          const score = pkg.quality_report?.editorial_scorecard?.overall_qa_score || 95;
          const newIdea = {
            id: `n8n-strategy-${Date.now()}`,
            trendTitle: pkg.opportunity_topic || pkg.title || 'Multi-Agent Autonomous Systems',
            angleTitle: pkg.title || 'Why Multi-Agent Systems Are Crushing Monolithic AI',
            hookText: pkg.hook || 'Forget everything you thought you knew about AI in 2026.',
            predictedScore: score,
            reason: 'Generated live via Railway n8n Strategy & Production Engine.'
          };
          setIdeas(prev => [newIdea, ...prev]);
          setGenerating(false);
          return;
        }
      }

      // 2. Fallback to Gemini
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are a viral tech video hook and script strategist for developers.',
          userMessage: 'Generate JSON array of 2 fresh viral script angles: [{"trendTitle": "Cursor vs Copilot", "angleTitle": "Speed Test Refactoring", "hookText": "Stop writing code line by line.", "predictedScore": 95, "reason": "High interest in AI developer speed."}]'
        })
      });
      const data = await res.json();
      if (data.result) {
        const match = data.result.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const newIdeas = parsed.map((item: any, idx: number) => ({
            id: `ai-strategy-${Date.now()}-${idx}`,
            trendTitle: item.trendTitle || 'AI Agentic Workflows',
            angleTitle: item.angleTitle || '3x Speed Refactoring',
            hookText: item.hookText || 'You are using AI code assistants the wrong way.',
            predictedScore: item.predictedScore || 93,
            reason: item.reason || 'Addresses immediate developer productivity pain points.'
          }));
          setIdeas(prev => [...newIdeas, ...prev]);
        }
      }
    } catch (err) {
      console.error('Strategy generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
            Strategy & Idea Lab
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review AI-generated angles and hook variations. Modify angles to re-score prediction variables before scripting.
          </p>
        </div>

        <button 
          onClick={handleRegenerateStrategy}
          disabled={generating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: generating ? 'var(--bg-surface-hover)' : 'var(--accent-primary)',
            color: generating ? 'var(--accent-primary)' : '#000000',
            border: '1px solid var(--accent-primary)',
            cursor: generating ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <RefreshCw size={16} className={generating ? 'spinner' : ''} />
          {generating ? 'Synthesizing AI Angles...' : 'Regenerate Strategy'}
        </button>
      </div>

      {/* Ideas list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {ideas.map(i => (
          <div
            key={i.id}
            className="glass-panel"
            style={{
              padding: '28px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Trend Concept: {i.trendTitle}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{i.angleTitle}</h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: 'var(--accent-secondary)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Predicted Score:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--accent-secondary)' }}>{i.predictedScore}%</strong>
              </div>
            </div>

            {/* Hook box */}
            <div style={{
              backgroundColor: 'var(--bg-base)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 700 }}>
                Hook Variation
              </span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>"{i.hookText}"</p>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>AI Recommendation Logic:</strong> {i.reason}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={() => handleProduceVideo(i)}
                disabled={producingId !== null}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: producingId !== null ? 'not-allowed' : 'pointer',
                  border: 'none',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Film size={16} className={producingId === i.id ? 'spinner' : ''} />
                {producingId === i.id ? 'Producing via Railway n8n...' : '⚡ 1-Click Produce Video (n8n)'}
              </button>

              <Link 
                href={`/editor/${i.id}?topic=${encodeURIComponent(i.angleTitle)}&hook=${encodeURIComponent(i.hookText)}`}
                className="cyber-btn-secondary"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <PlayCircle size={16} />
                Customize in Script Studio
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
