/**
 * EduSphere LMS — Supabase Client Initializer
 * Shared across all pages. Must be loaded AFTER the Supabase CDN script.
 */

const SUPABASE_URL = 'https://wlmqvikxrfqfyhniavlb.supabase.co'; // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbXF2aWt4cmZxZnlobmlhdmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1Mjg5MjAsImV4cCI6MjEwMDEwNDkyMH0.1-t8E_kHFqYGkZqApDjnYjdmjgwJlt_roHdUh26twRo';

// Read anon key from a <meta> tag if available, otherwise use the hardcoded value
const _metaKey = document.querySelector('meta[name="supabase-anon-key"]');
const _anonKey = (_metaKey && _metaKey.content) || SUPABASE_ANON_KEY;

if (!_anonKey) {
  console.error('[EduSphere] SUPABASE_ANON_KEY is not configured! Add a <meta name="supabase-anon-key" content="your_key"> tag or set it in js/supabase.js');
}

// Initialize the Supabase client
const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, _anonKey)
  : null;

if (!supabase) {
  console.error('[EduSphere] Supabase JS library not loaded! Make sure you include the CDN script before supabase.js');
}

// Export globally
window.EduSupabase = supabase;
