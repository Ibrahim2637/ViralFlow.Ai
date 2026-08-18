'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Sparkles, Sliders, Volume2, Type, ShieldAlert, CheckCircle, Save, ArrowLeft, ArrowRight
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dbConfigured, setDbConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Creator DNA state variables
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState<string[]>([]);
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  const [hookStyle, setHookStyle] = useState<string[]>([]);
  const [ctaStyle, setCtaStyle] = useState('short');
  const [avoid, setAvoid] = useState('');
  const [brandRules, setBrandRules] = useState('');

  const toneOptions = ['Fast-paced', 'Educational', 'Energetic', 'Professional', 'Direct', 'Humorous', 'Contrarian'];
  const hookOptions = ['Question', 'Surprising fact', 'Contrarian question', 'Mistake framing', 'Surprising number'];

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());

    // Prepopulate if data already exists in Supabase or local storage
    const loadCreatorDNA = async () => {
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        try {
          const sessionObj = JSON.parse(demoSession);
          const savedDNA = localStorage.getItem(`creator-dna-${sessionObj.user.id}`);
          if (savedDNA) {
            const dna = JSON.parse(savedDNA);
            setNiche(dna.niche || '');
            setAudience(dna.audience || '');
            setLanguage(dna.language || 'English');
            setTone(dna.tone || []);
            setVocabulary(dna.vocabulary || []);
            setDuration(dna.preferred_duration || 45);
            setHookStyle(dna.hook_style || []);
            setCtaStyle(dna.cta_style || 'short');
            setAvoid(dna.avoid || '');
            setBrandRules(dna.brand_rules || '');
          }
        } catch (e) {
          console.error(e);
        }
        return;
      }

      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: creator } = await supabase
              .from('creators')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (creator) {
              setNiche(creator.niche || '');
              setAudience(creator.audience || '');
              setTone(creator.tone || []);
              setVocabulary(creator.vocabulary || []);
              setDuration(creator.preferred_duration || 45);
              setBrandRules(creator.brand_rules ? JSON.stringify(creator.brand_rules) : '');
            }
          }
        } catch (err) {
          console.error(err);
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
      vocabulary,
      preferred_duration: duration,
      hook_style: hookStyle,
      cta_style: ctaStyle,
      avoid,
      brand_rules: brandRules
    };

    // Demo Mode Save
    if (!dbConfigured) {
      setTimeout(() => {
        const demoSession = localStorage.getItem('demo-session');
        const userId = demoSession ? JSON.parse(demoSession).user.id : 'demo-uuid-1234';
        localStorage.setItem(`creator-dna-${userId}`, JSON.stringify(dnaProfile));
        setLoading(false);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          router.push('/dashboard');
        }, 1500);
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
            brand_rules: { rules: brandRules, cta: ctaStyle, avoid }
          })
          .eq('id', session.user.id);
        
        if (error) {
          throw error;
        }

        // Insert a new DNA version to track historical shifts
        await supabase
          .from('creator_dna_versions')
          .insert([
            { creator_id: session.user.id, profile_json: dnaProfile }
          ]);

        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save Creator DNA changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
          Creator DNA Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure your autonomous content agent's parameters to align with your personal voice, tone, and brand policies.
        </p>
      </div>

      {/* Save Toast Notification */}
      {saveSuccess && (
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
          <CheckCircle size={20} />
          <span>Creator DNA saved successfully! Redirecting...</span>
        </div>
      )}

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: '8px', width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)' }}>
        <div style={{ flex: 1, backgroundColor: step >= 1 ? 'var(--accent-primary)' : 'transparent', borderRadius: 'var(--radius-full)', transition: 'background-color var(--transition-normal)' }} />
        <div style={{ flex: 1, backgroundColor: step >= 2 ? 'var(--accent-primary)' : 'transparent', borderRadius: 'var(--radius-full)', transition: 'background-color var(--transition-normal)' }} />
        <div style={{ flex: 1, backgroundColor: step >= 3 ? 'var(--accent-primary)' : 'transparent', borderRadius: 'var(--radius-full)', transition: 'background-color var(--transition-normal)' }} />
      </div>

      {/* Wizard Card */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '36px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Step 1: Niche & Audience */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
              <Sparkles size={24} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Niche & Audience Definition</h2>
            </div>

            {/* Niche Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Niche / Core Topic Focus
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Personal finance for college students, Tech reviews"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Target Audience Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. 18-25 year old university students, beginner investors"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Language */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Primary Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
                <option value="English + Urdu Mix">English + Urdu Mix</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Voice & Tone */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
              <Volume2 size={24} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Voice & Tone Branding</h2>
            </div>

            {/* Tone Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select Tone Tags (Select all that apply)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {toneOptions.map(t => {
                  const active = tone.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToneToggle(t)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-base)',
                        border: '1px solid',
                        borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
                        color: active ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hook Style Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Preferred Hook Patterns
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {hookOptions.map(h => {
                  const active = hookStyle.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHookToggle(h)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-base)',
                        border: '1px solid',
                        borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
                        color: active ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Format & Policy Boundaries */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
              <Sliders size={24} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Formatting & Policy Boundaries</h2>
            </div>

            {/* Duration Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Preferred Video Duration</span>
                <span style={{ color: 'var(--accent-primary)' }}>{duration} seconds</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: 'var(--accent-primary)',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--border-color)'
                }}
              />
            </div>

            {/* CTA Style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Call To Action (CTA) Style
              </label>
              <select
                value={ctaStyle}
                onChange={(e) => setCtaStyle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <option value="short">Short (Follow for more)</option>
                <option value="link">Link in Bio (Check out my profile link)</option>
                <option value="comment">Question (Comment your opinions below)</option>
                <option value="none">No Explicit CTA</option>
              </select>
            </div>

            {/* Avoid Topics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Topics to Avoid (Guardrails)
              </label>
              <textarea
                value={avoid}
                onChange={(e) => setAvoid(e.target.value)}
                placeholder="e.g. Political controversies, direct financial advice, crypto promotion"
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  resize: 'none',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>
        )}

        {/* Buttons Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '32px' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color-hover)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Creator DNA'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
