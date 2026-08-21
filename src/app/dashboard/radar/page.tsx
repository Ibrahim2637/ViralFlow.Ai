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

const DEFAULT_TRENDS: Trend[] = [
  {
    id: 'trend-1',
    title: 'Cursor AI Composer vs GitHub Copilot Workspace',
    topic: 'Developer Tools',
    source: 'YouTube & GitHub Trends',
    overall_score: 94,
    momentum: 98,
    fit: 95,
    novelty: 90,
    saturation: 35,
    reason: 'Multi-file agentic code editing is breaking search records among developer creators this week.',
    recommended: true,
    views: 240000
  },
  {
    id: 'trend-2',
    title: 'Local LLM Fine-Tuning with Ollama & DeepSeek-R1',
    topic: 'Open Source AI',
    source: 'Reddit r/LocalLLaMA',
    overall_score: 89,
    momentum: 91,
    fit: 88,
    novelty: 92,
    saturation: 40,
    reason: 'Massive surge in queries around running reasoning models locally on consumer GPUs.',
    recommended: true,
    views: 185000
  },
  {
    id: 'trend-3',
    title: 'Next.js 16 Server Actions Security & Performance',
    topic: 'Web Development',
    source: 'Hacker News',
    overall_score: 82,
    momentum: 79,
    fit: 85,
    novelty: 80,
    saturation: 60,
    reason: 'High discussion around Next.js App Router caching policies and production best practices.',
    recommended: false,
    views: 95000
  }
];

export default function TrendRadarPage() {
  const [trends, setTrends] = useState<Trend[]>(DEFAULT_TRENDS);
  const [filter, setFilter] = useState<'all' | 'recommended'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

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

      if (userId) {
        try {
          const { data: scoresData } = await supabase
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

          if (scoresData && scoresData.length > 0) {
            const dbTrends = scoresData.map((s: any) => {
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
            setTrends(dbTrends);
          }
        } catch (err) {
          console.error('Error fetching trends from DB:', err);
        }
      }
      setLoading(false);
    };

    fetchTrends();
  }, []);

  const handleScanTrends = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are an AI Viral Trend Finder for tech creators and developers.',
          userMessage: 'Scan current trending developer topics and output JSON array of 2 trends: [{"title": "...", "topic": "AI Tools", "source": "GitHub Trends", "overall_score": 93, "momentum": 96, "fit": 91, "novelty": 94, "saturation": 28, "reason": "High search velocity", "views": 210000}]'
        })
      });
      const data = await res.json();
      if (data.result) {
        const match = data.result.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const newTrends = parsed.map((t: any, i: number) => ({
            id: `ai-scanned-${Date.now()}-${i}`,
            title: t.title || 'Agentic AI Code Generation Frameworks',
            topic: t.topic || 'Developer AI',
            source: t.source || 'GitHub Trends',
            overall_score: t.overall_score || 92,
            momentum: t.momentum || 95,
            fit: t.fit || 90,
            novelty: t.novelty || 93,
            saturation: t.saturation || 30,
            reason: t.reason || 'High velocity keyword search growth across tech channels.',
            recommended: true,
            views: t.views || 190000
          }));
          setTrends(prev => [...newTrends, ...prev]);
        }
      }
    } catch (err) {
      console.error('Scan trends failed:', err);
    } finally {
      setScanning(false);
    }
  };

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

        <button 
          onClick={handleScanTrends}
          disabled={scanning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--accent-primary)',
            backgroundColor: scanning ? 'var(--bg-surface-hover)' : 'var(--accent-primary)',
            color: scanning ? 'var(--accent-primary)' : '#000000',
            cursor: scanning ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <RefreshCw size={16} className={scanning ? 'spinner' : ''} />
          {scanning ? 'Scanning AI Signals...' : 'Fetch Live Signals'}
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
            All Signals ({trends.length})
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
            Highly Recommended ({trends.filter(t => t.recommended).length})
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="cyber-badge" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--accent-primary)', borderColor: 'var(--border-color)' }}>
                  {t.topic}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source: {t.source}</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{t.reason}</p>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>👁️ {(t.views / 1000).toFixed(0)}k views</span>
                <span>🔥 Momentum: {t.momentum}%</span>
                <span>🎯 Audience Fit: {t.fit}%</span>
              </div>
            </div>

            {/* Right Score & Action */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minWidth: '130px', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Viral Score</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: t.overall_score >= 85 ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  {t.overall_score}%
                </div>
              </div>

              <Link
                href={`/editor/script-for-${t.id}`}
                className="cyber-btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.8rem', textAlign: 'center', width: '100%' }}
              >
                Script Topic
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
