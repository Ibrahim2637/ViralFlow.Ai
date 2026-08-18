'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Sparkles, LayoutDashboard, Settings, LogOut, Menu, X, User, 
  TrendingUp, BookOpen, Lightbulb, Film, Upload, BarChart2, ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  onMobileToggle?: (isOpen: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ onMobileToggle, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('creator@viralflow.ai');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        try {
          const sessionObj = JSON.parse(demoSession);
          setUserEmail(sessionObj.user.email);
          setIsAdmin(sessionObj.role === 'admin');
        } catch (e) {
          console.error(e);
        }
        return;
      }

      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setUserEmail(session.user.email || '');
            const { data: profile } = await supabase
              .from('creators')
              .select('role')
              .eq('id', session.user.id)
              .single();
            setIsAdmin(profile?.role === 'admin');
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchSession();
  }, [pathname]);

  const toggleSidebar = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (onMobileToggle) {
      onMobileToggle(nextState);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('demo-session');
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  // Check if current route is administrative
  const isAdminView = pathname.startsWith('/admin');

  // Creator Sub-pages navigation links
  const creatorLinks = [
    { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trend Radar', href: '/dashboard/radar', icon: TrendingUp },
    { name: 'Creator DNA Studio', href: '/dashboard/creator-dna', icon: BookOpen },
    { name: 'Strategy Lab', href: '/dashboard/ideas', icon: Lightbulb },
    { name: 'Script Studio', href: '/dashboard/scripts', icon: Film },
    { name: 'Video Approvals', href: '/dashboard/approvals', icon: ShieldCheck },
    { name: 'Publishing Manager', href: '/dashboard/publishing', icon: Upload },
    { name: 'Analytics Hub', href: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Automation Settings', href: '/dashboard/settings', icon: Settings }
  ];

  // Admin specific navigation links
  const adminLinks = [
    { name: 'Admin Operations', href: '/admin', icon: ShieldCheck }
  ];

  const renderLinks = (links: typeof creatorLinks) => {
    return links.map((link) => {
      const Icon = link.icon;
      const isActive = pathname === link.href;
      return (
        <Link
          key={link.name}
          href={link.href}
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
            backgroundColor: isActive ? 'var(--accent-glow)' : 'transparent',
            fontWeight: isActive ? 600 : 500,
            transition: 'all var(--transition-fast)',
            borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Icon size={18} />
          <span style={{ fontSize: '0.85rem' }}>{link.name}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '60px',
        padding: '0 20px',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 52,
      }} className="mobile-header-bar">
        <button onClick={toggleSidebar} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {/* Mobile Logo links to landing page / */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--accent-primary)',
          fontSize: '1.25rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)'
        }}>
          <Sparkles size={20} />
          <span>ViralFlow</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Mobile Overlay Background */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 48,
          }}
          className="mobile-backdrop"
        />
      )}

      {/* Sidebar main view */}
      <aside 
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '260px',
          height: '100vh',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-color)',
          padding: '24px 16px',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transform: isCollapsed ? 'translateX(-260px)' : 'translateX(0)',
          transition: 'transform var(--transition-normal)'
        }}
        className={`sidebar-nav ${isOpen ? 'open' : ''}`}
      >
        {/* Logo links back to landing page with toggle button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingLeft: '8px' }}>
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
          
          {onToggleCollapse && (
            <button 
              onClick={onToggleCollapse}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              className="desktop-only-toggle"
              aria-label="Collapse Sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sidebar dynamic nav contents */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
          {isAdminView ? (
            // ADMIN PANEL ONLY SHOWS ADMIN OPERATION DETAILS
            <>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, paddingLeft: '16px', marginBottom: '8px' }}>
                System Administration
              </div>
              {renderLinks(adminLinks)}
            </>
          ) : (
            // CREATOR PATHS ONLY SHOWS CREATOR LINK DETAILS
            <>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, paddingLeft: '16px', marginBottom: '8px' }}>
                Creator Workspace
              </div>
              {renderLinks(creatorLinks)}
            </>
          )}
        </nav>

        {/* Footer info card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-glow)',
              border: '1px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              fontWeight: 600,
            }}>
              <User size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '150px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userEmail.split('@')[0]}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userEmail}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '8px' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--error)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'opacity var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>

            <div className="desktop-theme-toggle">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
