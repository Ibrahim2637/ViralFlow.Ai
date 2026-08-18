'use client';

import { useState, useEffect } from 'react';
import { Upload, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
interface QueuedPublish {
  id: string;
  title: string;
  platform: 'YouTube Shorts' | 'TikTok';
  scheduledFor: string;
  status: 'scheduled' | 'failed' | 'published';
}

export default function PublishingPage() {
  const [publishes, setPublishes] = useState<QueuedPublish[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPublishes = async () => {
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

      let publishesList: QueuedPublish[] = [];

      if (userId) {
        try {
          const { data: ideasData, error } = await supabase
            .from('content_ideas')
            .select(`
              id,
              angle,
              hook,
              status,
              trends:trend_id (title)
            `)
            .eq('creator_id', userId)
            .in('status', ['published', 'ready']);

          if (ideasData) {
            publishesList = ideasData.map((idea: any) => {
              const trendObj = Array.isArray(idea.trends) ? idea.trends[0] : idea.trends;
              return {
                id: idea.id,
                title: trendObj?.title || idea.angle || 'Untitled Video',
                platform: 'YouTube Shorts',
                scheduledFor: 'Auto scheduled',
                status: idea.status === 'published' ? 'published' : 'scheduled'
              };
            });
          }
        } catch (err) {
          console.error('Error fetching publishing history:', err);
        }
      }

      setPublishes(publishesList);
      setLoading(false);
    };

    fetchPublishes();
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
          Publishing Manager
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review scheduled video uploads, edit details, or check historical dispatch queues.
        </p>
      </div>

      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Calendar size={18} />
          Scheduled Queue
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {publishes.map(p => {
            const isPublished = p.status === 'published';
            const isFailed = p.status === 'failed';
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{p.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Platform: {p.platform} | Time: {p.scheduledFor}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: isPublished ? 'var(--success-glow)' : isFailed ? 'var(--error-glow)' : 'var(--warning-glow)',
                    color: isPublished ? 'var(--success)' : isFailed ? 'var(--error)' : 'var(--warning)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {p.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
