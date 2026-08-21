'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import CyberCanvas3D from '@/components/CyberCanvas3D';
import CyberTiltCard from '@/components/CyberTiltCard';
import { 
  Sparkles, TrendingUp, ShieldCheck, Film, ArrowRight, Database, Settings, 
  Cpu, GitMerge, BarChart2, CheckCircle2, ShieldAlert, Layers, Terminal, Activity, Zap, Play
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeChapter, setActiveChapter] = useState(1);

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

  const storyChapters = [
    { id: 1, tag: 'CHAPTER 01', title: 'The Neural Core', desc: 'Continuous trend vector ingestion analyzing millions of views, velocity peaks, and hook patterns in real-time.', icon: Cpu },
    { id: 2, tag: 'CHAPTER 02', title: 'Trend Radar Scraper', desc: 'Algorithmic scoring engine assigning momentum metrics (1-100) across YouTube and RSS intelligence channels.', icon: TrendingUp },
    { id: 3, tag: 'CHAPTER 03', title: 'Creator DNA Engine', desc: 'Tone constraints, custom vocabulary, and brand voice matrices applied automatically to every generated hook.', icon: Sparkles },
    { id: 4, tag: 'CHAPTER 04', title: '9:16 Render Worker', desc: 'Scene timing, stock B-roll, ElevenLabs voice synthesis, and auto-captioning compiled in parallel via FFmpeg.', icon: Film },
    { id: 5, tag: 'CHAPTER 05', title: 'Closed-Loop Learn', desc: 'Post-publish engagement monitoring feeding performance metrics back into your Creator DNA matrix.', icon: GitMerge }
  ];

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
      {/* Interactive 3D WebGL Canvas Backdrop */}
      <CyberCanvas3D chapter={activeChapter} />

      {/* Cyber Navigation Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        maxWidth: '1280px',
        width: '100%',
        margin: '16px auto 0 auto',
        zIndex: 10,
        backgroundColor: 'var(--bg-surface-translucent)',
        border: '3px solid var(--border-color)',
        boxShadow: '4px 4px 0px #00f0ff',
        borderRadius: 'var(--radius-md)'
      }} className="landing-header">
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--accent-primary)',
          fontSize: '1.4rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.02em'
        }}>
          <div style={{
            padding: '6px',
            backgroundColor: '#020204',
            border: '2px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
            display: 'flex'
          }}>
            <Sparkles size={20} />
          </div>
          <span>VIRALFLOW.AI</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="landing-nav-links">
          <Link href="/blog" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            [BLOG]
          </Link>
          <a href="#pricing" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            [PRICING]
          </a>
          <a href="#contact" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            [CONTACT]
          </a>
        </nav>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isLoggedIn ? (
            <>
              <span className="cyber-badge" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                SYS_ONLINE: {userEmail.split('@')[0]}
              </span>
              <Link href="/dashboard" className="cyber-btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                LAUNCH STUDIO
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                SIGN IN
              </Link>
              <Link href="/signup" className="cyber-btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                GET STARTED
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '70px 24px 40px 24px',
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* Cyber-Brutalist Status Badge */}
        <div style={{ display: 'inline-block', marginBottom: '24px' }}>
          <div className="cyber-badge" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
            <Activity size={14} />
            AUTONOMOUS CYBER-AGENTIC PIPELINE v2.5
          </div>
        </div>

        {/* Heavy Cyber Title */}
        <h1 style={{
          fontSize: '4.25rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          lineHeight: '1.05',
          letterSpacing: '-0.03em',
          marginBottom: '24px',
          textTransform: 'uppercase',
          color: '#ffffff'
        }} className="landing-title">
          THE SELF-IMPROVING{' '}
          <span style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#020204',
            padding: '0 12px',
            border: '4px solid #ffffff',
            boxShadow: '4px 4px 0px #ccff00'
          }}>
            CYBER 3D
          </span>{' '}
          CONTENT ENGINE
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          maxWidth: '750px',
          margin: '0 auto 40px auto',
          fontFamily: 'var(--font-body)'
        }} className="landing-desc">
          ViralFlow AI deploys specialized autonomous agent clusters that discover viral signals, script in your brand voice, audit claims, render 9:16 vertical MP4s, and learn closed-loop.
        </p>

        {/* Primary Cyber CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '60px' }}>
          <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="cyber-btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
            LAUNCH CREATOR STUDIO
            <ArrowRight size={20} />
          </Link>
          <a href="#3d-journey" style={{
            padding: '16px 28px',
            backgroundColor: '#020204',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            border: '3px solid var(--border-color)',
            boxShadow: '4px 4px 0px var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Play size={18} />
            EXPLORE 3D PIPELINE
          </a>
        </div>
      </section>

      {/* 5-Chapter 3D Scroll Journey Banner */}
      <section id="3d-journey" style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '3px solid var(--accent-primary)',
        borderBottom: '3px solid var(--accent-primary)',
        padding: '60px 24px',
        zIndex: 10,
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ textAlign: 'center' }}>
            <div className="cyber-badge" style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)', marginBottom: '12px' }}>
              3D INTERACTIVE STORYBOARD
            </div>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase' }}>
              The 5-Phase Agentic Execution Loop
            </h2>
          </div>

          {/* Chapter Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }} className="workflow-grid-4">
            {storyChapters.map((ch) => {
              const Icon = ch.icon;
              const isActive = activeChapter === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  style={{
                    padding: '20px',
                    backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'var(--bg-base)',
                    border: '3px solid',
                    borderColor: isActive ? 'var(--accent-secondary)' : 'var(--border-color)',
                    boxShadow: isActive ? '6px 6px 0px #ccff00' : '3px 3px 0px #00f0ff',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 800, color: isActive ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
                      {ch.tag}
                    </span>
                    <Icon size={18} style={{ color: isActive ? 'var(--accent-secondary)' : 'var(--accent-primary)' }} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>{ch.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ch.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cyber Workflow Cards Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
            Production Agent Infrastructure
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            [SPECIALIZED AGENTS WORKING IN PARALLEL INSIDE WORKFLOW LOOPS]
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }} className="workflow-grid-4">
          <CyberTiltCard borderColor="cyan" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="cyber-badge">PHASE 01</span>
              <TrendingUp size={22} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Trend Scraper</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Scout Agent continuously polls YouTube searches and RSS feeds to pinpoint high-velocity keywords.
            </p>
          </CyberTiltCard>

          <CyberTiltCard borderColor="lime" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="cyber-badge" style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>PHASE 02</span>
              <Cpu size={22} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Momentum Scoring</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Analyst Agent assigns 1-100 momentum grades based on audience novelty and production feasibility.
            </p>
          </CyberTiltCard>

          <CyberTiltCard borderColor="pink" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="cyber-badge" style={{ borderColor: 'var(--accent-pink)', color: 'var(--accent-pink)' }}>PHASE 03</span>
              <Settings size={22} style={{ color: 'var(--accent-pink)' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>DNA Synthesizer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Strategy Agent aligns hook concepts with your creator profile rules and vocabulary constraints.
            </p>
          </CyberTiltCard>

          <CyberTiltCard borderColor="cyan" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="cyber-badge">PHASE 04</span>
              <Film size={22} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>9:16 Render Worker</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Media Agent generates voiceovers, fetches stock B-roll, formats captions, and compiles output MP4s.
            </p>
          </CyberTiltCard>
        </div>
      </section>

      {/* Cyber Tech Stack Section */}
      <section style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '3px solid var(--border-color)',
        borderBottom: '3px solid var(--border-color)',
        padding: '80px 24px',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
              Engineered With Open Systems
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              [RELIABLE ORCHESTRATION VIA POSTGRES, N8N WORKFLOWS & FFMPEG]
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="workflow-grid-3">
            <CyberTiltCard borderColor="cyan" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                <Database size={28} style={{ color: 'var(--accent-primary)' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Supabase Postgres</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Row-level security protecting content ideas, trend logs, script timelines, and publishing audit trails.
              </p>
            </CyberTiltCard>

            <CyberTiltCard borderColor="lime" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                <Cpu size={28} style={{ color: 'var(--accent-secondary)' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>n8n Agent Engine</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Orchestrates async API triggers, OpenRouter model calls, ElevenLabs speech synthesis, and webhook events.
              </p>
            </CyberTiltCard>

            <CyberTiltCard borderColor="pink" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                <Film size={28} style={{ color: 'var(--accent-pink)' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>FFmpeg Render Worker</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Compiles 9:16 vertical layouts, overlays caption SRT tracks, mixes audio voiceovers, and outputs 1080p MP4s.
              </p>
            </CyberTiltCard>
          </div>
        </div>
      </section>

      {/* Cyber Pricing Section */}
      <section id="pricing" style={{ padding: '100px 24px 80px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="cyber-badge" style={{ marginBottom: '16px' }}>SCALABLE PRODUCTION TIERS</div>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
            Choose Your Content Output Velocity
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="workflow-grid-3">
          {/* Starter Plan */}
          <CyberTiltCard borderColor="cyan" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase' }}>Creator Sandbox</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>For creators testing the autonomous scripting loop.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>$0</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ MONTH</span>
            </div>
            <hr style={{ border: '0', borderTop: '2px solid var(--border-color)', margin: '0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', margin: '0', listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, fontFamily: 'var(--font-mono)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-primary)' }} /> 10 Autonomous drafts/mo</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-primary)' }} /> Basic trend RSS scanning</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-primary)' }} /> Local render worker access</li>
            </ul>
            <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="cyber-btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              GET STARTED FREE
            </Link>
          </CyberTiltCard>

          {/* Growth Plan */}
          <CyberTiltCard borderColor="lime" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', border: '3px solid var(--accent-secondary)' }}>
            <div>
              <span className="cyber-badge" style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)', marginBottom: '8px' }}>MOST POPULAR</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase' }}>Viral Engine</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>For serious creators publishing daily structured shorts.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>$49</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ MONTH</span>
            </div>
            <hr style={{ border: '0', borderTop: '2px solid var(--accent-secondary)', margin: '0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', margin: '0', listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, fontFamily: 'var(--font-mono)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Unlimited Gemini 1.5 Pro drafts</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> Youtube + RSS trend crawling</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> 50 Cloud MP4 Renders / mo</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-secondary)' }} /> ElevenLabs custom voice cloning</li>
            </ul>
            <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="cyber-btn-primary" style={{ width: '100%', backgroundColor: 'var(--accent-secondary)', color: '#020204' }}>
              SCALE NOW
            </Link>
          </CyberTiltCard>

          {/* Scale Plan */}
          <CyberTiltCard borderColor="pink" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase' }}>Creator Studio</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>For media channels running multi-voice agent hubs.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>$149</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ MONTH</span>
            </div>
            <hr style={{ border: '0', borderTop: '2px solid var(--border-color)', margin: '0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', margin: '0', listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, fontFamily: 'var(--font-mono)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-pink)' }} /> Dedicated GPU render clusters</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-pink)' }} /> Unlimited cloud rendering runs</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} style={{ color: 'var(--accent-pink)' }} /> Up to 5 cloned voices configured</li>
            </ul>
            <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="cyber-btn-primary" style={{ width: '100%', backgroundColor: 'var(--accent-pink)', color: '#ffffff' }}>
              CONTACT SALES
            </Link>
          </CyberTiltCard>
        </div>
      </section>

      {/* Cyber Contact Section */}
      <section id="contact" style={{ padding: '80px 24px', maxWidth: '640px', width: '100%', margin: '0 auto', zIndex: 10 }}>
        <CyberTiltCard borderColor="cyan" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="cyber-badge" style={{ marginBottom: '12px' }}>GET IN TOUCH</div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase' }}>
              Contact Platform Team
            </h2>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for reaching out! Our cyber team will get back to you shortly.");
              e.currentTarget.reset();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>FULL NAME</label>
              <input 
                type="text" 
                required
                placeholder="Cyber Creator" 
                style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-color)', backgroundColor: '#020204', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                required
                placeholder="creator@viralflow.ai" 
                style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-color)', backgroundColor: '#020204', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>MESSAGE</label>
              <textarea 
                required
                rows={4}
                placeholder="How can we scale your workflow?" 
                style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-color)', backgroundColor: '#020204', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', resize: 'none' }}
              />
            </div>

            <button type="submit" className="cyber-btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              SEND TRANSMISSION
            </button>
          </form>
        </CyberTiltCard>
      </section>

      {/* Cyber Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '3px solid var(--border-color)',
        padding: '32px 40px',
        backgroundColor: 'var(--bg-surface)',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }} className="landing-footer-container">
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            &copy; 2026 VIRALFLOW AI. CYBER-BRUTALIST ARCHITECTURE.
          </span>
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
            <Link href="/login" style={{ textTransform: 'uppercase' }}>
              [CREATOR LOG IN]
            </Link>
            <Link href="/signup" style={{ textTransform: 'uppercase' }}>
              [STUDIO REGISTER]
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
