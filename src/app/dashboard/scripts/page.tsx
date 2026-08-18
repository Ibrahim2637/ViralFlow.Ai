'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Film, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
interface ScriptItem {
  id: string;
  title: string;
  hook: string;
  scenesCount: number;
  status: 'draft' | 'rendering' | 'ready' | 'published';
  claimsVerified: string;
}

export default function ScriptStudioListPage() {
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchScripts = async () => {
      setLoading(true);
      let userId = '';
      
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        try {
          userId = JSON.parse(demoSession).user.id;
        } catch (e) {
          console.error(e);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          userId = session.user.id;
        }
      }

      let scriptList: ScriptItem[] = [];

      if (userId) {
        try {
          const { data: dbScripts, error } = await supabase
            .from('scripts')
            .select(`
              id,
              claims_json,
              content_ideas!inner (
                id,
                angle,
                hook,
                status,
                creator_id,
                trends:trend_id (title)
              )
            `)
            .eq('content_ideas.creator_id', userId);

          if (dbScripts) {
            scriptList = dbScripts.map((s: any) => {
              const idea = s.content_ideas;
              const trendObj = Array.isArray(idea?.trends) ? idea.trends[0] : idea?.trends;
              
              // Parse claims details
              let claimsCount = 0;
              let claimsVerified = 0;
              try {
                if (s.claims_json) {
                  const parsedClaims = Array.isArray(s.claims_json) ? s.claims_json : JSON.parse(s.claims_json);
                  claimsCount = parsedClaims.length;
                  claimsVerified = parsedClaims.filter((c: any) => c.status === 'verified').length;
                }
              } catch (e) {}

              return {
                id: s.id,
                title: trendObj?.title || idea?.angle || 'Untitled Script',
                hook: idea?.hook || 'No hook generated',
                scenesCount: 4, // placeholder
                status: idea?.status || 'draft',
                claimsVerified: `${claimsVerified}/${claimsCount} Claims Verified`
              };
            });
          }
        } catch (err) {
          console.error('Error fetching scripts:', err);
        }
      }

      setScripts(scriptList);
      setLoading(false);
    };

    fetchScripts();
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px' }}>
          Script Studio Timelines
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your compiled script timelines, edit scene details, or inspect claims fact-checking validation details.
        </p>
      </div>

      {/* List */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {scripts.map((s, index) => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '16px',
              transition: 'background-color var(--transition-fast)'
            }}
            className="table-row-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '240px' }}>
              <div style={{
                backgroundColor: 'var(--accent-glow)',
                color: 'var(--accent-primary)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)'
              }}>
                <Film size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{s.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '360px' }}>
                  Hook: "{s.hook}"
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {s.scenesCount} Scenes
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                {s.claimsVerified}
              </div>
              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: s.status === 'ready' ? 'var(--success-glow)' : 'var(--border-color)',
                  color: s.status === 'ready' ? 'var(--success)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}>
                  {s.status}
                </span>
              </div>
              <Link href={`/editor/${s.id}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                color: 'var(--accent-primary)',
                fontWeight: 600
              }}>
                Open Studio
                <ChevronRight size={16} />
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
