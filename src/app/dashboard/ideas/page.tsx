'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lightbulb, Sparkles, RefreshCw, Award, PlayCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  const [ideas, setIdeas] = useState<AngleIdea[]>(DEFAULT_IDEAS);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

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

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Link 
                href={`/editor/${i.id}`}
                className="cyber-btn-primary"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <PlayCircle size={16} />
                Draft script from this angle
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
