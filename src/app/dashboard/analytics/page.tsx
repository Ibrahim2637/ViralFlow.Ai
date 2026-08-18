'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Eye, Heart, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
export default function AnalyticsPage() {
  const [insights, setInsights] = useState<string[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
          const { data: publishedIdeas, error } = await supabase
            .from('content_ideas')
            .select(`
              id,
              trends:trend_id (views, likes, comments)
            `)
            .eq('creator_id', userId)
            .eq('status', 'published');

          if (publishedIdeas) {
            let views = 0;
            let likes = 0;
            let comments = 0;
            publishedIdeas.forEach((idea: any) => {
              const trendObj = Array.isArray(idea.trends) ? idea.trends[0] : idea.trends;
              if (trendObj) {
                views += trendObj.views || 0;
                likes += trendObj.likes || 0;
                comments += trendObj.comments || 0;
              }
            });
            setTotalViews(views);
            setTotalLikes(likes);
            setTotalComments(comments);
          }
        } catch (err) {
          console.error('Error fetching analytics calculations:', err);
        }
      }

      setInsights([
        'Analytics data empty. Once you connect publishing APIs and post videos, retention analytics will populate here.'
      ]);
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
          Analytics & Learning Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monitor retention curves, hook performance rankings, and updates fed back to your Creator DNA.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="responsive-grid-2">
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent-primary)', padding: '10px', borderRadius: 'var(--radius-full)' }}>
            <Eye size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalViews.toLocaleString()}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Video Views</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent-secondary)', padding: '10px', borderRadius: 'var(--radius-full)' }}>
            <Heart size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalLikes.toLocaleString()}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Video Likes</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success)', padding: '10px', borderRadius: 'var(--radius-full)' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalComments.toLocaleString()}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Comments Written</span>
          </div>
        </div>
      </div>

      {/* Split Graph / Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="split-grid">
        
        {/* Retention Graph */}
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)' }}>
            <TrendingUp size={20} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Audience Retention Curve</h2>
          </div>

          {/* SVG graph mockup */}
          <div style={{ width: '100%', height: '180px', position: 'relative', marginTop: '12px' }}>
            <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Grid lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="var(--border-color)" strokeWidth="0.2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border-color)" strokeWidth="0.2" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="var(--border-color)" strokeWidth="0.2" />
              {/* Curve */}
              <path
                d="M 0 0 C 10 12, 20 22, 40 25 C 60 27, 80 28, 100 32"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.5"
              />
              <path
                d="M 0 0 C 10 12, 20 22, 40 25 C 60 27, 80 28, 100 32 L 100 40 L 0 40 Z"
                fill="url(#glow)"
                opacity="0.1"
              />
              <defs>
                <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              <span>0s (Hook)</span>
              <span>15s</span>
              <span>30s</span>
              <span>45s (CTA)</span>
            </div>
          </div>
        </section>

        {/* Hook Leaderboard */}
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Hook Rankings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            {[
              { type: 'Question hook', score: '62% retention' },
              { type: 'Contrarian question', score: '58% retention' },
              { type: 'Surprising fact', score: '48% retention' }
            ].map(item => (
              <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.type}</span>
                <span style={{ fontWeight: 600 }}>{item.score}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Closed loop feedback */}
      <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
          <Sparkles size={20} />
          <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Self-Learning Engine Insights</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {insights.map((ins, index) => (
            <div 
              key={index}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                lineHeight: '1.5'
              }}
            >
              {ins}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
