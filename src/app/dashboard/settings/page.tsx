'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Settings, Save, CheckCircle, RefreshCw, Radio, Link } from 'lucide-react';

export default function AutomationSettingsPage() {
  const [dbConfigured, setDbConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings states
  const [autoGen, setAutoGen] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);
  const [scanInterval, setScanInterval] = useState('30m');
  const [activeYouTubeAuth, setActiveYouTubeAuth] = useState(false);
  const [activeTikTokAuth, setActiveTikTokAuth] = useState(false);

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());

    const loadSettings = () => {
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        try {
          const sessionObj = JSON.parse(demoSession);
          const savedSettings = localStorage.getItem(`automation-settings-${sessionObj.user.id}`);
          if (savedSettings) {
            const settingsObj = JSON.parse(savedSettings);
            setAutoGen(settingsObj.autoGen || false);
            setAutoPublish(settingsObj.autoPublish || false);
            setScanInterval(settingsObj.scanInterval || '30m');
            setActiveYouTubeAuth(settingsObj.activeYouTubeAuth || false);
            setActiveTikTokAuth(settingsObj.activeTikTokAuth || false);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);

    const settingsProfile = {
      autoGen,
      autoPublish,
      scanInterval,
      activeYouTubeAuth,
      activeTikTokAuth
    };

    if (!dbConfigured) {
      setTimeout(() => {
        const demoSession = localStorage.getItem('demo-session');
        const userId = demoSession ? JSON.parse(demoSession).user.id : 'demo-uuid-1234';
        localStorage.setItem(`automation-settings-${userId}`, JSON.stringify(settingsProfile));
        setLoading(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }, 600);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('creators')
          .update({
            auto_publish_enabled: autoPublish
          })
          .eq('id', session.user.id);

        if (error) throw error;

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
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
            Automation Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure scanning intervals, enable auto-publishing loops, or authorize OAuth credentials.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
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
          {loading ? 'Saving...' : 'Save Settings'}
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
          <span>Automation configuration settings updated successfully.</span>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="split-grid">
        
        {/* Left Side: Loop Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Radio size={20} />
              <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Orchestration Loop Settings</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Auto Gen toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Enable Autonomous Script Generation</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automatically draft scripts when high-scoring trends are scanned.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoGen}
                  onChange={(e) => setAutoGen(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

              {/* Auto Publish toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Enable Autonomous Publishing Loop</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Skip creator approvals for low-risk content and publish immediately.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

              {/* Ingest Interval */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Trend Scanning Frequency (n8n Ingestion Schedule)
                </label>
                <select
                  value={scanInterval}
                  onChange={(e) => setScanInterval(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="15m">Every 15 Minutes</option>
                  <option value="30m">Every 30 Minutes (Recommended)</option>
                  <option value="1h">Every Hour</option>
                  <option value="12h">Twice Daily</option>
                </select>
              </div>

            </div>
          </section>

        </div>

        {/* Right Side: Integrations OAuth */}
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Link size={20} />
            <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Platform Connections</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Youtube OAuth */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>YouTube OAuth Connection</span>
                <span style={{ fontSize: '0.75rem', color: activeYouTubeAuth ? 'var(--success)' : 'var(--text-muted)' }}>
                  {activeYouTubeAuth ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={() => setActiveYouTubeAuth(!activeYouTubeAuth)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeYouTubeAuth ? 'var(--error-glow)' : 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: activeYouTubeAuth ? 'var(--error)' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {activeYouTubeAuth ? 'Revoke' : 'Authorize'}
              </button>
            </div>

            {/* TikTok OAuth */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>TikTok API Connection</span>
                <span style={{ fontSize: '0.75rem', color: activeTikTokAuth ? 'var(--success)' : 'var(--text-muted)' }}>
                  {activeTikTokAuth ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={() => setActiveTikTokAuth(!activeTikTokAuth)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeTikTokAuth ? 'var(--error-glow)' : 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: activeTikTokAuth ? 'var(--error)' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {activeTikTokAuth ? 'Revoke' : 'Authorize'}
              </button>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
