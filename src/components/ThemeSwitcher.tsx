// src/components/ThemeSwitcher.tsx
'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // initialise from localStorage or system preference (mirrors layout script)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = saved ?? (systemPrefersDark ? 'dark' : 'light');
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    } catch {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      onClick={toggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--accent-primary)',
        border: '1px solid var(--border-color)',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon size={18} style={{ color: 'var(--accent-primary)' }} />
      ) : (
        <Sun size={18} style={{ color: 'var(--warning)' }} />
      )}
    </button>
  );
}
