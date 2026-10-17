export interface RenderedDraft {
  id: string;
  title: string;
  hook: string;
  status: 'rendering' | 'ready' | 'published';
  progress?: number;
  duration: number;
  video_url: string;
  scenesCount?: number;
  storyboard?: any[];
  render_manifest?: any;
  qa_score?: number;
  claimsCount?: number;
  claimsVerified?: number;
  platform?: string;
  created_at: string;
}

const STORAGE_KEY = 'vf_production_drafts';
const ACTIVE_DRAFT_KEY = 'vf_active_draft_id';

export function getStoredDrafts(): RenderedDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get stored drafts', e);
    return [];
  }
}

export function saveStoredDraft(draft: RenderedDraft): void {
  if (typeof window === 'undefined') return;
  try {
    const drafts = getStoredDrafts();
    const existingIdx = drafts.findIndex(d => d.id === draft.id);
    if (existingIdx >= 0) {
      drafts[existingIdx] = draft;
    } else {
      drafts.unshift(draft);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    localStorage.setItem(ACTIVE_DRAFT_KEY, draft.id);
  } catch (e) {
    console.error('Failed to save draft', e);
  }
}

export function getActiveDraft(): RenderedDraft | null {
  if (typeof window === 'undefined') return null;
  const drafts = getStoredDrafts();
  if (drafts.length === 0) return null;
  const activeId = localStorage.getItem(ACTIVE_DRAFT_KEY);
  if (activeId) {
    const found = drafts.find(d => d.id === activeId);
    if (found) return found;
  }
  return drafts[0];
}

export function setActiveDraftId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_DRAFT_KEY, id);
}
