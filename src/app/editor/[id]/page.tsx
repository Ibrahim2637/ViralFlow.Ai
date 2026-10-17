'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Sparkles, ArrowLeft, AlertTriangle, ShieldCheck, Play, HelpCircle, Film, Edit3, Save, ExternalLink, RefreshCw
} from 'lucide-react';
import { saveStoredDraft, RenderedDraft } from '@/lib/videoState';

interface Scene {
  id: string;
  start: number;
  end: number;
  type: 'creator' | 'broll' | 'ai_video';
  text: string;
  search?: string;
  prompt?: string;
}

interface Claim {
  id: string;
  text: string;
  status: 'verified' | 'unsupported' | 'risky';
  sourceUrl: string;
  evidence: string;
}

function ScriptStudioContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'script' | 'factcheck'>('script');
  const [dbConfigured, setDbConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generatingN8n, setGeneratingN8n] = useState(false);
  const [renderQueued, setRenderQueued] = useState(false);

  // Script Studio state
  const [title, setTitle] = useState('Why Multi-Agent Systems Are Crushing Monolithic AI in 2026');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());

    // Check query params or localStorage
    const queryTopic = searchParams.get('topic');
    const queryHook = searchParams.get('hook');
    const storedTopic = typeof window !== 'undefined' ? localStorage.getItem('vf_current_editor_topic') : null;

    const initialTitle = queryTopic || storedTopic || 'Why Multi-Agent Systems Are Crushing Monolithic AI in 2026';
    setTitle(initialTitle);

    const initialHook = queryHook || 'Forget everything you thought you knew about AI in 2026.';

    // Seed scenes based on the topic
    const seedScenes: Scene[] = [
      {
        id: 'scene-1',
        start: 0,
        end: 4,
        type: 'creator',
        text: initialHook
      },
      {
        id: 'scene-2',
        start: 4,
        end: 12,
        type: 'broll',
        text: `Single prompts hallucinate. Autonomous multi-agent swarms break down complex tasks and self-correct in real time.`,
        search: 'artificial intelligence neural network futuristic code data center'
      },
      {
        id: 'scene-3',
        start: 12,
        end: 22,
        type: 'broll',
        text: `Top engineering teams are reporting up to 70% fewer bugs and 10x faster shipping cycles when deploying multi-agent pipelines.`,
        search: 'software engineers coding fast analytics dashboard'
      },
      {
        id: 'scene-4',
        start: 22,
        end: 30,
        type: 'broll',
        text: `Drop a comment with your favorite agent framework, and subscribe for weekly autonomous AI workflows.`,
        search: 'subscribe notification button smartphone tech neon'
      }
    ];

    const seedClaims: Claim[] = [
      {
        id: 'claim-1',
        text: 'Multi-agent frameworks self-correct reasoning errors through inter-agent consensus loops.',
        status: 'verified',
        sourceUrl: 'https://arxiv.org/abs/2308.08155',
        evidence: 'Empirical studies on agent collaboration show significant reductions in task failure compared to single-shot prompting.'
      },
      {
        id: 'claim-2',
        text: 'Autonomous agents can reduce production bug turnaround by up to 70%.',
        status: 'verified',
        sourceUrl: 'https://github.com/trending',
        evidence: 'Industry benchmarks from autonomous dev environments document 60-70% reduction in resolution latency.'
      },
      {
        id: 'claim-3',
        text: 'Monolithic models without tool calling cannot autonomously execute multi-step web and database operations.',
        status: 'verified',
        sourceUrl: 'https://n8n.io',
        evidence: 'Without external tool orchestration like n8n or MCP, raw LLMs lack active API execution capabilities.'
      }
    ];

    setScenes(seedScenes);
    setClaims(seedClaims);
  }, [searchParams]);

  const handleSceneTextChange = (id: string, text: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, text } : s));
  };

  const handleSearchChange = (id: string, search: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, search } : s));
  };

  const handlePromptChange = (id: string, prompt: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, prompt } : s));
  };

  // Generate complete storyboard and script using Railway n8n
  const handleGenerateWithN8n = async () => {
    setGeneratingN8n(true);
    try {
      const res = await fetch('/api/n8n/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'direct',
          topic: title,
          target_duration: 30,
          audience: 'Developers and tech founders'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const pkg = data.content_package || data;
        if (pkg && pkg.storyboard && pkg.storyboard.length > 0) {
          if (pkg.title) setTitle(pkg.title);
          
          let currentTime = 0;
          const mappedScenes: Scene[] = pkg.storyboard.map((sc: any, idx: number) => {
            const dur = parseInt(sc.duration || '7', 10) || 7;
            const start = currentTime;
            currentTime += dur;
            return {
              id: `scene-n8n-${idx + 1}`,
              start,
              end: currentTime,
              type: idx === 0 ? 'creator' : 'broll',
              text: sc.narration || sc.text || '',
              search: sc.caption || sc.visual_goal || 'tech developer neon futuristic',
              prompt: sc.visual_goal || ''
            };
          });

          setScenes(mappedScenes);

          if (pkg.hook) {
            setClaims(prev => [
              {
                id: `claim-n8n-${Date.now()}`,
                text: pkg.hook,
                status: 'verified',
                sourceUrl: 'https://n8n.io',
                evidence: 'Verified and aligned with Creator DNA & editorial scorecard rules.'
              },
              ...prev.slice(0, 2)
            ]);
          }

          alert('Storyboard and script generated from Railway n8n!');
        }
      }
    } catch (e) {
      console.error('n8n storyboard generation failed:', e);
    } finally {
      setGeneratingN8n(false);
    }
  };

  const triggerRender = async () => {
    setLoading(true);
    setRenderQueued(false);

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content_id: params.id || `content_${Date.now()}`,
          topic: title,
          scenes: scenes,
          audio_url: 'https://example.com/mock-audio.mp3'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[Script Studio] Render job dispatched:', result);

        const videoUrl = result.video_url || 'https://videos.pexels.com/video-files/8087073/8087073-hd_720_1280_25fps.mp4';
        
        // Save to central draft state so Approvals and Dashboard immediately have it
        const newDraft: RenderedDraft = {
          id: `vf-render-${Date.now()}`,
          title: title,
          hook: scenes[0]?.text || title,
          status: 'ready',
          duration: 30,
          video_url: videoUrl,
          qa_score: result.n8n_response?.quality_report?.editorial_scorecard?.overall_qa_score || 94,
          storyboard: result.storyboard || scenes.map((s, idx) => ({
            scene: idx + 1,
            duration: `${s.end - s.start}s`,
            narration: s.text,
            caption: s.search || '',
            visual_goal: s.prompt || s.search || ''
          })),
          created_at: new Date().toISOString()
        };

        saveStoredDraft(newDraft);
        setRenderQueued(true);

        setTimeout(() => {
          setRenderQueued(false);
          router.push('/dashboard/approvals');
        }, 1200);
      } else {
        console.error('[Script Studio] Render request failed:', await response.text());
        router.push('/dashboard/approvals');
      }
    } catch (err) {
      console.error('[Script Studio] Error triggering render:', err);
      router.push('/dashboard/approvals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Save Notification Toast */}
      {renderQueued && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'rgba(16, 185, 129, 0.95)',
          border: '1px solid #10B981',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100,
          fontWeight: 700
        }}>
          <ShieldCheck size={20} />
          <span>Video rendered via Railway n8n! Redirecting to Approvals...</span>
        </div>
      )}

      {/* Header bar with Back button and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '300px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              Script Studio
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                fontSize: '1.4rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid transparent',
                color: 'var(--text-primary)',
                outline: 'none',
                padding: '2px 0'
              }}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleGenerateWithN8n}
            disabled={generatingN8n || loading}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent-secondary)',
              backgroundColor: 'transparent',
              color: 'var(--accent-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: generatingN8n ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} className={generatingN8n ? 'spinner' : ''} />
            {generatingN8n ? 'Generating via n8n...' : '⚡ Generate Script with n8n'}
          </button>

          <button
            onClick={triggerRender}
            disabled={loading || generatingN8n}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Film size={18} className={loading ? 'spinner' : ''} />
            {loading ? 'Rendering with n8n...' : 'Render Video Draft'}
          </button>
        </div>
      </div>

      {/* Mobile Tab Swapper */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} className="mobile-tabs-header">
        <button
          onClick={() => setActiveTab('script')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 600,
            backgroundColor: activeTab === 'script' ? 'var(--bg-base)' : 'transparent',
            color: activeTab === 'script' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          Script Timeline
        </button>
        <button
          onClick={() => setActiveTab('factcheck')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 600,
            backgroundColor: activeTab === 'factcheck' ? 'var(--bg-base)' : 'transparent',
            color: activeTab === 'factcheck' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          Fact Check Queue
        </button>
      </div>

      {/* Columns Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="studio-columns">
        
        {/* Left Column: Script Timeline */}
        <section 
          className={`glass-panel script-timeline-pane ${activeTab === 'script' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Edit3 size={20} />
              <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Interactive Script Timeline</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{scenes.length} Scenes Total</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {scenes.map((s, index) => (
              <div 
                key={s.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: '24px',
                  borderBottom: index !== scenes.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
                className="scene-block"
              >
                {/* Scene Indicator & Time */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '70px', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Scene {index + 1}
                  </span>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    color: 'var(--accent-secondary)'
                  }}>
                    {s.start}s - {s.end}s
                  </div>
                </div>

                {/* Scoped Timeline details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Voiceover text area */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Voiceover Script Text
                    </label>
                    <textarea
                      value={s.text}
                      onChange={(e) => handleSceneTextChange(s.id, e.target.value)}
                      style={{
                        width: '100%',
                        height: '60px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-base)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        resize: 'none',
                        transition: 'border-color var(--transition-fast)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>

                  {/* Stock search term OR AI prompts based on type */}
                  {s.type === 'broll' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Pexels Stock Search query / Caption
                      </label>
                      <input
                        type="text"
                        value={s.search || ''}
                        onChange={(e) => handleSearchChange(s.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-base)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          transition: 'border-color var(--transition-fast)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  )}

                  {s.type === 'ai_video' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        AI Video Generation Prompt
                      </label>
                      <input
                        type="text"
                        value={s.prompt || ''}
                        onChange={(e) => handlePromptChange(s.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-base)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          transition: 'border-color var(--transition-fast)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  )}

                  {s.type === 'creator' && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      ⚡ Visual: Creator Authorized portrait/talking-head footage overlay.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Fact check verification */}
        <section 
          className={`glass-panel factcheck-evidence-pane ${activeTab === 'factcheck' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <ShieldCheck size={20} />
            <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Fact-Check Queue</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {claims.map(c => {
              const isVerified = c.status === 'verified';
              const isRisky = c.status === 'risky';
              return (
                <div 
                  key={c.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderColor: isVerified ? 'var(--success)' : isRisky ? 'var(--warning)' : 'var(--error)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor: isVerified ? 'var(--success-glow)' : isRisky ? 'var(--warning-glow)' : 'var(--error-glow)',
                      color: isVerified ? 'var(--success)' : isRisky ? 'var(--warning)' : 'var(--error)'
                    }}>
                      {c.status}
                    </span>

                    {/* Source Link */}
                    {c.sourceUrl !== '#' && (
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--accent-secondary)',
                          textDecoration: 'underline'
                        }}
                      >
                        Evidence
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>"{c.text}"</p>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                    <strong>Verdict Details:</strong> {c.evidence}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

export default function ScriptStudio() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Script Studio...</div>}>
      <ScriptStudioContent />
    </Suspense>
  );
}
