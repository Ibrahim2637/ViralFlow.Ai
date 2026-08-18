'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Sparkles, ArrowLeft, AlertTriangle, ShieldCheck, Play, HelpCircle, Film, Edit3, Save, ExternalLink
} from 'lucide-react';

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

export default function ScriptStudio() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'script' | 'factcheck'>('script');
  const [dbConfigured, setDbConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [renderQueued, setRenderQueued] = useState(false);

  // Script Studio state
  const [title, setTitle] = useState('Cursor AI vs Copilot Speed Test');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());

    // Seeding mock script content for the editor preview
    const seedScenes: Scene[] = [
      {
        id: 'scene-1',
        start: 0,
        end: 4,
        type: 'creator',
        text: "You're probably using AI code assistants the wrong way."
      },
      {
        id: 'scene-2',
        start: 4,
        end: 12,
        type: 'broll',
        text: "While Copilot autocompletes lines, Cursor AI can refactor entire directories in one prompt.",
        search: "developer typing coding speed laptop"
      },
      {
        id: 'scene-3',
        start: 12,
        end: 20,
        type: 'ai_video',
        text: "Here is the speed test: a full backend API built in just under two minutes.",
        prompt: "fast code generation terminal window matrix neon light overlay 9:16 vertical render"
      }
    ];

    const seedClaims: Claim[] = [
      {
        id: 'claim-1',
        text: "Cursor AI can edit multiple files simultaneously using agentic mode.",
        status: 'verified',
        sourceUrl: 'https://docs.cursor.com/composer',
        evidence: 'Cursor Composer handles multi-file edits simultaneously as documented in composer logs.'
      },
      {
        id: 'claim-2',
        text: "Cursor builds code 4 times faster than manual typing.",
        status: 'risky',
        sourceUrl: 'https://github.com/features/copilot',
        evidence: 'No quantitative, validated study supports a specific "4x" productivity increase. This is subjective marketing.'
      },
      {
        id: 'claim-3',
        text: "Cursor Editor operates on top of VS Code open source internals.",
        status: 'verified',
        sourceUrl: 'https://cursor.com',
        evidence: 'Cursor is built as a fork of VS Code, matching the editor schema.'
      }
    ];

    setScenes(seedScenes);
    setClaims(seedClaims);
  }, []);

  const handleSceneTextChange = (id: string, text: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, text } : s));
  };

  const handleSearchChange = (id: string, search: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, search } : s));
  };

  const handlePromptChange = (id: string, prompt: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, prompt } : s));
  };

  const triggerRender = async () => {
    setLoading(true);
    setRenderQueued(false);

    // Mock n8n call delay
    setTimeout(() => {
      setLoading(false);
      setRenderQueued(true);
      setTimeout(() => {
        setRenderQueued(false);
        router.push('/dashboard');
      }, 1500);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Save Notification Toast */}
      {renderQueued && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--success-glow)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100
        }}>
          <ShieldCheck size={20} />
          <span>Render job queued! n8n orchestrator triggered.</span>
        </div>
      )}

      {/* Header bar with Back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              Script Studio
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Edit generated scripts, tune visual prompt parameters, and inspect claim verification levels.
            </p>
          </div>
        </div>

        <button
          onClick={triggerRender}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Film size={18} />
          {loading ? 'Queuing Render...' : 'Render Video draft'}
        </button>
      </div>

      {/* Mobile Tab Swappper (hidden on desktop) */}
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
        
        {/* Left Column: Script Timeline (Visible in Desktop or active tab in Mobile) */}
        <section 
          className={`glass-panel script-timeline-pane ${activeTab === 'script' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Edit3 size={20} />
            <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Interactive Script Timeline</h2>
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
                        Pexels Stock Search query
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

        {/* Right Column: Fact check verification (Visible in Desktop or active tab in Mobile) */}
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
