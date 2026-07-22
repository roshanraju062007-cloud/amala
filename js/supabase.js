/**
 * EduSphere LMS — Supabase Client Initializer
 * Shared across all pages. Must be loaded AFTER the Supabase CDN script.
 */

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = ''; // Paste your anon public key here

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
