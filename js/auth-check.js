/* EduSphere LMS — Auth Guard + Portal Initialization
   Include AFTER app.js on every portal page */

(function() {
  'use strict';

  // ── Auth guard: redirect to login if not authenticated ──
  const role   = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');

  if (!role || !userId) {
    window.location.replace('../../index.html');
    throw new Error('Not authenticated — redirecting to login');
  }

  // ── Check the page belongs to the right role ──
  const currentPath = window.location.pathname.toLowerCase();
  const pathRole =
    currentPath.includes('/admin/')   ? 'admin'   :
    currentPath.includes('/teacher/') ? 'teacher' :
    currentPath.includes('/student/') ? 'student' :
    currentPath.includes('/parent/')  ? 'parent'  : null;

  // If page role doesn't match user role, send back to login
  if (pathRole && pathRole !== role) {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.replace('../../index.html');
    throw new Error('Role mismatch — redirecting to login');
  }

  // ── Run after DOM is ready ──
  document.addEventListener('DOMContentLoaded', () => {

    // Ensure AppState data is seeded
    if (typeof AppState !== 'undefined' && AppState.init) {
      AppState.init();
    }

    // Dark mode
    if (typeof App !== 'undefined' && App.initDark) App.initDark();
    if (typeof App !== 'undefined' && App.initSidebar) App.initSidebar();

    // Update user name chip
    const userName = localStorage.getItem('userName') || userId;
    const displayEl = document.getElementById('userDisplayName');
    const avatarEl  = document.getElementById('userAvatar');
    if (displayEl) displayEl.textContent = userName;
    if (avatarEl)  avatarEl.textContent  = userName.charAt(0).toUpperCase();

    // Update greeting in page title
    const pageTitleEl = document.querySelector('.page-title');
    if (pageTitleEl && pageTitleEl.textContent.includes('Welcome back')) {
      pageTitleEl.textContent = 'Welcome back, ' + userName;
    }

    // Highlight active sidebar link
    const currentFile = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-item a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === currentFile || href.endsWith('/' + currentFile)) {
        link.parentElement.classList.add('active');
      } else {
        link.parentElement.classList.remove('active');
      }
    });
  });
})();
