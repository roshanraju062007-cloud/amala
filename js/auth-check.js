/**
 * EduSphere LMS — Real Auth Check (PostgreSQL + JWT)
 * Validates session via /api/auth/me on every protected page
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

  // Validate token with the server (verify against PostgreSQL)
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token },
      credentials: 'include',
    });

    if (!res.ok) {
      redirectToLogin();
      return;
    }

    const data = await res.json();
    if (!data.success) {
      redirectToLogin();
      return;
    }

    // Update displayed user name in header
    const nameEl   = document.getElementById('userDisplayName');
    const avatarEl = document.getElementById('userAvatar');
    const displayName = data.user.name || name || userId;

    if (nameEl) nameEl.textContent = displayName;
    if (avatarEl) {
      const parts = displayName.split(' ');
      avatarEl.textContent = parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
    }

    // Keep localStorage in sync
    localStorage.setItem('userName', data.user.name);

  } catch (err) {
    // If server is unreachable but we have a token, allow through (offline mode)
    console.warn('Auth check failed - server unreachable. Using cached session.', err.message);
    // Still update UI with cached name
    const nameEl   = document.getElementById('userDisplayName');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = name || userId;
    if (avatarEl) {
      const parts = (name || userId).split(' ');
      avatarEl.textContent = parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
    }
  }

  function redirectToLogin() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    // Calculate correct depth for redirect
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
    window.location.href = prefix + 'index.html';
  }
})();
