'use client';

import { useState, useEffect } from 'react';
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

export default function StrategyLabPage() {
  const [ideas, setIdeas] = useState<AngleIdea[]>([]);
  const [loading, setLoading] = useState(false);

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

      let ideasList: AngleIdea[] = [];

      if (userId) {
        try {
          const { data: dbIdeas, error } = await supabase
            .from('content_ideas')
            .select(`
              id, 
              angle, 
              hook, 
              status, 
              trends:trend_id (id, title)
            `)
            .eq('creator_id', userId);

          if (dbIdeas) {
            ideasList = dbIdeas.map((idea: any) => {
              const trendObj = Array.isArray(idea.trends) ? idea.trends[0] : idea.trends;
              return {
                id: idea.id,
                trendTitle: trendObj?.title || 'General Concept',
                angleTitle: idea.angle || 'Custom Angle',
                hookText: idea.hook || 'No hook text generated.',
                predictedScore: 85,
                reason: `Selected custom angle. Status is currently: ${idea.status || 'draft'}.`
              };
            });
          }
        } catch (err) {
          console.error('Error querying content ideas:', err);
        }
      }
      setIdeas(ideasList);
      setLoading(false);
    };

    fetchIdeas();
  }, []);

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
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <RefreshCw size={16} />
          Regenerate Strategy
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
              <button style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <PlayCircle size={16} />
                Draft script from this angle
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
