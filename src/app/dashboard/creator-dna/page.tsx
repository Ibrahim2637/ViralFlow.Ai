'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  BookOpen, Save, CheckCircle, Sparkles, MessageCircle, Rss, Target, Award, LogOut, User
} from 'lucide-react';

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="#ef4444" style={{ flexShrink: 0 }}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837z" />
    <polygon points="9.545 15.568 15.818 12 9.545 8.432 9.545 15.568" fill="white" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ color: 'var(--text-primary)', flexShrink: 0 }}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.2 1.23 1.34 2.85 2.1 4.61 2.25v3.96c-1.37-.15-2.68-.69-3.79-1.53-.74-.56-1.35-1.29-1.78-2.14v7.26c.01 4.31-2.92 7.71-7.23 7.97-3.96.24-7.61-2.45-8.15-6.39-.62-4.48 2.62-8.6 7.1-8.91 1-.07 2 .05 2.95.36v4.06c-.84-.33-1.76-.44-2.65-.24-2.14.49-3.46 2.65-3.02 4.79.41 2 2.23 3.39 4.29 3.23 2.13-.16 3.73-1.95 3.72-4.08V0c-.12.02-.25.02-.36.02z" />
  </svg>
);

export default function CreatorDNAStudio() {
  const router = useRouter();
  const [dbConfigured, setDbConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('creator@viralflow.ai');

  // --- Creator DNA Form Fields ---
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  const [hookStyle, setHookStyle] = useState<string[]>([]);
  const [ctaStyle, setCtaStyle] = useState('short');
  const [avoid, setAvoid] = useState('');
  const [brandRules, setBrandRules] = useState('');

  // --- Social Channels ---
  const [ytChannel, setYtChannel] = useState('');
  const [igProfile, setIgProfile] = useState('');
  const [ttProfile, setTtProfile] = useState('');

  // --- Trend Scanner Links ---
  const [rssFeeds, setRssFeeds] = useState('');
  const [ytScanChannels, setYtScanChannels] = useState('');

  // --- Inspiration / Competitors ---
  const [nicheInspirations, setNicheInspirations] = useState('');

  const toneOptions = ['Fast-paced', 'Educational', 'Energetic', 'Professional', 'Direct', 'Humorous', 'Contrarian'];
  const hookOptions = ['Question', 'Surprising fact', 'Contrarian question', 'Mistake framing', 'Surprising number'];

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());

    const loadCreatorDNA = async () => {
      let userId = '';
      let email = 'creator@viralflow.ai';

      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        try {
          const sessionObj = JSON.parse(demoSession);
          userId = sessionObj.user.id;
          email = sessionObj.user.email;
        } catch (e) {
          console.error(e);
        }
      } else if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            userId = session.user.id;
            email = session.user.email || 'creator@viralflow.ai';
          }
        } catch (err) {
          console.error(err);
        }
      }

      setUserEmail(email);

      if (userId) {
        try {
          const { data, error } = await supabase
            .from('creators')
            .select('*')
            .eq('id', userId)
            .single();

          if (data) {
            setNiche(data.niche || '');
            setAudience(data.audience || '');
            setTone(data.tone || []);
            setDuration(data.preferred_duration || 45);
            
            const brand = data.brand_rules || {};
            setLanguage(brand.language || 'English');
            setCtaStyle(brand.cta || 'short');
            setAvoid(brand.avoid || '');
            setBrandRules(brand.rules || '');
            setYtChannel(brand.ytChannel || '');
            setIgProfile(brand.igProfile || '');
            setTtProfile(brand.ttProfile || '');
            setRssFeeds(brand.rssFeeds || '');
            setYtScanChannels(brand.ytScanChannels || '');
            setNicheInspirations(brand.nicheInspirations || '');
            return;
          }
        } catch (err) {
          console.error('Error loading creator profile from Supabase:', err);
        }

        const savedDNA = localStorage.getItem(`creator-dna-${userId}`);
        if (savedDNA) {
          try {
            const dna = JSON.parse(savedDNA);
            setNiche(dna.niche || '');
            setAudience(dna.audience || '');
            setLanguage(dna.language || 'English');
            setTone(dna.tone || []);
            setDuration(dna.preferred_duration || 45);
            setHookStyle(dna.hook_style || []);
            setCtaStyle(dna.cta_style || 'short');
            setAvoid(dna.avoid || '');
            setBrandRules(dna.brand_rules || '');
            setYtChannel(dna.ytChannel || '');
            setIgProfile(dna.igProfile || '');
            setTtProfile(dna.ttProfile || '');
            setRssFeeds(dna.rssFeeds || '');
            setYtScanChannels(dna.ytScanChannels || '');
            setNicheInspirations(dna.nicheInspirations || '');
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    loadCreatorDNA();
  }, []);

  const handleToneToggle = (val: string) => {
    setTone(prev => prev.includes(val) ? prev.filter(t => t !== val) : [...prev, val]);
  };

  const handleHookToggle = (val: string) => {
    setHookStyle(prev => prev.includes(val) ? prev.filter(h => h !== val) : [...prev, val]);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);

    const dnaProfile = {
      niche,
      audience,
      language,
      tone,
      preferred_duration: duration,
      hook_style: hookStyle,
      cta_style: ctaStyle,
      avoid,
      brand_rules: brandRules,
      ytChannel,
      igProfile,
      ttProfile,
      rssFeeds,
      ytScanChannels,
      nicheInspirations
    };

    if (!dbConfigured) {
      setTimeout(() => {
        const demoSession = localStorage.getItem('demo-session');
        const userId = demoSession ? JSON.parse(demoSession).user.id : 'demo-uuid-1234';
        localStorage.setItem(`creator-dna-${userId}`, JSON.stringify(dnaProfile));
        setLoading(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }, 800);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('creators')
          .update({
            niche,
            audience,
            tone,
            preferred_duration: duration,
            brand_rules: { 
              rules: brandRules, 
              cta: ctaStyle, 
              avoid,
              ytChannel,
              igProfile,
              ttProfile,
              rssFeeds,
              ytScanChannels,
              nicheInspirations
            }
          })
          .eq('id', session.user.id);
        
        if (error) throw error;

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save Creator DNA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
            Creator DNA Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure your brand guardrails, channel integration links, trend source RSS feeds, and competitor metrics.
          </p>
        </div>

        <button
          onClick={handleSave}
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
          <Save size={18} />
          {loading ? 'Saving DNA...' : 'Save Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div style={{
          backgroundColor: 'var(--success-glow)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <CheckCircle size={20} />
          <span>Creator DNA profile successfully updated! Changes are synced with n8n orchestrator.</span>
        </div>
      )}

      {/* Grid Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="split-grid">
        
        {/* Left Side: General Profile DNA & Channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1: General Parameters */}
          <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Sparkles size={20} />
              <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Voice & Niche Parameters</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Niche Focus</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. AI tools for coders"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. CS students, junior web devs"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Tone Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {toneOptions.map(t => {
                    const active = tone.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleToneToggle(t)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-base)',
                          border: '1px solid',
                          borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
                          color: active ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Preferred Hook Patterns</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {hookOptions.map(h => {
                    const active = hookStyle.includes(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHookToggle(h)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-base)',
                          border: '1px solid',
                          borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
                          color: active ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Language Preference</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="English + Urdu Mix">English + Urdu Mix</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CTA Style</label>
                  <select
                    value={ctaStyle}
                    onChange={(e) => setCtaStyle(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                  >
                    <option value="short">Short CTA (Follow/Subscribe)</option>
                    <option value="link">Link in bio referral</option>
                    <option value="comment">Interactive question trigger</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Preferred Video Length</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{duration} seconds</span>
                </div>
                <input
                  type="range" min="15" max="90" step="5" value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Brand Rules / Rules</label>
                  <textarea
                    value={brandRules}
                    onChange={(e) => setBrandRules(e.target.value)}
                    placeholder="e.g. Logo top right, subtitle text color yellow"
                    style={{ height: '80px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Topics to Avoid</label>
                  <textarea
                    value={avoid}
                    onChange={(e) => setAvoid(e.target.value)}
                    placeholder="e.g. Politics, investment recommendations"
                    style={{ height: '80px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', resize: 'none' }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Social Account Integration */}
          <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Target size={20} />
              <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Your Active Channels</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <YouTubeIcon />
                <input
                  type="text"
                  value={ytChannel}
                  onChange={(e) => setYtChannel(e.target.value)}
                  placeholder="Your YouTube Channel URL"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <InstagramIcon />
                <input
                  type="text"
                  value={igProfile}
                  onChange={(e) => setIgProfile(e.target.value)}
                  placeholder="Your Instagram Profile URL"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TikTokIcon />
                <input
                  type="text"
                  value={ttProfile}
                  onChange={(e) => setTtProfile(e.target.value)}
                  placeholder="Your TikTok Profile URL"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </section>

        </div>

        {/* Right Side: Trend Ingestion Feeds & Inspiration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 0: User Profile & Log Out */}
          <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <User size={20} />
              <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Account Profile</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{userEmail.split('@')[0]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userEmail}</div>
              </div>
              <button
                onClick={async () => {
                  localStorage.removeItem('demo-session');
                  if (isSupabaseConfigured()) {
                    await supabase.auth.signOut();
                  }
                  router.push('/login');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--error-glow)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--error)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </section>

          {/* Scanner Sources (RSS & YT Scanning) */}
          <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Rss size={20} />
              <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Trend Radar Sources</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  RSS Feed URLs to Scan (One per line)
                </label>
                <textarea
                  value={rssFeeds}
                  onChange={(e) => setRssFeeds(e.target.value)}
                  placeholder="https://techcrunch.com/feed/&#10;https://wired.com/feed/"
                  style={{ width: '100%', height: '120px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  YouTube Channels to Scan (One per line)
                </label>
                <textarea
                  value={ytScanChannels}
                  onChange={(e) => setYtScanChannels(e.target.value)}
                  placeholder="https://youtube.com/@fireship&#10;https://youtube.com/@techworldwithnana"
                  style={{ width: '100%', height: '120px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </section>

          {/* Competitor / Niche Inspirations */}
          <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Award size={20} />
              <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Niche Inspirations</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Inspiration & Competitor Profiles (URLs)
              </label>
              <textarea
                value={nicheInspirations}
                onChange={(e) => setNicheInspirations(e.target.value)}
                placeholder="https://tiktok.com/@competitor1&#10;https://instagram.com/inspiration_page"
                style={{ width: '100%', height: '140px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
