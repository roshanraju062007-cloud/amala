/**
 * EduSphere LMS — Supabase Client Initializer
 * Shared across all pages. Must be loaded AFTER the Supabase CDN script.
 */

const SUPABASE_URL = 'https://wlmqvikxrfqfyhniavlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbXF2aWt4cmZxZnlobmlhdmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1Mjg5MjAsImV4cCI6MjEwMDEwNDkyMH0.1-t8E_kHFqYGkZqApDjnYjdmjgwJlt_roHdUh26twRo';

// Read anon key from a <meta> tag if available, otherwise use the hardcoded value
const _metaKey = document.querySelector('meta[name="supabase-anon-key"]');
const _anonKey = (_metaKey && _metaKey.content) || SUPABASE_ANON_KEY;

if (!_anonKey) {
  console.error('[EduSphere] SUPABASE_ANON_KEY is not configured!');
}

// Initialize the Supabase client — handle multiple CDN export formats
let _sbClient = null;
try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    _sbClient = window.supabase.createClient(SUPABASE_URL, _anonKey);
  } else if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    _sbClient = supabase.createClient(SUPABASE_URL, _anonKey);
  }
} catch (e) {
  console.error('[EduSphere] Failed to initialize Supabase client:', e);
}

if (!_sbClient) {
  console.error('[EduSphere] Supabase JS library not loaded! window.supabase =', typeof window.supabase);
}

// Export globally
window.EduSupabase = _sbClient;

