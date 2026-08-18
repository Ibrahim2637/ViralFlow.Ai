import { createBrowserClient } from '@supabase/ssr';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = !!(rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')));

const supabaseUrl = isValidUrl ? rawUrl! : 'https://placeholder-url.supabase.co';
const supabaseAnonKey = (rawKey && isValidUrl) ? rawKey : 'placeholder-anon-key';

// Client-side Supabase instance for use in React Client Components
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Utility to check if Supabase is properly configured with real credentials
export const isSupabaseConfigured = () => {
  return isValidUrl && !!rawKey;
};
