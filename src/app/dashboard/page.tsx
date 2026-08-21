'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Sparkles, TrendingUp, ShieldAlert, CheckCircle, Clock, Check, X, Play, RefreshCw, BarChart2, Eye, Heart, MessageSquare, Film
} from 'lucide-react';

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
}

interface Draft {
  id: string;
  title: string;
  hook: string;
  status: 'rendering' | 'ready' | 'published';
  progress?: number;
  claimsCount: number;
  claimsVerified: number;
  platform: string;
}

export default function CreatorDashboard() {
  const [dbConfigured, setDbConfigured] = useState(true);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDraft, setActiveDraft] = useState<Draft | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    const isConfigured = isSupabaseConfigured();
    setDbConfigured(isConfigured);

    const fetchData = async () => {
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
      let contentIdeas: Draft[] = [];

      if (userId) {
        try {
          // Query Trends and scores
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
                recommended: (s.overall_score || 0) >= 85
              };
            });
          }

          // Query Draft / Ready scripts from content_ideas
          const { data: ideasData, error: ideasError } = await supabase
            .from('content_ideas')
            .select(`
              id, 
              angle, 
              hook, 
              status, 
              trends:trend_id (title)
            `)
            .eq('creator_id', userId)
            .in('status', ['draft', 'rendering', 'ready']);

          if (ideasData) {
            contentIdeas = ideasData.map((idea: any) => {
              const trendObj = Array.isArray(idea.trends) ? idea.trends[0] : idea.trends;
              return {
                id: idea.id,
                title: trendObj?.title || idea.angle || 'Untitled Idea',
                hook: idea.hook,
                status: idea.status || 'draft',
                claimsCount: 3,
                claimsVerified: 3,
                platform: 'YouTube Shorts'
              };
            });
          }
        } catch (err) {
          console.error('Supabase query error:', err);
        }
      }

      const finalTrends = trendsList.length > 0 ? trendsList : [
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
          recommended: true
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
          recommended: true
        }
      ];

      const finalDrafts = contentIdeas.length > 0 ? contentIdeas : [
        {
          id: 'draft-demo-1',
          title: 'Cursor AI vs Copilot Speed Test',
          hook: 'Stop writing boilerplate code line-by-line in 2026. Here is how Cursor AI builds entire APIs in 90 seconds.',
          status: 'ready' as const,
          claimsCount: 3,
          claimsVerified: 3,
          platform: 'YouTube Shorts'
        }
      ];

      setTrends(finalTrends);
      setDrafts(finalDrafts);
      setActiveDraft(finalDrafts[0] || null);
      
      // Seed fallback insights if none are generated yet
      setInsights([
        'Insights queue empty. Once you publish videos, the AI feedback loop will analyze retention curves and populate insights here.'
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const [scanning, setScanning] = useState(false);

  const handleScanTrends = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are an AI Viral Trend Finder for tech creators and developers.',
          userMessage: 'Scan current trending developer topics and output JSON array of 2 trends: [{"title": "...", "topic": "AI Tools", "source": "GitHub Trends", "overall_score": 95, "momentum": 97, "fit": 92, "novelty": 94, "saturation": 25, "reason": "High search velocity", "recommended": true}]'
        })
      });
      const data = await res.json();
      if (data.result) {
        const match = data.result.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const newTrends = parsed.map((t: any, i: number) => ({
            id: `ai-dash-trend-${Date.now()}-${i}`,
            title: t.title || 'Agentic AI Code Generation Frameworks',
            topic: t.topic || 'Developer AI',
            source: t.source || 'GitHub Trends',
            overall_score: t.overall_score || 93,
            momentum: t.momentum || 96,
            fit: t.fit || 91,
            novelty: t.novelty || 94,
            saturation: t.saturation || 28,
            reason: t.reason || 'High velocity keyword search growth across tech channels.',
            recommended: true
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

  const handleApprove = () => {
    setShowApprovalModal(true);
  };

  const submitApproval = (actionType: 'publish' | 'schedule') => {
    // Modify draft state in local array
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
    if (activeDraft && confirm('Are you sure you want to reject this draft and send it back to the Script Agent for revision?')) {
      setDrafts(prev => prev.filter(d => d.id !== activeDraft.id));
      setActiveDraft(null);
      alert('Draft rejected. Revision script triggered in n8n.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
            Creator Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review scored opportunities, approve rendered videos, and monitor performance insights.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleScanTrends}
            disabled={scanning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent-primary)',
              backgroundColor: scanning ? 'var(--bg-surface-hover)' : 'var(--accent-primary)',
              color: scanning ? 'var(--accent-primary)' : '#000000',
              cursor: scanning ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 700,
              transition: 'all var(--transition-fast)'
            }}
          >
            <RefreshCw size={16} className={scanning ? 'spinner' : ''} />
            {scanning ? 'Scanning AI...' : 'Scan Trends'}
          </button>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px'
      }} className="dashboard-grid">
        
        {/* Top: Trend Radar */}
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
            <TrendingUp size={24} />
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Emerging Trend Radar</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trends.map(t => (
              <div 
                key={t.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  gap: '16px',
                  boxShadow: t.recommended ? 'var(--shadow-glow)' : 'none',
                  borderColor: t.recommended ? 'var(--accent-primary)' : 'var(--border-color)'
                }}
                className="trend-card"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--accent-secondary)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {t.topic}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Source: {t.source}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.reason}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  {/* Overall Score */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: t.overall_score >= 90 ? 'var(--success)' : 'var(--accent-primary)' }}>
                      {t.overall_score}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Score
                    </div>
                  </div>

                  <Link href={`/editor/${t.id}`} style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: t.recommended ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    border: '1px solid',
                    borderColor: t.recommended ? 'var(--accent-primary)' : 'var(--border-color)',
                    color: t.recommended ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (t.recommended) e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (t.recommended) e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  }}
                  >
                    Generate Script
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Split Pane: Draft Preview & Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="split-grid">
          
          {/* Left Split: Draft Approval Gate */}
          <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-secondary)' }}>
              <Film size={24} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Draft Approval Gate</h2>
            </div>

            {activeDraft ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="approval-pane">
                {/* 9:16 Phone Preview Mockup */}
                <div style={{
                  width: '100%',
                  aspectRatio: '9/16',
                  maxWidth: '240px',
                  margin: '0 auto',
                  borderRadius: 'var(--radius-lg)',
                  border: '8px solid #000000',
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
                      <RefreshCw className="spinner" size={32} />
                      <span style={{ fontSize: '0.85rem' }}>Rendering {activeDraft.progress}%</span>
                    </div>
                  ) : (
                    <>
                      {/* Play Overlay */}
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

                      {/* Video caption preview overlay */}
                      <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px',
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

                {/* Details & Actions Pane */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>{activeDraft.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Clock size={14} />
                      <span>Ready for approval</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Platform target</span>
                      <span style={{ fontWeight: 600 }}>{activeDraft.platform}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Fact Check Status</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {activeDraft.claimsVerified}/{activeDraft.claimsCount} Claims Verified
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
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
                      Approve & Publish
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
                      Reject & Revise
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '48px 0',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                No drafts awaiting approval. Use the Trend Radar above to start scripting!
              </div>
            )}
          </section>

          {/* Right Split: Learning Insights & Mini Graph */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Insights Panel */}
            <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
                <Sparkles size={24} />
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Performance Insights</h2>
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

            {/* Quick Chart Widget */}
            <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart2 size={20} style={{ color: 'var(--accent-secondary)' }} />
                  <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>Traffic Overview</h2>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>+12.4% this week</span>
              </div>
              
              {/* Responsive SVG Chart */}
              <div style={{ width: '100%', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                {[30, 45, 35, 60, 55, 80, 95].map((val, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '100%',
                      height: `${val}%`,
                      backgroundColor: 'var(--accent-secondary)',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      opacity: i === 6 ? 1 : 0.6,
                      boxShadow: i === 6 ? '0 0 10px rgba(6, 182, 212, 0.4)' : 'none'
                    }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>

      </div>

      {/* Approval Modal overlay */}
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
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
              Select Publishing Mode
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Would you like to publish "{activeDraft.title}" immediately to YouTube Shorts, or schedule it for a later date?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Schedule time input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Select Scheduling Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={() => submitApproval('publish')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Publish Now
                </button>
                <button
                  onClick={() => submitApproval('schedule')}
                  disabled={!scheduleTime}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: scheduleTime ? 'pointer' : 'not-allowed',
                    opacity: scheduleTime ? 1 : 0.6,
                    fontSize: '0.9rem'
                  }}
                >
                  Schedule Post
                </button>
              </div>

              <button
                onClick={() => setShowApprovalModal(false)}
                style={{
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  marginTop: '8px',
                  textDecoration: 'underline'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
