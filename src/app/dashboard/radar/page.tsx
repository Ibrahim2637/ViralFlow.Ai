'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, RefreshCw, Eye, Heart, MessageSquare, Search, Award } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
interface Trend {
  id: string;
  title: string;
  topic: string;
  source: string;
  overall_score: number;
  momentum: number;
  fit: number;
  novelty: number;
  saturation: number;
  reason: string;
  recommended: boolean;
  views: number;
}

export default function TrendRadarPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [filter, setFilter] = useState<'all' | 'recommended'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
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

      let trendsList: Trend[] = [];

      if (userId) {
        try {
          const { data: scoresData, error: scoresError } = await supabase
            .from('trend_scores')
            .select(`
              trend_id, 
              overall_score, 
              momentum, 
              fit, 
              novelty, 
              saturation, 
              reason, 
              trends:trend_id (id, title, topic, source, views)
            `)
            .eq('creator_id', userId);

          if (scoresData) {
            trendsList = scoresData.map((s: any) => {
              const trendObj = Array.isArray(s.trends) ? s.trends[0] : s.trends;
              return {
                id: s.trend_id,
                title: trendObj?.title || 'Untitled Trend',
                topic: trendObj?.topic || 'General',
                source: trendObj?.source || 'custom',
                overall_score: s.overall_score || 0,
                momentum: s.momentum || 0,
                fit: s.fit || 0,
                novelty: s.novelty || 0,
                saturation: s.saturation || 0,
                reason: s.reason || '',
                recommended: (s.overall_score || 0) >= 85,
                views: trendObj?.views || 0
              };
            });
          }
        } catch (err) {
          console.error('Error fetching trends from DB:', err);
        }
      }
      setTrends(trendsList);
      setLoading(false);
    };

    fetchTrends();
  }, []);

  const filteredTrends = trends
    .filter(t => filter === 'all' || t.recommended)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.topic.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
            Trend Radar Feed
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time discovered signals and developer search queries. Click on any high-scoring card to script immediately.
          </p>
        </div>

        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <RefreshCw size={16} />
          Fetch Live Signals
        </button>
      </div>

      {/* Filter Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: filter === 'all' ? 'var(--bg-base)' : 'transparent',
              color: filter === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            All Signals
          </button>
          <button
            onClick={() => setFilter('recommended')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: filter === 'recommended' ? 'var(--bg-base)' : 'transparent',
              color: filter === 'recommended' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Highly Recommended
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search trend topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Grid of Trend Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredTrends.map(t => (
          <div
            key={t.id}
            className="glass-panel"
            style={{
              display: 'flex',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              gap: '24px',
              borderLeft: t.recommended ? '4px solid var(--accent-primary)' : '1px solid var(--border-color)',
              boxShadow: t.recommended ? 'var(--shadow-glow)' : 'none'
            }}
          >
            {/* Left info */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--accent-secondary)',
                  border: '1px solid var(--border-color)'
                }}>
                  {t.topic}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.source}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
                  <Eye size={12} /> {t.views.toLocaleString()} views
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{t.reason}</p>

              {/* Individual sub-scores indicators */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                {[
                  { name: 'Momentum', val: t.momentum, color: 'var(--accent-secondary)' },
                  { name: 'Fit', val: t.fit, color: 'var(--accent-primary)' },
                  { name: 'Novelty', val: t.novelty, color: 'var(--success)' },
                  { name: 'Saturation', val: t.saturation, color: 'var(--error)' }
                ].map(score => (
                  <div key={score.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{score.name}:</span>
                    <strong style={{ color: score.color }}>{score.val}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall & CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', width: '130px', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: t.overall_score >= 90 ? 'var(--success)' : 'var(--accent-primary)', fontFamily: 'var(--font-heading)' }}>
                  {t.overall_score}
                </div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Fit Score</span>
              </div>

              <Link href={`/editor/${t.id}`} style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-glow)',
                textAlign: 'center',
                width: '100%'
              }}>
                Create Script
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
