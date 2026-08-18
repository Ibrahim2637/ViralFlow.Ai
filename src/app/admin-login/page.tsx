'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { Lock, Mail, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Demo Mode logic
    if (!dbConfigured) {
      setTimeout(() => {
        setLoading(false);
        if (email === 'admin@viralflow.ai') {
          localStorage.setItem('demo-session', JSON.stringify({
            user: { email, id: 'demo-admin-uuid-9999' },
            role: 'admin',
            status: 'active'
          }));
          router.push('/admin');
        } else {
          setErrorMessage('Access Denied. Only verified system administrators can log in here.');
        }
      }, 800);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (data.session) {
        // Query to check role
        const { data: profile } = await supabase
          .from('creators')
          .select('role, status')
          .eq('id', data.session.user.id)
          .single();

        if (profile?.role === 'admin' && profile?.status === 'active') {
          router.push('/admin');
        } else {
          await supabase.auth.signOut();
          setErrorMessage('Access Denied. Your account is not configured with administrator permissions.');
        }
      }
    } catch (err) {
      setErrorMessage('Unexpected server error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-base)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <ThemeToggle />
      </div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        borderRadius: 'var(--radius-lg)',
        padding: '44px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        borderTop: '4px solid var(--accent-secondary)'
      }}>
        {/* Admin Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--accent-secondary)',
            fontSize: '1.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            marginBottom: '8px'
          }}>
            <Cpu size={26} />
            <span>Admin Console</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Authorized system operations access only.
          </p>
        </div>

        {/* Demo warn */}
        {!dbConfigured && (
          <div style={{
            backgroundColor: 'var(--warning-glow)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '0.8rem',
            color: 'var(--text-primary)',
            display: 'flex',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div>
              <strong>Console Mode:</strong> Enter <code style={{ color: 'var(--accent-secondary)' }}>admin@viralflow.ai</code> to bypass credentials and preview admin tools.
            </div>
          </div>
        )}

        {errorMessage && (
          <div style={{
            backgroundColor: 'var(--error-glow)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: 'var(--error)',
            display: 'flex',
            gap: '8px'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Operator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@viralflow.ai"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Security Key
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-secondary)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color var(--transition-fast)',
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)',
              marginTop: '8px'
            }}
          >
            {loading ? 'Authenticating System...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
