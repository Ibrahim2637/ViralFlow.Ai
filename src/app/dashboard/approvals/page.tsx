'use client';

import { useState, useEffect } from 'react';
import { Film, Play, Check, X, Clock, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
interface RenderDraft {
  id: string;
  title: string;
  hook: string;
  status: 'rendering' | 'ready' | 'published';
  progress?: number;
  duration: number;
}

export default function ApprovalsPage() {
  const [drafts, setDrafts] = useState<RenderDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<RenderDraft | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDrafts = async () => {
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

      let draftsList: RenderDraft[] = [];

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
            .in('status', ['ready', 'rendering']);

          if (ideasData) {
            draftsList = ideasData.map((idea: any) => {
              const trendObj = Array.isArray(idea.trends) ? idea.trends[0] : idea.trends;
              return {
                id: idea.id,
                title: trendObj?.title || idea.angle || 'Untitled Draft',
                hook: idea.hook || 'No hook text',
                status: idea.status || 'ready',
                progress: idea.status === 'rendering' ? 45 : undefined,
                duration: 45
              };
            });
          }
        } catch (err) {
          console.error('Error fetching approval drafts:', err);
        }
      }

      setDrafts(draftsList);
      setActiveDraft(draftsList[0] || null);
      setLoading(false);
    };

    fetchDrafts();
  }, []);

  const handleApprove = () => {
    setShowApprovalModal(true);
  };

  const submitApproval = (actionType: 'publish' | 'schedule') => {
    if (activeDraft) {
      setDrafts(prev => prev.map(d => {
        if (d.id === activeDraft.id) {
          return { ...d, status: 'published' };
        }
        return d;
      }));
      setActiveDraft(null);
      setShowApprovalModal(false);
      alert(actionType === 'publish' ? 'Video approved and queued for publishing!' : `Video scheduled for ${scheduleTime}!`);
    }
  };

  const handleReject = () => {
    if (activeDraft && confirm('Are you sure you want to reject this video draft? This will trigger n8n script re-generations.')) {
      setDrafts(prev => prev.filter(d => d.id !== activeDraft.id));
      setActiveDraft(null);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
          Video Approvals & Previews
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Preview fully compiled 9:16 layout vertical video outputs and authorize drafts for upload dispatch.
        </p>
      </div>

      {activeDraft ? (
        <div className="glass-panel approval-pane" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* 9:16 vertical player mockup */}
          <div style={{
            width: '100%',
            aspectRatio: '9/16',
            maxWidth: '260px',
            margin: '0 auto',
            borderRadius: 'var(--radius-lg)',
            border: '10px solid #000000',
            backgroundColor: '#000000',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {activeDraft.status === 'rendering' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
                <span className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#ffffff', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.85rem' }}>Rendering {activeDraft.progress}%</span>
              </div>
            ) : (
              <>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000000'
                  }}>
                    <Play size={20} style={{ marginLeft: '4px' }} />
                  </div>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  "{activeDraft.hook}"
                </div>
              </>
            )}
          </div>

          {/* Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '8px' }}>
                {activeDraft.title}
              </h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-glow)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                <Clock size={12} />
                <span>Ready for Approval ({activeDraft.duration}s)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ fontWeight: 600, color: 'var(--success)' }}>Render Complete</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Resolution</span>
                <span style={{ fontWeight: 600 }}>1080 x 1920 (9:16)</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
              <button
                onClick={handleApprove}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--success)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Check size={18} />
                Approve & Publish Post
              </button>
              <button
                onClick={handleReject}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--error)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error-glow)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={18} />
                Reject & Revise Script
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p>No video drafts require manual approval gates right now.</p>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && activeDraft && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', borderRadius: 'var(--radius-lg)', padding: '36px' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
              Publishing Options
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Do you want to push "{activeDraft.title}" live now, or queue it for automated scheduled posting?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Scheduled Time</label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => submitApproval('publish')}
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-primary)', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  Publish Now
                </button>
                <button
                  onClick={() => submitApproval('schedule')}
                  disabled={!scheduleTime}
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', opacity: scheduleTime ? 1 : 0.6 }}
                >
                  Schedule
                </button>
              </div>

              <button onClick={() => setShowApprovalModal(false)} style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
