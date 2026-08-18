'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { Mail, Lock, AlertCircle, Sparkles, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);

  useEffect(() => {
    setDbConfigured(isSupabaseConfigured());
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Demo Mock Mode
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

        // Add defaults to lists if empty to verify admin access
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

        const emailExists = existingUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          setErrorMessage('An account with this email address already exists.');
          return;
        }

        const newUser = {
          email,
          password,
          id: 'demo-uuid-' + Math.random().toString(36).substr(2, 9),
          role: 'creator',
          status: 'active'
        };

        existingUsers.push(newUser);
        localStorage.setItem('demo-users', JSON.stringify(existingUsers));

        // Save mock signup session
        localStorage.setItem('demo-session', JSON.stringify({
          user: {
            email: email,
            id: newUser.id
          },
          role: 'creator',
          status: 'active'
        }));
        router.push('/');
      }, 800);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (data.user) {
        // Create an entry in creators table via triggers or client
        const { error: dbError } = await supabase
          .from('creators')
          .insert([
            { id: data.user.id, email: data.user.email, role: 'creator', status: 'active' }
          ]);
        
        if (dbError) {
          console.error("Error creating creator entry:", dbError);
        }
        
        alert('Registration successful! Please check your email for a verification link.');
        router.push('/login');
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
        {/* Header */}
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
            Register to build your Creator DNA
          </p>
        </div>

        {/* Demo Notification */}
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
              <strong>Demo Mode:</strong> Any register credentials will bypass verification and redirect directly to `/onboarding`.
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

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                  padding: '10px 10px 10px 40px',
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

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                placeholder="Minimum 6 characters"
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
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

          {/* Confirm Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Confirm Password
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
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
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-primary)'; }}
          >
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{
            color: 'var(--accent-primary)',
            fontWeight: 500,
            textDecoration: 'underline'
          }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
