'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Settings, Users, ShieldAlert, Activity, DollarSign, Check, X, Search, RefreshCw, UserMinus, UserCheck, Shield, BookOpen, Cpu
} from 'lucide-react';

interface CreatorUser {
  id: string;
  email: string;
  niche: string;
  role: 'creator' | 'admin';
  status: 'active' | 'suspended';
  created_at: string;
}

interface FlaggedItem {
  id: string;
  scriptTitle: string;
  claimText: string;
  issue: string;
  severity: 'high' | 'medium';
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'error';
  message: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'moderation' | 'operations' | 'budget'>('settings');
  const [dbConfigured, setDbConfigured] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- Settings State ---
  const [selectedLLM, setSelectedLLM] = useState('Claude 3.5 Sonnet');
  const [selectedVoice, setSelectedVoice] = useState('ElevenLabs Cloud');
  const [weightMomentum, setWeightMomentum] = useState(25);
  const [weightFit, setWeightFit] = useState(20);
  const [weightNovelty, setWeightNovelty] = useState(15);
  const [weightSaturation, setWeightSaturation] = useState(15);
  const [weightTiming, setWeightTiming] = useState(15);
  const [weightFeasibility, setWeightFeasibility] = useState(10);

  // --- Users State ---
  const [users, setUsers] = useState<CreatorUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserDNA, setSelectedUserDNA] = useState<any | null>(null);

  // --- Flagged Moderation State ---
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);

  // --- Operations Logs State ---
  const [n8nStatus, setN8nStatus] = useState<'online' | 'offline'>('online');
  const [renderStatus, setRenderStatus] = useState<'online' | 'offline'>('online');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());

    const fetchCreators = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('creators')
            .select('id, email, niche, role, status, created_at')
            .order('created_at', { ascending: false });

          if (data) {
            const formattedUsers = data.map((u: any) => ({
              id: u.id,
              email: u.email,
              niche: u.niche || 'Not Set',
              role: u.role || 'creator',
              status: u.status || 'active',
              created_at: u.created_at ? u.created_at.split('T')[0] : 'N/A'
            }));
            setUsers(formattedUsers);
            return;
          }
        } catch (err) {
          console.error('Error querying creators from DB:', err);
        }
      }

      // Local storage fallback for Demo Mode
      const demoUsersRaw = localStorage.getItem('demo-users');
      if (demoUsersRaw) {
        try {
          const parsed = JSON.parse(demoUsersRaw);
          const formatted = parsed.map((u: any) => {
            const savedDNA = localStorage.getItem(`creator-dna-${u.id}`);
            let userNiche = 'Not Set';
            if (savedDNA) {
              try {
                const dna = JSON.parse(savedDNA);
                userNiche = dna.niche || 'Not Set';
              } catch {}
            } else {
              if (u.email === 'creator@viralflow.ai') userNiche = 'AI & Technology';
              else if (u.email === 'admin@viralflow.ai') userNiche = 'General Tech';
              else if (u.email === 'copycat@viralflow.ai') userNiche = 'Crypto Promos';
              else if (u.email === 'pakistani_finance@viralflow.ai') userNiche = 'Student Finance';
            }
            return {
              id: u.id,
              email: u.email,
              niche: userNiche,
              role: u.role || 'creator',
              status: u.status || 'active',
              created_at: 'Demo Mode'
            };
          });
          setUsers(formatted);
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultUsers: CreatorUser[] = [
          { id: 'demo-creator-1', email: 'creator@viralflow.ai', niche: 'AI & Technology', role: 'creator', status: 'active', created_at: 'Demo Mode' },
          { id: 'demo-admin-1', email: 'admin@viralflow.ai', niche: 'General Tech', role: 'admin', status: 'active', created_at: 'Demo Mode' },
          { id: 'demo-creator-2', email: 'copycat@viralflow.ai', niche: 'Crypto Promos', role: 'creator', status: 'suspended', created_at: 'Demo Mode' }
        ];
        localStorage.setItem('demo-users', JSON.stringify(defaultUsers.map(u => ({
          email: u.email,
          password: 'password',
          id: u.id,
          role: u.role,
          status: u.status
        }))));
        setUsers(defaultUsers);
      }
    };

    const mockFlagged: FlaggedItem[] = [
      {
        id: 'flag-1',
        scriptTitle: 'Cursor AI Speedrun Challenge',
        claimText: 'Cursor AI automatically builds fully authenticated apps 4 times faster than developers typing manually.',
        issue: 'Numerical claims not backed by verified benchmarks or external links.',
        severity: 'medium'
      },
      {
        id: 'flag-2',
        scriptTitle: 'Secret Crypto App Profits',
        claimText: 'This coin is guaranteed to 10x your money by next Monday.',
        issue: 'Violates boundary policy: Avoid financial advice and guaranteed rate guarantees.',
        severity: 'high'
      }
    ];

    const mockLogs: LogEntry[] = [
      { timestamp: '14:32:01', type: 'info', message: 'Trend Scanner cron completed successfully. Ingested 18 candidate videos.' },
      { timestamp: '14:35:42', type: 'info', message: 'Orchestrator webhook triggered for Content Factory id: content_823.' },
      { timestamp: '14:36:12', type: 'info', message: 'Script Agent finished writing json for content_823.' },
      { timestamp: '14:36:15', type: 'warn', message: 'Fact check warning generated: Claim id claim_2 marked as RISKY.' },
      { timestamp: '14:38:22', type: 'info', message: 'Render worker job render_942 started. manifest downloaded.' },
      { timestamp: '14:40:02', type: 'info', message: 'Render job completed. Output uploaded to Supabase Storage: final.mp4' }
    ];

    fetchCreators();
    setFlaggedItems(mockFlagged);
    setLogs(mockLogs);
  }, []);

  // --- Actions handlers ---
  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('creators')
          .update({ status: newStatus })
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error updating status in Supabase:', e);
      }
    }

    const demoUsersRaw = localStorage.getItem('demo-users');
    if (demoUsersRaw) {
      try {
        const parsed = JSON.parse(demoUsersRaw);
        const updated = parsed.map((u: any) => u.id === id ? { ...u, status: newStatus } : u);
        localStorage.setItem('demo-users', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
    alert(`User status updated to: ${newStatus}`);
  };

  const handleToggleRole = async (id: string, currentRole: 'creator' | 'admin') => {
    const newRole = currentRole === 'creator' ? 'admin' : 'creator';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('creators')
          .update({ role: newRole })
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error updating role in Supabase:', e);
      }
    }

    const demoUsersRaw = localStorage.getItem('demo-users');
    if (demoUsersRaw) {
      try {
        const parsed = JSON.parse(demoUsersRaw);
        const updated = parsed.map((u: any) => u.id === id ? { ...u, role: newRole } : u);
        localStorage.setItem('demo-users', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
    alert(`User role updated to: ${newRole}`);
  };

  const handleInspectDNA = async (id: string, email: string) => {
    let realDNA: any = null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          const brand = data.brand_rules || {};
          realDNA = {
            niche: data.niche || 'Not Set',
            audience: data.audience || 'Not Set',
            language: brand.language || 'English',
            tone: data.tone || [],
            preferred_duration: data.preferred_duration || 45,
            hook_style: brand.hook_style || [],
            cta_style: brand.cta || 'short',
            avoid: brand.avoid || 'None',
            brand_rules: {
              rules: brand.rules || 'None',
              ytChannel: brand.ytChannel || 'Not Connected',
              igProfile: brand.igProfile || 'Not Connected',
              ttProfile: brand.ttProfile || 'Not Connected'
            }
          };
        }
      } catch (err) {
        console.error('Error fetching real creator DNA for inspection:', err);
      }
    }

    if (!realDNA) {
      const savedDNA = localStorage.getItem(`creator-dna-${id}`);
      if (savedDNA) {
        try {
          const dna = JSON.parse(savedDNA);
          realDNA = {
            niche: dna.niche || 'Not Set',
            audience: dna.audience || 'Not Set',
            language: dna.language || 'English',
            tone: dna.tone || [],
            preferred_duration: dna.preferred_duration || 45,
            hook_style: dna.hook_style || [],
            cta_style: dna.cta_style || 'short',
            avoid: dna.avoid || 'None',
            brand_rules: {
              rules: dna.brand_rules || 'None',
              ytChannel: dna.ytChannel || 'Not Connected',
              igProfile: dna.igProfile || 'Not Connected',
              ttProfile: dna.ttProfile || 'Not Connected'
            }
          };
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!realDNA) {
      realDNA = {
        niche: email.includes('finance') ? 'Student Micro-Investing' : (email.includes('crypto') ? 'Crypto Promos' : 'AI Software Reviews'),
        audience: '18-25 year olds, Urdu + English speaking college grads',
        language: 'Bilingual (English/Urdu mix)',
        tone: ['direct', 'energetic', 'educational'],
        preferred_duration: 45,
        hook_style: ['question', 'surprising facts'],
        cta_style: 'link-in-bio',
        avoid: 'Political controversy, direct stock trading recommendations, crypto hype',
        brand_rules: {
          rules: 'Use yellow sub-titles, logo in top right',
          ytChannel: 'https://youtube.com/@viralflow',
          igProfile: 'Not Connected',
          ttProfile: 'Not Connected'
        }
      };
    }

    setSelectedUserDNA({ email, dna: realDNA });
  };

  const handleModerationResolve = (id: string, action: 'approve' | 'reject') => {
    setFlaggedItems(prev => prev.filter(item => item.id !== id));
    alert(`Moderation claim resolved with action: ${action.toUpperCase()}`);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
          Administration Operations
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monitor system health, resolve boundary violations, adjust prompt model parameters, and manage user status.
        </p>
      </div>

      {/* Tabs Header */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: 'var(--bg-surface)',
        padding: '6px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        overflowX: 'auto'
      }} className="admin-tabs">
        {[
          { id: 'settings', label: 'Control Center', icon: Settings },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert },
          { id: 'operations', label: 'Health & Logs', icon: Activity },
          { id: 'budget', label: 'API Quotas', icon: DollarSign }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', minHeight: '400px' }}>
        
        {/* PANEL 1: Settings (Control Center) */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--accent-primary)' }}>
              Global Provider Configurations
            </h2>

            {/* Selectors grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="responsive-grid-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Active LLM Provider Model
                </label>
                <select
                  value={selectedLLM}
                  onChange={(e) => setSelectedLLM(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Pro Routing)</option>
                  <option value="GPT-4o">GPT-4o (Standard Routing)</option>
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Google Cloud)</option>
                  <option value="Llama 3.1 70B (OpenRouter)">Llama 3.1 70B (OpenRouter Free Pool)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Active Voice (TTS) Synthesizer
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="ElevenLabs Cloud">ElevenLabs API (High-Fidelity Cloud)</option>
                  <option value="Piper Local">Piper TTS (Local Offline Engine)</option>
                  <option value="Kokoro local">Kokoro Voice (Local PyTorch Model)</option>
                </select>
              </div>
            </div>

            {/* Sliders for Opportunity weighting */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Trend Scoring Weights Customizer</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid-2">
                {[
                  { name: 'Momentum Weight', val: weightMomentum, set: setWeightMomentum },
                  { name: 'Creator DNA Fit Weight', val: weightFit, set: setWeightFit },
                  { name: 'Novelty Weight', val: weightNovelty, set: setWeightNovelty },
                  { name: 'Saturation Limit Weight', val: weightSaturation, set: setWeightSaturation },
                  { name: 'Timing Velocity Weight', val: weightTiming, set: setWeightTiming },
                  { name: 'Production Feasibility Weight', val: weightFeasibility, set: setWeightFeasibility }
                ].map(item => (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{item.val}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={item.val}
                      onChange={(e) => item.set(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: User Manager */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)' }}>
                Registered Creator Directory
              </h2>
              {/* Search bar */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Table list */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Niche Focus</th>
                    <th style={{ padding: '12px' }}>Role</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color var(--transition-fast)' }} className="table-row-hover">
                      <td style={{ padding: '16px 12px', fontWeight: 500 }}>{u.email}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{u.niche}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: u.role === 'admin' ? 'var(--accent-glow)' : 'var(--bg-base)',
                          color: u.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          border: '1px solid var(--border-color)'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: u.status === 'active' ? 'var(--success-glow)' : 'var(--error-glow)',
                          color: u.status === 'active' ? 'var(--success)' : 'var(--error)'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleInspectDNA(u.id, u.email)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <BookOpen size={12} />
                            DNA
                          </button>
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <Shield size={12} />
                            Role
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: u.status === 'active' ? 'var(--error-glow)' : 'var(--success-glow)',
                              border: '1px solid',
                              borderColor: u.status === 'active' ? 'var(--error)' : 'var(--success)',
                              color: u.status === 'active' ? 'var(--error)' : 'var(--success)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {u.status === 'active' ? <UserMinus size={12} /> : <UserCheck size={12} />}
                            {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL 3: Moderation Queue */}
        {activeTab === 'moderation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--accent-secondary)' }}>
              Moderation Claims Queue
            </h2>

            {flaggedItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {flaggedItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      borderColor: item.severity === 'high' ? 'var(--error)' : 'var(--warning)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}
                    className="moderation-card"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          backgroundColor: item.severity === 'high' ? 'var(--error-glow)' : 'var(--warning-glow)',
                          color: item.severity === 'high' ? 'var(--error)' : 'var(--warning)'
                        }}>
                          {item.severity} severity
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Script: {item.scriptTitle}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>"{item.claimText}"</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong>Violation description:</strong> {item.issue}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignSelf: 'center' }}>
                      <button
                        onClick={() => handleModerationResolve(item.id, 'approve')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--success)',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Check size={14} />
                        Bypass
                      </button>
                      <button
                        onClick={() => handleModerationResolve(item.id, 'reject')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--error)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                All clear! No pending boundary violations in the queue.
              </div>
            )}
          </div>
        )}

        {/* PANEL 4: Health & Logs */}
        {activeTab === 'operations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--accent-primary)' }}>
              Orchestration Health Monitoring
            </h2>

            {/* Health indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid-2">
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>n8n Webhook Endpoint Connection</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: n8nStatus === 'online' ? 'var(--success)' : 'var(--error)' }} />
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: n8nStatus === 'online' ? 'var(--success)' : 'var(--error)' }}>
                    {n8nStatus}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Video Renderer Worker Connection</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: renderStatus === 'online' ? 'var(--success)' : 'var(--error)' }} />
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: renderStatus === 'online' ? 'var(--success)' : 'var(--error)' }}>
                    {renderStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Terminal logs block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                System Orchestration Log (Live Console)
              </label>
              <div style={{
                width: '100%',
                height: '220px',
                backgroundColor: '#030712',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                overflowY: 'auto',
                border: '1px solid var(--border-color)'
              }}>
                {logs.map((log, i) => (
                  <div key={i} style={{
                    marginBottom: '6px',
                    color: log.type === 'error' ? 'var(--error)' : log.type === 'warn' ? 'var(--warning)' : '#10b981'
                  }}>
                    [{log.timestamp}] [{log.type.toUpperCase()}] {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 5: API Budget Tracker */}
        {activeTab === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--accent-secondary)' }}>
              API Resource Consumptions & Active Models
            </h2>

            {/* Budget visual bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { label: 'OpenRouter (Model: google/gemini-1.5-pro)', current: 142000, limit: 500000, unit: 'tokens', color: 'var(--accent-primary)' },
                { label: 'ElevenLabs Voice Synthesis (Model: Multilingual v2)', current: 18.5, limit: 30, unit: 'minutes', color: 'var(--accent-secondary)' },
                { label: 'Pexels API B-Roll Video Search Requests', current: 82, limit: 200, unit: 'requests', color: 'var(--success)' },
                { label: 'FastAPI Remotion Renderer Jobs', current: 12, limit: 50, unit: 'renders', color: 'var(--warning)' }
              ].map(item => {
                const percent = Math.min(100, (item.current / item.limit) * 100);
                return (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {item.current} / {item.limit} {item.unit} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    {/* Progress Track */}
                    <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-normal)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active n8n Models Configuration Details */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <Cpu size={18} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Active Backend Orchestration Models (n8n integration)</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-grid-2">
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Trend Ingestion & Script Drafting</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 700 }}>Google Gemini 1.5 Pro</span>
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--accent-glow)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>OpenRouter</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Triggered on webhook receipt inside n8n to parse trend vectors and script scene timelines in the creator's voice.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Voice & Narration Synthesis</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.95rem', color: '#06b6d4', fontWeight: 700 }}>ElevenLabs Multilingual v2</span>
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--success-glow)', color: 'var(--success)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>Cloned Voice</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Synthesizes the scripted output using ElevenLabs API to produce high-fidelity MP3 overlays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Creator DNA Inspector Modal */}
      {selectedUserDNA && (
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
            maxWidth: '600px',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
              Creator DNA Profile Inspector
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Raw config for <strong>{selectedUserDNA.email}</strong>
            </p>

            <pre style={{
              width: '100%',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: '#030712',
              color: '#34d399',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              border: '1px solid var(--border-color)',
              marginBottom: '24px'
            }}>
              {JSON.stringify(selectedUserDNA.dna, null, 2)}
            </pre>

            <button
              onClick={() => setSelectedUserDNA(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
