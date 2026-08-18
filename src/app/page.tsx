'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Sparkles, TrendingUp, ShieldCheck, Film, ArrowRight, Database, Settings, 
  Cpu, GitMerge, BarChart2, CheckCircle2, ShieldAlert, Layers
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        try {
          const sessionObj = JSON.parse(demoSession);
          setIsLoggedIn(true);
          setUserEmail(sessionObj.user.email);
        } catch (e) {
          console.error(e);
        }
        return;
      }

      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          setUserEmail(session.user.email || '');
        }
      }
    };

    checkSession();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Navigation Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 40px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        zIndex: 10
      }} className="landing-header">
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--accent-primary)',
          fontSize: '1.5rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)'
        }}>
          <Sparkles size={24} />
          <span>ViralFlow AI</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="landing-nav-links">
          <Link href="/blog" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Blog
          </Link>
          <a href="#pricing" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Pricing
          </a>
          <a href="#contact" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Contact Us
          </a>
        </nav>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isLoggedIn ? (
            <>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Status: <span style={{ color: 'var(--success)' }}>Logged In</span>
              </span>
              <Link href="/dashboard" style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-glow)',
                transition: 'background-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
              >
                Launch Studio
              </Link>
              <button
                onClick={async () => {
                  localStorage.removeItem('demo-session');
                  if (isSupabaseConfigured()) {
                    await supabase.auth.signOut();
                  }
                  setIsLoggedIn(false);
                  setUserEmail('');
                }}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--error)',
                  cursor: 'pointer',
                  transition: 'opacity var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Sign In
              </Link>
              <Link href="/signup" style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-glow)',
                transition: 'background-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
              >
                Get Started
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 40px 24px',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        zIndex: 10
      }}>
        {/* Glow pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-glow)',
          border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '28px'
        }}>
          <Sparkles size={14} />
          Autonomous Content Agent for Creators
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '3.75rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          lineHeight: '1.15',
          letterSpacing: '-0.02em',
          marginBottom: '24px',
          maxWidth: '850px',
          margin: '0 auto 24px auto'
        }} className="landing-title">
          The Self-Improving{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Agentic AI
          </span>{' '}
          Content Pipeline
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          maxWidth: '700px',
          margin: '0 auto 40px auto'
        }} className="landing-desc">
           ViralFlow AI doesn't just create videos—it makes decisions. An always-on AI team that scout trends, 
          scripts content in your voice, audits facts, compiles renders, and learns from results.
        </p>

        {/* Primary CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '80px' }}>
          <Link href={isLoggedIn ? "/dashboard" : "/signup"} style={{
            padding: '16px 36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            fontSize: '1.05rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-glow)',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
          >
            Launch Creator Studio
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Workflow Section: Detailed Agentic Loop */}
      <section style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '12px' }}>
              How the Agentic Loop Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Each step of the production cycle is managed by a dedicated, specialized AI agent executing inside n8n workflows.
            </p>
          </div>

          {/* Steps Timeline Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }} className="workflow-grid-4">
            
            {/* Step 1 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Phase 01</span>
                <TrendingUp size={20} style={{ color: 'var(--accent-secondary)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Trend Scouting</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                The **Scout Agent** polls YouTube searches and RSS feeds, importing metadata to find emerging topics before they reach saturation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Phase 02</span>
                <Cpu size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Momentum Scoring</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                The **Analyst Agent** grades trends on a 1-100 scale using metrics for momentum, audience novelty, and production feasibility.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase' }}>Phase 03</span>
                <Settings size={20} style={{ color: 'var(--success)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>DNA Alignment</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                The **Strategy Agent** filters ideas based on your creator profile rules, audience interests, tone constraints, and vocabulary parameters.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase' }}>Phase 04</span>
                <Sparkles size={20} style={{ color: 'var(--warning)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Scripting & Hooks</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                The **Writer Agent** creates a scene-by-scene script detailing timelines, voiceovers, background B-roll keywords, and caption layouts.
              </p>
            </div>

            {/* Step 5 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 700, textTransform: 'uppercase' }}>Phase 05</span>
                <ShieldCheck size={20} style={{ color: 'var(--error)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Fact & Policy Audit</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                The **Quality Agent** validates claims inside scripts against verified search sources and flags violations or risky assertions before rendering.
              </p>
            </div>

            {/* Step 6 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Phase 06</span>
                <Layers size={20} style={{ color: 'var(--accent-secondary)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Producer Assembly</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                The **Media Agent** searches Pexels APIs for scene clips, synthesizes voiceovers (ElevenLabs/Piper), and generates caption timing files.
              </p>
            </div>

            {/* Step 7 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Phase 07</span>
                <Film size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>FFmpeg Rendering</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                The **Editor Worker** crops clips to 9:16 layout, applies text filters, overlay avatar/voice, and compiles the final MP4 video draft.
              </p>
            </div>

            {/* Step 8 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase' }}>Phase 08</span>
                <GitMerge size={20} style={{ color: 'var(--success)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Closed-Loop Learn</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Following publishing, the **Learning Agent** monitors retention metrics, saves insights, and updates your Creator DNA configuration.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Tech Stack Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '12px' }}>
            Built With Open & Reliable Tools
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            ViralFlow AI integrates standard developer components with local and cloud APIs.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px'
        }} className="workflow-grid-3">
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--accent-glow)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)', flexShrink: 0 }}>
              <Database size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Supabase Postgres</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Enforces row-level privacy and manages structured schemas linking scripts, DNA history, and publishing logs.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--accent-glow)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-secondary)', flexShrink: 0 }}>
              <Cpu size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>n8n Workflows</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Coordinates API requests, triggers background render jobs, and executes the agentic scoring loops.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--accent-glow)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--success)', flexShrink: 0 }}>
              <Film size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>FFmpeg Rendering</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Processes video compiles locally or in containers, resizing, cropping, mixing sound, and overlaying text.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '100px 24px 80px 24px', maxWidth: '1100px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-glow)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            Flexible Plans
          </div>
          <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '12px' }}>
            Choose Your Content Output Velocity
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Scale your content output effortlessly. Choose the pipeline that fits your workflow.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="workflow-grid-3">
          {/* Starter Plan */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Creator Sandbox</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Perfect for testing the autonomous scripting pipeline.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$0</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month</span>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', margin: '0', listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> 10 Autonomous drafts/mo</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Basic trend scanning (RSS only)</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Local render worker access</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Standard voice synthesis</li>
            </ul>
            <Link href={isLoggedIn ? "/dashboard" : "/signup"} style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', cursor: 'pointer', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              Get Started Free
            </Link>
          </div>

          {/* Growth Plan */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid var(--accent-primary)', position: 'relative', boxShadow: 'var(--shadow-glow)' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--accent-primary)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Most Popular
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Viral Engine</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>For serious creators publishing daily structured shorts.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$49</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month</span>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', margin: '0', listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Unlimited Gemini 1.5 Pro drafts</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Youtube + RSS trend crawling</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> 50 Cloud MP4 Renders / mo</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> ElevenLabs custom voice cloning</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Auto-publishing integrations</li>
            </ul>
            <Link href={isLoggedIn ? "/dashboard" : "/signup"} style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-primary)', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', cursor: 'pointer', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-primary)'; }}>
              Scale Now
            </Link>
          </div>

          {/* Scale Plan */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Creator Studio</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>For media channels and agencies running multi-voice hubs.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$149</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month</span>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', margin: '0', listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Dedicated GPU render clusters</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Unlimited cloud rendering runs</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Up to 5 cloned voices configured</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Custom n8n workflow triggers</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Dedicated account manager support</li>
            </ul>
            <Link href={isLoggedIn ? "/dashboard" : "/signup"} style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', cursor: 'pointer', transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '80px 24px', maxWidth: '600px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-glow)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            Get In Touch
          </div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
            Contact Our Platform Team
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Have questions about workflow integration, custom render configurations, or team access?
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you for reaching out! Our team will get back to you shortly.");
            e.currentTarget.reset();
          }}
          className="glass-panel" 
          style={{ borderRadius: 'var(--radius-lg)', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Your name" 
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              type="email" 
              required
              placeholder="you@email.com" 
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Message</label>
            <textarea 
              required
              rows={4}
              placeholder="How can we help scale your workflow?" 
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-primary)', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', border: 'none', transition: 'all var(--transition-fast)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '32px 40px',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }} className="landing-footer-container">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            &copy; 2026 ViralFlow AI. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Link href="/login" style={{ transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Creator Log In
            </Link>
            <Link href="/signup" style={{ transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Studio Register
            </Link>
          </div>
        </div>
      </footer>


    </div>
  );
}
