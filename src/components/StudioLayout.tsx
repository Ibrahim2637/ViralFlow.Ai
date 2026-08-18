'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-base)' }}>
      {/* Responsive Navigation Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

      {/* Top Header Bar when Sidebar is Collapsed (Desktop Only) */}
      {isCollapsed && (
        <header 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '60px',
            padding: '0 24px',
            backgroundColor: 'transparent',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-color)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 48,
          }}
          className="collapsed-header-bar"
        >
          <button 
            onClick={() => setIsCollapsed(false)}
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Expand Sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Centered logo on the top header bar when sidebar is collapsed */}
          <Link href="/" style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
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

          {/* Empty spacer to balance the flex items */}
          <div style={{ width: '36px' }} />
        </header>
      )}

      {/* Primary Page Viewport */}
      <main 
        style={{
          flex: 1,
          padding: '32px 24px',
          paddingTop: isCollapsed ? '92px' : '32px',
          marginLeft: isCollapsed ? '0' : '260px',
          width: isCollapsed ? '100%' : 'calc(100% - 260px)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left var(--transition-normal), width var(--transition-normal), padding-top var(--transition-normal)'
        }} 
        className="studio-main-content"
      >
        {children}
      </main>
    </div>
  );
}
