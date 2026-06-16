/* eVarsity School ERP Login Controller — Amala HSS */
let currentCaptcha = '';

function generateCaptcha() {
  const canvas = document.getElementById('captchaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#E2E8F0');
  grad.addColorStop(1, '#CBD5E1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Noise lines
  ctx.strokeStyle = '#94A3B8';
  for (let i = 0; i < 6; i++) {
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h);
    ctx.stroke();
  }

  // Generate code (exclude ambiguous chars)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  currentCaptcha = code;

  // Draw each character
  const colors = ['#0F766E', '#1E3A8A', '#1E1B4B', '#4C1D95', '#7C2D12', '#166534'];
  ctx.font = 'bold 20px monospace';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < code.length; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    const x = 10 + i * 24;
    const y = h / 2 + (Math.random() * 6 - 3);
    const angle = (Math.random() * 24 - 12) * Math.PI / 180;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }

  // Noise dots
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const input = document.getElementById('captchaInput');
  if (input) input.value = '';
}

document.addEventListener('DOMContentLoaded', () => {

  // ── Ensure AppState data is initialized ──
  if (typeof AppState !== 'undefined' && AppState.init) {
    AppState.init();
  }

  // System date display
  const dateDisp = document.getElementById('systemDateDisplay');
  if (dateDisp) {
    const today = new Date();
    dateDisp.innerText = today.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  // Draw captcha
  generateCaptcha();

  let activeRole = 'admin';
  const roleTabs   = document.querySelectorAll('.role-tab');
  const demoList   = document.getElementById('demo-list');
  const loginForm  = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passInput  = document.getElementById('password');
  const loader     = document.getElementById('loader');
  const captchaInput = document.getElementById('captchaInput');

  // ── Tab switching ──
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeRole = tab.dataset.role;
      updatePlaceholder();
      updateDemoCredentials();
      generateCaptcha();
    });
  });

  function updatePlaceholder() {
    const ph = { admin: 'admin / admin001', teacher: 'e.g. TCH001', student: 'e.g. STU001', parent: 'e.g. PAR001' };
    if (emailInput) emailInput.placeholder = ph[activeRole] || 'Enter User ID';
  }

  // ── Demo credentials badge ──
  function updateDemoCredentials() {
    if (!demoList) return;
    demoList.innerHTML = '';

    const credsList = [];

    if (activeRole === 'admin') {
      credsList.push({ u: 'admin', p: 'admin123' });
    } else if (activeRole === 'teacher') {
      credsList.push({ u: 'TCH001', p: 'teach123' });
      credsList.push({ u: 'TCH002', p: 'teach123' });
    } else if (activeRole === 'student') {
      credsList.push({ u: 'STU001', p: 'stud123' });
      credsList.push({ u: 'STU002', p: 'stud123' });
    } else if (activeRole === 'parent') {
      credsList.push({ u: 'PAR001', p: 'par123' });
      credsList.push({ u: 'PAR002', p: 'par123' });
    }

    credsList.forEach(cred => {
      const badge = document.createElement('span');
      badge.className = 'demo-badge';
      badge.textContent = `▶ ${cred.u} / ${cred.p}`;
      badge.style.cssText = 'cursor:pointer; margin:3px; display:inline-block; padding:4px 8px; border-radius:4px; font-size:11px; background:rgba(79,70,229,0.15); border:1px solid rgba(79,70,229,0.3);';
      badge.addEventListener('click', () => {
        emailInput.value = cred.u;
        passInput.value = cred.p;
        if (captchaInput) captchaInput.value = currentCaptcha;
      });
      demoList.appendChild(badge);
    });
  }

  // ── Password visibility toggle ──
  const togglePass = document.getElementById('togglePass');
  if (togglePass && passInput) {
    togglePass.addEventListener('click', () => {
      const isPass = passInput.getAttribute('type') === 'password';
      passInput.setAttribute('type', isPass ? 'text' : 'password');
      togglePass.textContent = isPass ? '🔒' : '👁️';
    });
  }

  // ── FORM SUBMIT ──
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Captcha check
    const captchaVal = captchaInput ? captchaInput.value.trim().toUpperCase() : '';
    if (!currentCaptcha || captchaVal !== currentCaptcha) {
      showError('Security code is incorrect. Please re-enter the captcha.');
      generateCaptcha();
      return;
    }

    const userVal = emailInput.value.trim();
    const passVal = passInput.value.trim();

    if (!userVal || !passVal) {
      showError('Please enter User ID and Password.');
      return;
    }

    let authenticated = false;
    let redirectRole  = '';

    // ── ADMIN ──
    if (activeRole === 'admin') {
      if ((userVal === 'admin' || userVal === 'admin001') && passVal === 'admin123') {
        authenticated = true;
        redirectRole  = 'admin';
        localStorage.setItem('userId', userVal);
        localStorage.setItem('userName', 'Administrator');
        localStorage.setItem('userRole', 'admin');
      }

    // ── TEACHER ──
    } else if (activeRole === 'teacher') {
      // Always init before reading
      if (typeof AppState !== 'undefined' && AppState.init) AppState.init();
      const teachers = JSON.parse(localStorage.getItem('lms_teachers') || '[]');
      const match = teachers.find(t =>
        t.id.toUpperCase() === userVal.toUpperCase() &&
        ((t.password && t.password === passVal) || passVal === 'teach123')
      );
      if (match) {
        authenticated = true;
        redirectRole  = 'teacher';
        localStorage.setItem('userId', match.id);
        localStorage.setItem('userName', match.name);
        localStorage.setItem('userRole', 'teacher');
      }

    // ── STUDENT ──
    } else if (activeRole === 'student') {
      if (typeof AppState !== 'undefined' && AppState.init) AppState.init();
      const students = JSON.parse(localStorage.getItem('lms_students') || '[]');
      const match = students.find(s =>
        s.id.toUpperCase() === userVal.toUpperCase() &&
        ((s.password && s.password === passVal) || passVal === 'stud123')
      );
      if (match) {
        authenticated = true;
        redirectRole  = 'student';
        localStorage.setItem('userId', match.id);
        localStorage.setItem('userName', match.name);
        localStorage.setItem('userRole', 'student');
      }

    // ── PARENT ──
    } else if (activeRole === 'parent') {
      if (typeof AppState !== 'undefined' && AppState.init) AppState.init();
      const students = JSON.parse(localStorage.getItem('lms_students') || '[]');
      const match = students.find(s => {
        const usernameMatch = s.parentUsername &&
          s.parentUsername.toUpperCase() === userVal.toUpperCase();
        const passwordMatch =
          passVal === 'par123' ||
          (s.parentPassword && s.parentPassword === passVal);
        return usernameMatch && passwordMatch;
      });
      if (match) {
        authenticated = true;
        redirectRole  = 'parent';
        localStorage.setItem('userId', match.parentUsername);
        localStorage.setItem('userName', match.parent || 'Parent');
        localStorage.setItem('userRole', 'parent');
        localStorage.setItem('childId', match.id);
      }
    }

    if (authenticated) {
      // Show loading overlay
      if (loader) loader.classList.add('active');
      setTimeout(() => {
        if (loader) loader.classList.remove('active');
        window.location.href = `pages/${redirectRole}/dashboard.html`;
      }, 1000);
    } else {
      showError('Invalid credentials. Please check your User ID, Password, and selected Role tab.');
      generateCaptcha();
    }
  });

  function showError(msg) {
    let errBox = document.getElementById('loginErrorBox');
    if (!errBox) {
      errBox = document.createElement('div');
      errBox.id = 'loginErrorBox';
      errBox.style.cssText = 'background:#FEE2E2; color:#B91C1C; padding:10px 14px; border-radius:6px; font-size:13px; margin-bottom:14px; border:1px solid #FECACA;';
      loginForm.insertBefore(errBox, loginForm.firstChild);
    }
    errBox.textContent = '⚠️ ' + msg;
    errBox.style.display = 'block';
    setTimeout(() => { if (errBox) errBox.style.display = 'none'; }, 5000);
  }

  // ── Initialize ──
  updatePlaceholder();
  updateDemoCredentials();
});
