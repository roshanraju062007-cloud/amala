/**
 * EduSphere LMS — Auth Check (Supabase Edition)
 * Validates session using localStorage + Supabase query on every protected page
 */

(async function() {
  // Get basic info from localStorage (fast check)
  const role   = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const name   = localStorage.getItem('userName');
  const token  = localStorage.getItem('authToken');

  // Determine expected role from URL path
  const path = window.location.pathname;
  let expectedRole = null;
  if (path.includes('/admin/'))   expectedRole = 'admin';
  if (path.includes('/teacher/')) expectedRole = 'teacher';
  if (path.includes('/student/')) expectedRole = 'student';
  if (path.includes('/parent/'))  expectedRole = 'parent';

  // Quick local check first
  if (!role || !userId || !token) {
    redirectToLogin();
    return;
  }

  if (expectedRole && role !== expectedRole) {
    redirectToLogin();
    return;
  }

  // Validate user exists in Supabase
  try {
    const sb = window.EduSupabase;
    if (sb) {
      const { data, error } = await sb
        .from('users')
        .select('user_id, name, role, email, avatar')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        redirectToLogin();
        return;
      }

      // Update displayed user name in header
      const nameEl   = document.getElementById('userDisplayName');
      const avatarEl = document.getElementById('userAvatar');
      const displayName = data.name || name || userId;

      if (nameEl) nameEl.textContent = displayName;
      if (avatarEl) {
        const avatarUrl = data.avatar || localStorage.getItem('userAvatar');
        if (avatarUrl) {
          avatarEl.innerHTML = `<img src="${avatarUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
          avatarEl.style.background = 'transparent';
        } else {
          const parts = displayName.split(' ');
          avatarEl.textContent = parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
          avatarEl.style.background = '';
        }
      }

      // Keep localStorage in sync
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userAvatar', data.avatar || '');
    } else {
      // Supabase not loaded yet — use cached data
      updateUIFromCache();
    }
  } catch (err) {
    // If Supabase is unreachable, allow through with cached data (offline mode)
    console.warn('Auth check failed - Supabase unreachable. Using cached session.', err.message);
    updateUIFromCache();
  }

  function updateUIFromCache() {
    const nameEl   = document.getElementById('userDisplayName');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = name || userId;
    if (avatarEl) {
      const avatarUrl = localStorage.getItem('userAvatar');
      if (avatarUrl) {
        avatarEl.innerHTML = `<img src="${avatarUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        avatarEl.style.background = 'transparent';
      } else {
        const parts = (name || userId).split(' ');
        avatarEl.textContent = parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
        avatarEl.style.background = '';
      }
    }
  }

  function redirectToLogin() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('authToken');
    // Calculate correct depth for redirect
    const parts = window.location.pathname.split('/');
    const depth = parts.length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    window.location.href = prefix + 'index.html';
  }
})();
