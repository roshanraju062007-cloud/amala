/* eVarsity School ERP Login Controller */
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
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous like 0, 1, O, I
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
  // Initialize App State
  if (typeof AppState !== 'undefined') {
    AppState.init();
  }

  // Display System Date
  const dateDisp = document.getElementById('systemDateDisplay');
  if (dateDisp) {
    const today = new Date();
    dateDisp.innerText = today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Generate Captcha
  generateCaptcha();

  let activeRole = 'admin';
  const roleTabs = document.querySelectorAll('.role-tab');
  const demoList = document.getElementById('demo-list');
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const loader = document.getElementById('loader');

  // Switch tabs
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeRole = tab.dataset.role;
      updateDemoCredentials();
    });
  });

  function updateDemoCredentials() {
    demoList.innerHTML = '';
    let userVal = '';
    let passVal = '';
    
    if (activeRole === 'admin') {
      userVal = 'admin';
      passVal = 'admin123';
    } else if (activeRole === 'teacher') {
      userVal = 'TCH001';
      passVal = 'teach123';
    } else if (activeRole === 'student') {
      userVal = 'STU001';
      // Fetch dynamic DOB password from localStorage
      const students = JSON.parse(localStorage.getItem('lms_students')) || [];
      const match = students.find(s => s.id === 'STU001');
      passVal = match ? match.password : '12042011';
    } else if (activeRole === 'parent') {
      userVal = 'PAR001';
      passVal = 'par123';
    }

    const badge = document.createElement('span');
    badge.className = 'demo-badge';
    badge.textContent = `Use Demo: ${userVal} / ${passVal}`;
    badge.addEventListener('click', () => {
      emailInput.value = userVal;
      emailInput.dispatchEvent(new Event('input'));
      passInput.value = passVal;
      passInput.dispatchEvent(new Event('input'));
      // Pre-fill captcha for easy testing!
      document.getElementById('captchaInput').value = currentCaptcha;
    });
    demoList.appendChild(badge);
  }

  // Password toggle visibility
  const togglePass = document.getElementById('togglePass');
  if (togglePass) {
    togglePass.addEventListener('click', () => {
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);
      togglePass.textContent = type === 'password' ? '👁️' : '🔒';
    });
  }

  // Handle submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Captcha validation
    const captchaVal = document.getElementById('captchaInput').value.trim().toUpperCase();
    if (captchaVal !== currentCaptcha) {
      alert('Security Verification Code (Captcha) is incorrect. Please try again.');
      generateCaptcha();
      return;
    }

    const userVal = emailInput.value.trim();
    const passVal = passInput.value.trim();

    if (!userVal || !passVal) {
      alert('Please enter both credentials.');
      return;
    }

    let authenticated = false;
    let redirectRole = '';
    let displayName = '';

    if (activeRole === 'admin') {
      if ((userVal === 'admin001' || userVal === 'admin') && passVal === 'admin123') {
        authenticated = true;
        redirectRole = 'admin';
        displayName = 'Administrator';
        localStorage.setItem('userId', userVal);
        localStorage.setItem('userName', 'Administrator');
      }
    } else if (activeRole === 'teacher') {
      const teachers = JSON.parse(localStorage.getItem('lms_teachers')) || [];
      const match = teachers.find(t => t.id === userVal && (t.password || 'teach123') === passVal);
      if (match) {
        authenticated = true;
        redirectRole = 'teacher';
        displayName = match.name;
        localStorage.setItem('userId', match.id);
        localStorage.setItem('userName', match.name);
      }
    } else if (activeRole === 'student') {
      const students = JSON.parse(localStorage.getItem('lms_students')) || [];
      const match = students.find(s => s.id === userVal && (s.password === passVal || passVal === 'stud123'));
      if (match) {
        authenticated = true;
        redirectRole = 'student';
        displayName = match.name;
        localStorage.setItem('userId', match.id);
        localStorage.setItem('userName', match.name);
      }
    } else if (activeRole === 'parent') {
      const students = JSON.parse(localStorage.getItem('lms_students')) || [];
      const match = students.find(s => s.parentUsername === userVal && (s.parentPassword === passVal || s.password === passVal || passVal === 'par123'));
      if (match) {
        authenticated = true;
        redirectRole = 'parent';
        displayName = match.parent;
        localStorage.setItem('userId', match.parentUsername);
        localStorage.setItem('userName', match.parent);
        localStorage.setItem('childId', match.id);
      }
    }

    if (authenticated) {
      const loaderText = document.getElementById('loaderText');
      if (loaderText) {
        loaderText.innerText = 'Connecting to eVarsity® School database...';
      }
      loader.classList.add('active');
      setTimeout(() => {
        loader.classList.remove('active');
        localStorage.setItem('userRole', redirectRole);
        window.location.href = `pages/${redirectRole}/dashboard.html`;
      }, 1200);
    } else {
      alert('Invalid ID or Password. Check credentials and selected role.');
      generateCaptcha();
    }
  });

  // Init
  updateDemoCredentials();
});
