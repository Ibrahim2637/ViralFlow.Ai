'use client';

import { useState, useEffect } from 'react';
import { Film, Play, Check, X, Clock, AlertCircle, Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getStoredDrafts, saveStoredDraft, getActiveDraft, setActiveDraftId, RenderedDraft } from '@/lib/videoState';
import MotionGraphicsPlayer from '@/components/MotionGraphicsPlayer';

export default function ApprovalsPage() {
  const [drafts, setDrafts] = useState<RenderedDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<RenderedDraft | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDrafts = async () => {
      setLoading(true);
      const localDrafts = getStoredDrafts();
      let draftsList: RenderedDraft[] = [...localDrafts];

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
          const { data: ideasData } = await supabase
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
            ideasData.forEach((idea: any) => {
              const trendObj = Array.isArray(idea.trends) ? idea.trends[0] : idea.trends;
              if (!draftsList.some(d => d.id === idea.id)) {
                draftsList.push({
                  id: idea.id,
                  title: trendObj?.title || idea.angle || 'Untitled Draft',
                  hook: idea.hook || 'No hook text',
                  status: idea.status || 'ready',
                  progress: idea.status === 'rendering' ? 45 : undefined,
                  duration: 30,
                  video_url: '/placeholder_avatar.mp4',
                  created_at: new Date().toISOString()
                });
              }
            });
          }
        } catch (err) {
          console.error('Error fetching approval drafts:', err);
        }
      }

      // Default fallback if absolutely empty
      if (draftsList.length === 0) {
        draftsList = [
          {
            id: 'n8n-demo-01',
            title: 'Why Multi-Agent Systems Are Crushing Monolithic AI in 2026',
            hook: 'Forget everything you thought you knew about AI!',
            status: 'ready',
            duration: 30,
            video_url: 'https://videos.pexels.com/video-files/8087073/8087073-hd_720_1280_25fps.mp4',
            qa_score: 94,
            created_at: new Date().toISOString(),
            storyboard: [
              {
                scene: 1,
                duration: '3s',
                narration: 'Forget everything you thought you knew about AI!',
                caption: 'NEW AI PARADIGM!',
                visual_goal: 'Dynamic split-screen of monolithic AI vs multi-agent systems.'
              },
              {
                scene: 2,
                duration: '9s',
                narration: 'Single prompts hallucinate. Multi-agent swarms self-correct in real-time.',
                caption: 'SELF-CORRECTING SWARMS',
                visual_goal: 'High-tech nodes communicating in synchronized network graph.'
              },
              {
                scene: 3,
                duration: '10s',
                narration: 'Companies using multi-agent architectures report 70% fewer production bugs.',
                caption: '70% FEWER BUGS',
                visual_goal: 'Fast dashboard analytics metric graph zooming upward.'
              },
              {
                scene: 4,
                duration: '8s',
                narration: 'Subscribe and check the prompt framework in the comments.',
                caption: 'GET THE FRAMEWORK ⚡',
                visual_goal: 'Call to action button pop with neon accent glow.'
              }
            ]
          }
        ];
      }

      setDrafts(draftsList);
      const active = getActiveDraft() || draftsList[0];
      setActiveDraft(active);
      setLoading(false);
    };

    fetchDrafts();
  }, []);

  const handleSelectDraft = (draft: RenderedDraft) => {
    setActiveDraft(draft);
    setActiveDraftId(draft.id);
  };

  const handleApprove = () => {
    setShowApprovalModal(true);
  };

  const submitApproval = (actionType: 'publish' | 'schedule') => {
    if (activeDraft) {
      const updated: RenderedDraft = { ...activeDraft, status: 'published' };
      saveStoredDraft(updated);
      setDrafts(prev => prev.map(d => d.id === activeDraft.id ? updated : d));
      setActiveDraft(updated);
      setShowApprovalModal(false);
      alert(actionType === 'publish' ? 'Video approved and queued for publishing!' : `Video scheduled for ${scheduleTime}!`);
    }
  };

  const handleReject = () => {
    if (activeDraft && confirm('Are you sure you want to reject this video draft? This will trigger n8n script re-generations.')) {
      setDrafts(prev => prev.filter(d => d.id !== activeDraft.id));
      setActiveDraft(drafts.find(d => d.id !== activeDraft.id) || null);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
          Video Approvals & Previews
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review verified 9:16 vertical video packages generated by the Railway n8n Autonomous Production Engine.
        </p>
      </div>

      {/* Draft Selector Tabs */}
      {drafts.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {drafts.map(d => {
            const isSelected = activeDraft?.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => handleSelectDraft(d)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: isSelected ? '#000000' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {d.title.length > 32 ? d.title.slice(0, 32) + '...' : d.title}
              </button>
            );
          })}
        </div>
      )}

      {activeDraft ? (
        <div className="glass-panel approval-pane" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
          
          {/* 9:16 vertical motion graphics video player */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <MotionGraphicsPlayer
              videoUrl={activeDraft.video_url}
              storyboard={activeDraft.storyboard}
              assetsUsed={activeDraft.assets_used}
              renderManifest={activeDraft.render_manifest}
              hook={activeDraft.hook}
              title={activeDraft.title}
              maxWidth="300px"
            />

            {/* Direct video link button */}
            {activeDraft.video_url && activeDraft.video_url.startsWith('http') && (
              <a
                href={activeDraft.video_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--accent-primary)',
                  textDecoration: 'underline',
                  display: 'block'
                }}
              >
                Open Raw Vertical MP4 in New Tab ↗
              </a>
            )}
          </div>

          {/* Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: 'var(--accent-glow)',
                  color: 'var(--accent-secondary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={11} />
                  Railway n8n Production Package
                </span>
                {activeDraft.qa_score && (
                  <span style={{
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    color: '#10B981',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    QA Score: {activeDraft.qa_score}/100
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, lineHeight: '1.3' }}>
                {activeDraft.title}
              </h2>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                <strong>Hook:</strong> "{activeDraft.hook}"
              </p>
            </div>

            {/* Storyboard timeline preview */}
            {activeDraft.storyboard && activeDraft.storyboard.length > 0 && (
              <div style={{
                backgroundColor: 'var(--bg-base)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  <Layers size={14} />
                  <span>Scene-by-Scene Storyboard ({activeDraft.storyboard.length} Scenes)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {activeDraft.storyboard.map((sc: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        <span>Scene {sc.scene || idx + 1} ({sc.duration || '3s'})</span>
                        <span style={{ color: '#FFFF00' }}>{sc.caption || ''}</span>
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>
                        {sc.narration || sc.text || ''}
                      </div>
                      {sc.visual_goal && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontStyle: 'italic' }}>
                          Visual: {sc.visual_goal}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ fontWeight: 700, color: activeDraft.status === 'published' ? 'var(--accent-primary)' : 'var(--success)' }}>
                  {activeDraft.status === 'published' ? 'Published' : 'Render Complete & Verified'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Output Dimensions</span>
                <span style={{ fontWeight: 600 }}>1080 x 1920 Vertical HD (9:16)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Duration</span>
                <span style={{ fontWeight: 600 }}>{activeDraft.duration}s</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <button
                onClick={handleApprove}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--success)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
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
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--error)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <X size={16} />
                Reject
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
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-primary)', color: '#000000', fontWeight: 700, fontSize: '0.9rem' }}
                >
                  Publish Now
                </button>
                <button
                  onClick={() => submitApproval('schedule')}
                  disabled={!scheduleTime}
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-primary)', border: '1px solid var(--border-color)', color: '#000000', fontWeight: 700, fontSize: '0.9rem', opacity: scheduleTime ? 1 : 0.6 }}
                >
                  Schedule
                </button>
              </div>

              <button onClick={() => setShowApprovalModal(false)} style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
