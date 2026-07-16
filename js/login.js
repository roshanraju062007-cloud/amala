/**
 * EduSphere LMS — Real Authentication (PostgreSQL + JWT)
 * Replaces old localStorage-based login
 */

let currentCaptcha = '';

function generateCaptcha() {
  const canvas = document.getElementById('captchaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Random noise lines
  ctx.strokeStyle = '#94A3B8';
  for (let i = 0; i < 5; i++) {
    ctx.lineWidth = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }

  // Alphanumeric text
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  currentCaptcha = code;

  // Draw characters with random properties
  ctx.font = 'bold 22px sans-serif';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < code.length; i++) {
    ctx.fillStyle = ['#0F766E', '#1E3A8A', '#1E1B4B', '#4C1D95'][Math.floor(Math.random() * 4)];
    const x = 12 + i * 22;
    const y = canvas.height / 2 + (Math.random() * 8 - 4);
    const angle = (Math.random() * 30 - 15) * Math.PI / 180;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }

  // Random noise dots
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Clear input
  const input = document.getElementById('captchaInput');
  if (input) input.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Generate initial Captcha
  generateCaptcha();

  // Role selection tabs
  const tabs = document.querySelectorAll('.role-tab');
  let activeRole = 'admin';
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const loader = document.getElementById('loader');
  const loginForm = document.getElementById('loginForm');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeRole = tab.dataset.role;

      // Update placeholders
      const placeholderMap = {
        admin:   'admin',
        teacher: 'Teacher ID',
        student: 'Student ID',
        parent:  'Parent Username'
      };
      if (emailInput) emailInput.placeholder = 'Enter ' + (placeholderMap[activeRole] || 'User ID');
    });
  });

  // Password toggle visibility
  const togglePass = document.getElementById('togglePass');
  if (togglePass && passInput) {
    togglePass.addEventListener('click', () => {
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);
      togglePass.textContent = type === 'password' ? '👁️' : '🔒';
    });
  }

  // Handle Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate Captcha
      const captchaVal = (document.getElementById('captchaInput')?.value || '').trim().toUpperCase();
      if (captchaVal !== currentCaptcha) {
        alert('Incorrect Security Verification Code (Captcha). Please try again.');
        generateCaptcha();
        return;
      }

      const userId = (emailInput?.value || '').trim();
      const password = passInput?.value || '';
      const rememberMe = document.getElementById('remember')?.checked || false;

      if (!userId || !password) {
        alert('Please enter both User ID and Password.');
        return;
      }

      // Show loader
      if (loader) loader.style.display = 'flex';

      try {
        const apiBase = window.AppApiBaseUrl || '';
        const response = await fetch(`${apiBase}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookie
          body: JSON.stringify({ user_id: userId, password, role: activeRole, rememberMe }),
        });

        const rawText = await response.text();
        let data;
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          const preview = rawText.replace(/\s+/g, ' ').slice(0, 140);
          throw new Error(`Login failed: server returned non-JSON (${response.status} ${response.statusText}). ${preview}`);
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Authentication failed.');
        }

        // Store session info
        sessionStorage.setItem('userRole', data.user.role);
        sessionStorage.setItem('userId', data.user.userId);
        sessionStorage.setItem('userName', data.user.name);
        sessionStorage.setItem('userAvatar', data.user.avatar || '');
        if (data.user.childId) sessionStorage.setItem('childId', data.user.childId);

        // Backup to localStorage for older static pages
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userAvatar', data.user.avatar || '');
        localStorage.setItem('authToken', data.token);
        if (data.user.childId) localStorage.setItem('childId', data.user.childId);

        // Redirect to portal dashboard
        const redirectMap = {
          admin:   'pages/admin/dashboard.html',
          teacher: 'pages/teacher/dashboard.html',
          student: 'pages/student/dashboard.html',
          parent:  'pages/parent/dashboard.html',
          parent:  'pages/parent/dashboard.html',
        };
        const dest = redirectMap[data.user.role] || 'pages/admin/dashboard.html';

        setTimeout(() => { window.location.href = dest; }, 500);

      } catch (err) {
        if (loader) loader.style.display = 'none';
        alert(err.message || 'An error occurred during authentication.');
        generateCaptcha();
      }
    });
  }
});
