'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // If Supabase is NOT configured, run in Demo Mock Mode
    if (!dbConfigured) {
      setTimeout(() => {
        setLoading(false);
        const existingUsersRaw = localStorage.getItem('demo-users');
        let existingUsers: any[] = [];
        try {
          if (existingUsersRaw) {
            existingUsers = JSON.parse(existingUsersRaw);
          }
        } catch (e) {
          console.error(e);
        }

        // Add default admin/creator users if they don't exist
        const hasAdmin = existingUsers.some((u: any) => u.email === 'admin@viralflow.ai');
        if (!hasAdmin) {
          existingUsers.push({
            email: 'admin@viralflow.ai',
            password: 'password',
            id: 'demo-admin-uuid',
            role: 'admin',
            status: 'active'
          });
        }
        const hasCreator = existingUsers.some((u: any) => u.email === 'creator@viralflow.ai');
        if (!hasCreator) {
          existingUsers.push({
            email: 'creator@viralflow.ai',
            password: 'password',
            id: 'demo-creator-uuid',
            role: 'creator',
            status: 'active'
          });
        }
        const hasSuspended = existingUsers.some((u: any) => u.email === 'suspended@viralflow.ai');
        if (!hasSuspended) {
          existingUsers.push({
            email: 'suspended@viralflow.ai',
            password: 'password',
            id: 'demo-suspended-uuid',
            role: 'creator',
            status: 'suspended'
          });
        }

        // Find the user
        const matchedUser = existingUsers.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!matchedUser && email !== 'creator@viralflow.ai' && email !== 'admin@viralflow.ai' && email !== 'suspended@viralflow.ai') {
          setErrorMessage('Invalid email or password.');
          return;
        }

        const userSession = {
          user: {
            email: email,
            id: matchedUser?.id || 'demo-uuid-1234'
          },
          role: matchedUser?.role || (email === 'admin@viralflow.ai' ? 'admin' : 'creator'),
          status: matchedUser?.status || (email === 'suspended@viralflow.ai' ? 'suspended' : 'active')
        };

        localStorage.setItem('demo-session', JSON.stringify(userSession));

        if (userSession.status === 'suspended') {
          router.push('/account-suspended');
        } else if (userSession.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
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
        // Query user metadata or creator profile to redirect accordingly
        const { data: profile } = await supabase
          .from('creators')
          .select('role, status')
          .eq('id', data.session.user.id)
          .single();
        
        if (profile?.status === 'suspended') {
          router.push('/account-suspended');
        } else if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
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
      {/* Theme Toggle in top-right */}
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <ThemeToggle />
      </div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--accent-primary)',
            fontSize: '1.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            marginBottom: '8px'
          }}>
            <Sparkles size={28} />
            <span>ViralFlow AI</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Login to your autonomous content studio
          </p>
        </div>

        {/* Placeholder Warning Banner */}
        {!dbConfigured && (
          <div style={{
            backgroundColor: 'var(--warning-glow)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-primary)'
          }}>
            <AlertCircle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div>
              <strong>Demo Mode Active:</strong> Supabase environment variables are not configured. 
              Use <code style={{ color: 'var(--accent-secondary)' }}>admin@viralflow.ai</code> for Admin preview, 
              or any other email for Creator preview.
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
            display: 'flex',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--error)'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
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
          </div>

          {/* Password input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
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
                  fontSize: '0.95rem',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color var(--transition-fast)',
              boxShadow: 'var(--shadow-glow)',
              marginTop: '8px',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-primary)'; }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer links */}
        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{
            color: 'var(--accent-primary)',
            fontWeight: 500,
            textDecoration: 'underline'
          }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}
