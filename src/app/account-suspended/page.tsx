'use client';

import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { AlertOctagon, LogOut, HelpCircle } from 'lucide-react';

export default function AccountSuspendedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear demo session if any
    localStorage.removeItem('demo-session');
    
    // Clear Supabase session
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error(err);
      }
    }
    
    router.push('/login');
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
        maxWidth: '480px',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
        borderTop: '4px solid var(--error)'
      }}>
        {/* Warning Icon */}
        <div style={{
          backgroundColor: 'var(--error-glow)',
          color: 'var(--error)',
          padding: '16px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertOctagon size={48} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '16px',
          fontFamily: 'var(--font-heading)'
        }}>
          Account Suspended
        </h1>

        {/* Description */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          Your creator access to <strong>ViralFlow AI</strong> has been temporarily suspended by the system administrator. 
          This could be due to a policy violation, platform audit, or billing issue.
        </p>

        {/* Action Blocks */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Help Block */}
          <a
            href="mailto:support@viralflow.ai"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <HelpCircle size={18} />
            Contact Administration Support
          </a>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--error)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error-glow)';
              e.currentTarget.style.borderColor = 'var(--error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
