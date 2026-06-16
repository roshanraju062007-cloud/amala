const fs = require('fs');
const path = require('path');

// Helper to write files
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created/Updated: ${filePath}`);
}

// 1. UPDATE js/app.js to include all state models
const appJsContent = `/* EduSphere LMS Shared Utilities with LocalStorage State Management */
const App = {
  toggleDark() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) toggleBtn.textContent = isDark ? '☀️' : '🌙';
  },

  initDark() {
    const savedDark = localStorage.getItem('darkMode');
    const isDark = savedDark === 'enabled' || (!savedDark && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) toggleBtn.textContent = isDark ? '☀️' : '🌙';
  },

  openModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('open');
  },

  closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('open');
  },

  showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    let borderCol = 'var(--primary)';
    if (type === 'success') borderCol = 'var(--success)';
    if (type === 'error') borderCol = 'var(--danger)';
    if (type === 'warning') borderCol = 'var(--warning)';
    toast.style.borderLeftColor = borderCol;
    toast.innerHTML = \`<span>\${msg}</span>\`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  logout() {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('userRole');
      window.location.href = '../../index.html';
    }
  },

  initSidebar() {
    const ham = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (ham && sidebar) {
      ham.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !ham.contains(e.target) && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    }

    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    const links = document.querySelectorAll('.sidebar-item a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes(pageName)) {
        link.parentElement.classList.add('active');
      } else {
        link.parentElement.classList.remove('active');
      }
    });
  }
};

// Global App State Controller
const AppState = {
  init() {
    if (!localStorage.getItem('lms_students')) {
      localStorage.setItem('lms_students', JSON.stringify([
        { id: 'ADM2026001', name: 'Aditya Patel', class: '10th Standard', section: 'A', parent: 'Suresh Patel', phone: '+91 9876543210', attendance: 92, fee: 'Paid' },
        { id: 'ADM2026002', name: 'Pooja Sharma', class: '12th Science', section: 'A', parent: 'Ramesh Sharma', phone: '+91 8765432109', attendance: 68, fee: 'Partial' },
        { id: 'ADM2026003', name: 'Rohan Gupta', class: '10th Standard', section: 'A', parent: 'Alok Gupta', phone: '+91 9543210987', attendance: 85, fee: 'Paid' },
        { id: 'ADM2026004', name: 'Sneha Roy', class: '9th Standard', section: 'A', parent: 'Pankaj Roy', phone: '+91 9123456789', attendance: 71, fee: 'Unpaid' },
        { id: 'ADM2026005', name: 'Amit Shah', class: '10th Standard', section: 'B', parent: 'Vijay Shah', phone: '+91 8234567890', attendance: 94, fee: 'Paid' }
      ]));
    }
    if (!localStorage.getItem('lms_teachers')) {
      localStorage.setItem('lms_teachers', JSON.stringify([
        { id: 'TCH001', name: 'Rajesh Kumar', dept: 'Mathematics', subjects: 'Algebra, Geometry', phone: '+91 9441234567', status: 'Full-Time' },
        { id: 'TCH002', name: 'Priya Sharma', dept: 'Science', subjects: 'Physics, Chemistry', phone: '+91 9441112223', status: 'Full-Time' },
        { id: 'TCH003', name: 'Alok Dixit', dept: 'Science', subjects: 'Chemistry, Lab', phone: '+91 9445556667', status: 'Full-Time' },
        { id: 'TCH004', name: 'Sumita Roy', dept: 'English', subjects: 'Grammar, Literature', phone: '+91 9447778889', status: 'Part-Time' }
      ]));
    }
    if (!localStorage.getItem('lms_classes')) {
      localStorage.setItem('lms_classes', JSON.stringify([
        { name: 'LKG', sections: ['A', 'B'], teacher: 'Mrs. Mary L.', students: 68 },
        { name: 'UKG', sections: ['A', 'B', 'C'], teacher: 'Mrs. Jane D.', students: 95 },
        { name: '10th Standard', sections: ['A', 'B', 'C', 'D'], teacher: 'Mr. Rajesh Kumar', students: 152 },
        { name: '12th Science', sections: ['A', 'B'], teacher: 'Mrs. Priya Sharma', students: 82 }
      ]));
    }
    if (!localStorage.getItem('lms_subjects')) {
      localStorage.setItem('lms_subjects', JSON.stringify([
        { code: 'MAT101', name: 'Mathematics', class: '10th Standard', periods: 6, type: 'Core' },
        { code: 'PHY121', name: 'Physics', class: '12th Science', periods: 5, type: 'Core' },
        { code: 'ENG102', name: 'English Language', class: '10th Standard', periods: 4, type: 'Language' },
        { code: 'SCI101', name: 'Science', class: '10th Standard', periods: 5, type: 'Core' }
      ]));
    }
    if (!localStorage.getItem('lms_exams')) {
      localStorage.setItem('lms_exams', JSON.stringify([
        { name: 'Quarterly Examination', type: 'Quarterly', classes: '10th Standard', dates: '18 Jun - 25 Jun 2026', marks: 100, status: 'Scheduled' },
        { name: 'Unit Test 2', type: 'Unit Test', classes: '10th Standard', dates: '02 Jul - 05 Jul 2026', marks: 25, status: 'Draft' }
      ]));
    }
    if (!localStorage.getItem('lms_timetable')) {
      localStorage.setItem('lms_timetable', JSON.stringify({}));
    }
    if (!localStorage.getItem('lms_attendance')) {
      localStorage.setItem('lms_attendance', JSON.stringify({}));
    }
    if (!localStorage.getItem('lms_notices')) {
      localStorage.setItem('lms_notices', JSON.stringify([
        { time: '14:15', msg: 'Attendance marked for 10-A by Mr. Rajesh' },
        { time: '13:00', msg: 'Student "Karan Shah" admitted to UKG' },
        { time: '11:30', msg: 'Quarterly results published for Class 12 Science' },
        { time: '10:00', msg: 'Notification sent to parents: Holiday on 18th June' }
      ]));
    }
    if (!localStorage.getItem('lms_assignments')) {
      localStorage.setItem('lms_assignments', JSON.stringify([
        { id: 'ASN001', title: 'Quadratic Equations Practice', subject: 'Mathematics', class: '10th Standard', section: 'A', due: '2026-06-20', instructions: 'Solve all questions from exercise 4.2', marks: 50, submissions: 4 }
      ]));
    }
    if (!localStorage.getItem('lms_submissions')) {
      localStorage.setItem('lms_submissions', JSON.stringify([
        { asnId: 'ASN001', stuId: 'ADM2026001', date: '2026-06-14', file: 'equations_work.pdf', status: 'Graded', marks: 48, feedback: 'Excellent steps' }
      ]));
    }
    if (!localStorage.getItem('lms_materials')) {
      localStorage.setItem('lms_materials', JSON.stringify([
        { id: 'MAT001', title: 'Trigonometry Lecture Notes', type: 'PDF', class: '10th Standard', date: '2026-06-10', downloads: 14 }
      ]));
    }
    if (!localStorage.getItem('lms_chat')) {
      localStorage.setItem('lms_chat', JSON.stringify([
        { from: 'parent', to: 'teacher', text: 'Respected sir, how is Aditya performing in trigonometry?' },
        { from: 'teacher', to: 'parent', text: 'Aditya is doing well. He scored 95% in the mock test. Please ensure he completes daily sheets.' }
      ]));
    }
    if (!localStorage.getItem('lms_results')) {
      localStorage.setItem('lms_results', JSON.stringify([
        { stuId: 'ADM2026001', exam: 'Quarterly Examination', subject: 'Mathematics', max: 100, obtained: 95, grade: 'A+', remarks: 'Outstanding' },
        { stuId: 'ADM2026001', exam: 'Quarterly Examination', subject: 'Physics', max: 100, obtained: 88, grade: 'A', remarks: 'Good progress' }
      ]));
    }
  },

  getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  },

  saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  addNotice(msg) {
    const notices = this.getData('lms_notices');
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    notices.unshift({ time: timeStr, msg });
    this.saveData('lms_notices', notices);
  }
};

// Canvas drawing functions
function drawBarChart(canvasId, labels, data, color = '#4F46E5') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const maxVal = Math.max(...data) * 1.2 || 10;
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  const barCount = data.length;
  const spacing = chartWidth / barCount;
  const barWidth = spacing * 0.6;
  for (let i = 0; i < barCount; i++) {
    const val = data[i];
    const bHeight = (val / maxVal) * chartHeight;
    const x = padding + i * spacing + (spacing - barWidth) / 2;
    const y = height - padding - bHeight;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, bHeight);
    ctx.fillStyle = '#64748B';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barWidth / 2, height - padding + 15);
    ctx.fillText(val, x + barWidth / 2, y - 5);
  }
}

function drawLineChart(canvasId, labels, data, color = '#10B981') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const maxVal = Math.max(...data) * 1.2 || 10;
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  const pointsCount = data.length;
  const spacing = chartWidth / (pointsCount - 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  const points = [];
  for (let i = 0; i < pointsCount; i++) {
    const val = data[i];
    const x = padding + i * spacing;
    const y = height - padding - (val / maxVal) * chartHeight;
    points.push({ x, y });
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let i = 0; i < pointsCount; i++) {
    const p = points[i];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748B';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], p.x, height - padding + 15);
    ctx.fillText(data[i], p.x, p.y - 10);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  AppState.init();
  App.initDark();
  App.initSidebar();
});
`;

writeFile('js/app.js', appJsContent);

// Helper to wrap layouts for Teacher, Student, Parent
function getPortalLayout(role, title, bodyContent, customScript = '') {
  let menuHtml = '';
  if (role === 'teacher') {
    menuHtml = `
      <li class="menu-header">Teacher</li>
      <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
      <li class="sidebar-item"><a href="my-classes.html">🏫 My Classes</a></li>
      <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
      <li class="sidebar-item"><a href="assignments.html">📎 Assignments</a></li>
      <li class="sidebar-item"><a href="study-materials.html">📚 Study Materials</a></li>
      <li class="sidebar-item"><a href="exams.html">✍️ Exams & Marks</a></li>
      <li class="sidebar-item"><a href="messages.html">💬 Messages</a></li>
      <li class="sidebar-item"><a href="profile.html">👤 Profile</a></li>
    `;
  } else if (role === 'student') {
    menuHtml = `
      <li class="menu-header">Student</li>
      <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
      <li class="sidebar-item"><a href="subjects.html">📚 My Subjects</a></li>
      <li class="sidebar-item"><a href="study-materials.html">📖 Study Materials</a></li>
      <li class="sidebar-item"><a href="assignments.html">📎 Assignments</a></li>
      <li class="sidebar-item"><a href="online-tests.html">✍️ Online Tests</a></li>
      <li class="sidebar-item"><a href="timetable.html">📅 Timetable</a></li>
      <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
      <li class="sidebar-item"><a href="results.html">🏆 Results</a></li>
      <li class="sidebar-item"><a href="report-card.html">📄 Report Card</a></li>
      <li class="sidebar-item"><a href="ai-assistant.html">🤖 AI Study Assistant</a></li>
      <li class="sidebar-item"><a href="chat.html">💬 Chat</a></li>
      <li class="sidebar-item"><a href="profile.html">👤 Profile</a></li>
    `;
  } else if (role === 'parent') {
    menuHtml = `
      <li class="menu-header">Parent</li>
      <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
      <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
      <li class="sidebar-item"><a href="results.html">🏆 Results</a></li>
      <li class="sidebar-item"><a href="homework.html">📎 Homework</a></li>
      <li class="sidebar-item"><a href="fees.html">💳 Fee Details</a></li>
      <li class="sidebar-item"><a href="messages.html">💬 Messages</a></li>
      <li class="sidebar-item"><a href="profile.html">👤 Profile</a></li>
    `;
  }

  const primaryCol = role === 'teacher' ? '#10B981' : role === 'student' ? '#6366F1' : '#0D9488';
  const userName = role === 'teacher' ? 'Mr. Rajesh Kumar' : role === 'student' ? 'Aditya Patel' : 'Suresh Patel';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Amala HSS EduSphere</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: ${primaryCol};
      --primary-dark: ${primaryCol === '#10B981' ? '#059669' : primaryCol === '#6366F1' ? '#4F46E5' : '#0F766E'};
      --primary-light: ${primaryCol === '#10B981' ? '#ECFDF5' : primaryCol === '#6366F1' ? '#EEF2FF' : '#F0FDFA'};
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <svg viewBox="0 0 500 500" class="sidebar-logo" fill="none">
          <circle cx="250" cy="250" r="230" fill="#FFF"/>
          <circle cx="250" cy="250" r="180" fill="#4F46E5"/>
          <text x="250" y="290" fill="#FFF" font-size="120" font-weight="900" text-anchor="middle">A</text>
        </svg>
        <div class="sidebar-title">
          AMALA HSS
          <span>EduSphere LMS</span>
        </div>
      </div>
      <ul class="sidebar-menu">
        ${menuHtml}
        <li style="margin-top: 20px;" class="sidebar-item">
          <a href="#" onclick="App.logout()">🚪 Logout</a>
        </li>
      </ul>
    </aside>

    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">${title}</h1>
        </div>
        <div class="header-right">
          <div class="search-bar">
            🔍 <input type="text" placeholder="Search anything...">
          </div>
          <button class="header-btn" id="darkModeToggle" onclick="App.toggleDark()">🌙</button>
          <button class="header-btn">
            🔔 <span class="badge-dot"></span>
          </button>
          <div class="user-chip">
            <div class="avatar-circle">${userName.split(' ').map(x=>x[0]).join('')}</div>
            <div style="font-weight: 600;">${userName}</div>
          </div>
        </div>
      </header>

      <div class="content-area">
        ${bodyContent}
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${customScript}
  </script>
</body>
</html>`;
}

// ==================== TEACHER PORTAL ====================
console.log('Generating Teacher Pages...');

// TEACHER DASHBOARD
writeFile('pages/teacher/dashboard.html', getPortalLayout('teacher', 'Teacher Dashboard', `
  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>My Classes</h3><div class="stat-value" id="classes-count">--</div></div></div>
    <div class="stat-card" style="border-left-color: var(--info)"><div class="stat-info"><h3>Total Students</h3><div class="stat-value" id="students-count">--</div></div></div>
    <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Pending Review</h3><div class="stat-value" id="pending-count">--</div></div></div>
    <div class="stat-card" style="border-left-color: var(--warning)"><div class="stat-info"><h3>Circulars</h3><div class="stat-value" id="notices-count">--</div></div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Today's Schedule</h3>
      <ul style="list-style:none;" id="today-schedule">
        <li style="padding:10px 0; border-bottom:1px solid var(--border-color)">⏱️ <b>08:00 - 08:45 AM</b> | 10th Standard A | Mathematics</li>
        <li style="padding:10px 0;">⏱️ <b>12:45 - 01:30 PM</b> | 12th Science A | Physics</li>
      </ul>
    </div>
    <div class="card">
      <h3 class="card-title">Quick Actions</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button class="btn btn-primary" onclick="window.location.href='attendance.html'">Mark Attendance</button>
        <button class="btn btn-success" onclick="window.location.href='assignments.html'">Manage Assignments</button>
      </div>
    </div>
  </div>
`, `
  window.addEventListener('load', () => {
    const students = AppState.getData('lms_students');
    const classes = AppState.getData('lms_classes');
    const asns = AppState.getData('lms_assignments');
    const notices = AppState.getData('lms_notices');

    document.getElementById('students-count').innerText = students.length;
    document.getElementById('classes-count').innerText = classes.length;
    document.getElementById('pending-count').innerText = asns.length;
    document.getElementById('notices-count').innerText = notices.length;
  });
`));

// TEACHER MY CLASSES
writeFile('pages/teacher/my-classes.html', getPortalLayout('teacher', 'My Classes', `
  <div class="grid-3" id="classes-grid"></div>
`, `
  window.addEventListener('load', () => {
    const list = AppState.getData('lms_classes');
    const grid = document.getElementById('classes-grid');
    grid.innerHTML = '';
    list.forEach(c => {
      grid.innerHTML += \`<div class="card">
        <h4>\${c.name}</h4>
        <p><b>Sections:</b> \${c.sections.join(', ')}</p>
        <p><b>Wards:</b> \${c.students} Wards</p>
      </div>\`;
    });
  });
`));

// TEACHER ATTENDANCE
writeFile('pages/teacher/attendance.html', getPortalLayout('teacher', 'Daily Attendance Register', `
  <div class="card">
    <div style="display:flex; gap:15px; margin-bottom:20px;">
      <select class="form-control" style="width:180px;" id="teacherAttClass" onchange="loadRoster()"></select>
      <button class="btn btn-success" onclick="saveAttendance()">Save Daily Register</button>
    </div>

    <table class="data-table">
      <thead><tr><th>Name</th><th>Status</th></tr></thead>
      <tbody id="rosterBody"></tbody>
    </table>
  </div>
`, `
  window.addEventListener('load', () => {
    loadClassesDropdown();
    loadRoster();
  });

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('teacherAttClass');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }

  function loadRoster() {
    const cVal = document.getElementById('teacherAttClass').value;
    const students = AppState.getData('lms_students');
    const filtered = students.filter(s => s.class === cVal);
    const body = document.getElementById('rosterBody');
    body.innerHTML = '';

    if(filtered.length === 0) {
      body.innerHTML = '<tr><td colspan="2">No students.</td></tr>';
      return;
    }

    filtered.forEach(s => {
      body.innerHTML += \`<tr>
        <td><b>\${s.name}</b></td>
        <td>
          <label><input type="radio" name="att_\${s.id}" value="Present" checked> Present</label> &nbsp;
          <label><input type="radio" name="att_\${s.id}" value="Absent"> Absent</label>
        </td>
      </tr>\`;
    });
  }

  function saveAttendance() {
    const cVal = document.getElementById('teacherAttClass').value;
    AppState.addNotice(\`Attendance register completed by Teacher for class \${cVal}\`);
    App.showToast('Daily Register saved.');
  }
`));

// TEACHER ASSIGNMENTS
writeFile('pages/teacher/assignments.html', getPortalLayout('teacher', 'Assignments Management', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Create Homework Card</h3>
      <form onsubmit="saveAssignment(event)">
        <div class="form-group"><label class="form-label">Title</label><input type="text" class="form-control" id="asnTitle" required></div>
        <div class="form-group">
          <label class="form-label">Grade</label>
          <select class="form-control" id="asnClass"></select>
        </div>
        <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-control" id="asnDue" required></div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Post Work</button>
      </form>
    </div>

    <div class="card">
      <h3 class="card-title">Pending Student Submissions</h3>
      <table class="data-table">
        <thead><tr><th>Student</th><th>HW Title</th><th>Grade</th><th>Action</th></tr></thead>
        <tbody id="submissionsBody"></tbody>
      </table>
    </div>
  </div>
`, `
  window.addEventListener('load', () => {
    loadClassesDropdown();
    loadSubmissions();
  });

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('asnClass');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }

  function loadSubmissions() {
    const subs = AppState.getData('lms_submissions');
    const students = AppState.getData('lms_students');
    const body = document.getElementById('submissionsBody');
    body.innerHTML = '';

    subs.forEach((s, idx) => {
      const student = students.find(st => st.id === s.stuId) || { name: 'Unknown' };
      body.innerHTML += \`<tr>
        <td>\${student.name}</td>
        <td>Quadratic Equations</td>
        <td><input type="number" class="form-control" style="width:70px;" value="\${s.marks}" id="marks_\${idx}"></td>
        <td><button class="btn btn-success" style="padding:4px 8px;" onclick="gradeSubmission(\${idx})">Save</button></td>
      </tr>\`;
    });
  }

  function saveAssignment(e) {
    e.preventDefault();
    const title = document.getElementById('asnTitle').value.trim();
    const className = document.getElementById('asnClass').value;
    const due = document.getElementById('asnDue').value;

    const list = AppState.getData('lms_assignments');
    list.push({ id: 'ASN' + Math.floor(100+Math.random()*900), title, class: className, due, submissions: 0 });
    AppState.saveData('lms_assignments', list);
    
    AppState.addNotice(\`New Assignment: \${title} posted for \${className}\`);
    document.getElementById('asnTitle').value = '';
    App.showToast('Homework posted successfully!');
  }

  function gradeSubmission(idx) {
    const subs = AppState.getData('lms_submissions');
    const val = document.getElementById('marks_' + idx).value;
    subs[idx].marks = val;
    subs[idx].status = 'Graded';
    AppState.saveData('lms_submissions', subs);
    App.showToast('Marks saved successfully!');
  }
`));

// TEACHER STUDY MATERIALS
writeFile('pages/teacher/study-materials.html', getPortalLayout('teacher', 'Syllabus Notes Library', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Share Study material</h3>
      <form onsubmit="saveMaterial(event)">
        <div class="form-group"><label class="form-label">Material Name</label><input type="text" class="form-control" id="matTitle" required></div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" id="matType"><option>PDF</option><option>PPT</option><option>Video</option></select>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Share Note</button>
      </form>
    </div>
    
    <div class="card">
      <h3 class="card-title">Material List</h3>
      <table class="data-table">
        <thead><tr><th>Title</th><th>Type</th></tr></thead>
        <tbody id="materialsBody"></tbody>
      </table>
    </div>
  </div>
`, `
  window.addEventListener('load', loadMaterials);

  function loadMaterials() {
    const list = AppState.getData('lms_materials');
    const body = document.getElementById('materialsBody');
    body.innerHTML = '';
    list.forEach(m => {
      body.innerHTML += \`<tr><td><b>\${m.title}</b></td><td><span class="badge badge-purple">\${m.type}</span></td></tr>\`;
    });
  }

  function saveMaterial(e) {
    e.preventDefault();
    const title = document.getElementById('matTitle').value.trim();
    const type = document.getElementById('matType').value;

    const list = AppState.getData('lms_materials');
    list.push({ id: 'MAT' + Math.floor(100+Math.random()*900), title, type, date: new Date().toISOString().split('T')[0], downloads: 0 });
    AppState.saveData('lms_materials', list);
    
    document.getElementById('matTitle').value = '';
    loadMaterials();
    App.showToast('Shared successfully!');
  }
`));

// TEACHER EXAMS
writeFile('pages/teacher/exams.html', getPortalLayout('teacher', 'Exams Marks Input', `
  <div class="card">
    <div style="display:flex; gap:15px; margin-bottom:20px;">
      <select class="form-control" style="width:200px;" id="marksExam"></select>
      <select class="form-control" style="width:150px;" id="marksClass" onchange="loadMarksSheet()"></select>
    </div>

    <table class="data-table">
      <thead><tr><th>Student</th><th>Marks Obtained (Max: 100)</th><th>Remarks</th></tr></thead>
      <tbody id="marksSheetBody"></tbody>
    </table>
    
    <button class="btn btn-success" style="margin-top:15px;" onclick="saveMarks()">Publish Marks</button>
  </div>
`, `
  window.addEventListener('load', () => {
    loadExamsDropdown();
    loadClassesDropdown();
    loadMarksSheet();
  });

  function loadExamsDropdown() {
    const list = AppState.getData('lms_exams');
    const select = document.getElementById('marksExam');
    select.innerHTML = '';
    list.forEach(e => {
      select.innerHTML += \`<option value="\${e.name}">\${e.name}</option>\`;
    });
  }

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('marksClass');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }

  function loadMarksSheet() {
    const cVal = document.getElementById('marksClass').value;
    const students = AppState.getData('lms_students');
    const filtered = students.filter(s => s.class === cVal);
    const body = document.getElementById('marksSheetBody');
    body.innerHTML = '';

    if(filtered.length === 0) {
      body.innerHTML = '<tr><td colspan="3">No students.</td></tr>';
      return;
    }

    filtered.forEach((s, idx) => {
      body.innerHTML += \`<tr>
        <td><b>\${s.name}</b></td>
        <td><input type="number" class="form-control" style="width:80px;" value="85" id="val_\${s.id}"></td>
        <td><input type="text" class="form-control" placeholder="Remarks" value="Good" id="rem_\${s.id}"></td>
      </tr>\`;
    });
  }

  function saveMarks() {
    const exam = document.getElementById('marksExam').value;
    const cVal = document.getElementById('marksClass').value;
    const students = AppState.getData('lms_students');
    const filtered = students.filter(s => s.class === cVal);

    const results = AppState.getData('lms_results');
    
    filtered.forEach(s => {
      const val = parseInt(document.getElementById('val_' + s.id).value);
      const rem = document.getElementById('rem_' + s.id).value;
      const grade = val >= 90 ? 'A+' : val >= 80 ? 'A' : val >= 60 ? 'B' : 'C';
      
      // Remove old if duplicates
      const existsIdx = results.findIndex(r => r.stuId === s.id && r.exam === exam && r.subject === 'Mathematics');
      if (existsIdx !== -1) results.splice(existsIdx, 1);

      results.push({ stuId: s.id, exam, subject: 'Mathematics', max: 100, obtained: val, grade, remarks: rem });
    });

    AppState.saveData('lms_results', results);
    AppState.addNotice(\`Exam marks published for \${exam} - \${cVal}\`);
    App.showToast('Published to student portfolios!', 'success');
  }
`));

// TEACHER MESSAGES
writeFile('pages/teacher/messages.html', getPortalLayout('teacher', 'Messaging console', `
  <div class="card" style="display:flex; height:450px; padding:0; overflow:hidden;">
    <div style="width:220px; border-right:1px solid var(--border-color); background-color:var(--gray-100); overflow-y:auto;">
      <div style="padding:15px; font-weight:700;">Contacts</div>
      <div style="padding:12px 15px; cursor:pointer; background-color:#FFF;">Suresh Patel (Parent)</div>
    </div>
    <div style="flex:1; display:flex; flex-direction:column;">
      <div style="flex:1; padding:20px; overflow-y:auto; background-color:var(--gray-100);" id="chatBox"></div>
      <div style="padding:15px; border-top:1px solid var(--border-color); display:flex; gap:10px;">
        <input type="text" class="form-control" id="chatInputMsg" placeholder="Type reply...">
        <button class="btn btn-success" onclick="sendMessage()">Send</button>
      </div>
    </div>
  </div>
`, `
  window.addEventListener('load', loadChat);

  function loadChat() {
    const msgs = AppState.getData('lms_chat');
    const box = document.getElementById('chatBox');
    box.innerHTML = '';
    msgs.forEach(m => {
      const isYou = m.from === 'teacher';
      const col = isYou ? 'var(--success)' : '#334155';
      const align = isYou ? 'right' : 'left';
      box.innerHTML += \`<div style="text-align:\${align}; margin-bottom:10px;">
        <span style="display:inline-block; padding:8px 12px; border-radius:10px; background-color:\${isYou ? 'var(--primary-light)' : '#E2E8F0'}; color:\${col};">
          <b>\${isYou ? 'You' : 'Suresh'}:</b> \${m.text}
        </span>
      </div>\`;
    });
    box.scrollTop = box.scrollHeight;
  }

  function sendMessage() {
    const input = document.getElementById('chatInputMsg');
    const text = input.value.trim();
    if (!text) return;

    const msgs = AppState.getData('lms_chat');
    msgs.push({ from: 'teacher', to: 'parent', text });
    AppState.saveData('lms_chat', msgs);

    input.value = '';
    loadChat();
  }
`));

// TEACHER PROFILE
writeFile('pages/teacher/profile.html', getPortalLayout('teacher', 'My Profile', `
  <div class="card" style="max-width:500px; margin:0 auto; text-align:center;">
    <div class="avatar-circle" style="width:80px; height:80px; font-size:30px; margin:0 auto 15px;">RK</div>
    <h2>Mr. Rajesh Kumar</h2>
    <p>Mathematics Instructor</p>
  </div>
`));


// ==================== STUDENT PORTAL ====================
console.log('Generating Student Pages...');

// STUDENT DASHBOARD
writeFile('pages/student/dashboard.html', getPortalLayout('student', 'Student Dashboard', `
  <div class="card" style="background: linear-gradient(135deg, var(--primary) 0%, #4338CA 100%); color:#FFF;">
    <h2>Aditya Patel</h2>
    <p>Grade: 10th Standard A | Roll No: 12</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--primary)"><div class="stat-info"><h3>My Attendance</h3><div class="stat-value">92%</div></div></div>
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Homework Due</h3><div class="stat-value" id="due-count">--</div></div></div>
    <div class="stat-card" style="border-left-color: var(--warning)"><div class="stat-info"><h3>Exams Published</h3><div class="stat-value" id="results-count">--</div></div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Pending Homework</h3>
      <div id="pending-hw-box"></div>
    </div>
    
    <div class="card">
      <h3 class="card-title">Circular Board</h3>
      <ul style="list-style:none;" id="student-notices"></ul>
    </div>
  </div>
`, `
  window.addEventListener('load', () => {
    const list = AppState.getData('lms_assignments');
    const notices = AppState.getData('lms_notices');
    const results = AppState.getData('lms_results');

    document.getElementById('due-count').innerText = list.length;
    document.getElementById('results-count').innerText = results.length;

    // Notice board
    const nBox = document.getElementById('student-notices');
    nBox.innerHTML = '';
    notices.slice(0, 3).forEach(n => {
      nBox.innerHTML += \`<li style="padding:8px 0; border-bottom:1px solid var(--border-color)">📢 \${n.msg}</li>\`;
    });

    // HW box
    const hwBox = document.getElementById('pending-hw-box');
    hwBox.innerHTML = '';
    list.forEach(a => {
      hwBox.innerHTML += \`<div class="card" style="border-left:4px solid var(--danger); padding:12px; margin-bottom:10px;">
        <h4>\${a.title}</h4>
        <p>Subject: \${a.subject} | Due: \&lt;Due Date\&gt;</p>
        <button class="btn btn-primary" style="margin-top:8px; padding:4px 8px;" onclick="window.location.href='assignments.html'">Submit Work</button>
      </div>\`;
    });
  });
`));

// STUDENT SUBJECTS
writeFile('pages/student/subjects.html', getPortalLayout('student', 'My Subjects', `
  <div class="grid-3" id="subjects-grid"></div>
`, `
  window.addEventListener('load', () => {
    const list = AppState.getData('lms_subjects');
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = '';
    list.forEach(s => {
      grid.innerHTML += \`<div class="card">
        <h4>\${s.name}</h4>
        <p>Code: \${s.code}</p>
        <p>Weekly Periods: \&lt;Weekly\&gt;</p>
      </div>\`;
    });
  });
`));

// STUDENT STUDY MATERIALS
writeFile('pages/student/study-materials.html', getPortalLayout('student', 'Reference Study Materials', `
  <div class="grid-3" id="materials-grid"></div>
`, `
  window.addEventListener('load', () => {
    const list = AppState.getData('lms_materials');
    const grid = document.getElementById('materials-grid');
    grid.innerHTML = '';
    list.forEach(m => {
      grid.innerHTML += \`<div class="card" style="text-align:center;">
        <div style="font-size:30px;">📄</div>
        <h4>\${m.title}</h4>
        <span class="badge badge-purple">\${m.type}</span>
        <button class="btn btn-outline" style="width:100%; margin-top:10px;" onclick="alert('Downloading...')">Download</button>
      </div>\`;
    });
  });
`));

// STUDENT ASSIGNMENTS
writeFile('pages/student/assignments.html', getPortalLayout('student', 'My Assignment Board', `
  <div class="card">
    <h3 class="card-title">Pending Homework Sheets</h3>
    <div id="pendingAssignments"></div>
  </div>
`, `
  window.addEventListener('load', loadAsns);

  function loadAsns() {
    const list = AppState.getData('lms_assignments');
    const box = document.getElementById('pendingAssignments');
    box.innerHTML = '';

    if(list.length === 0) {
      box.innerHTML = '<p>No pending work.</p>';
      return;
    }

    list.forEach(a => {
      box.innerHTML += \`<div class="card" style="border-left:4px solid var(--primary);">
        <h4>\${a.title}</h4>
        <p>Subject: \${a.subject} | Due: \${a.due}</p>
        <div style="border: 2px dashed var(--border-color); padding:15px; text-align:center; margin-top:10px; cursor:pointer;" onclick="submitAssignment('\${a.id}', '\${a.title}')">
          📂 Drag and Drop File here to Submit
        </div>
      </div>\`;
    });
  }

  function submitAssignment(id, title) {
    let list = AppState.getData('lms_assignments');
    list = list.filter(a => a.id !== id);
    AppState.saveData('lms_assignments', list);

    const subs = AppState.getData('lms_submissions');
    subs.push({ asnId: id, stuId: 'ADM2026001', date: new Date().toISOString().split('T')[0], file: 'completed_' + id + '.pdf', status: 'Submitted', marks: '--', feedback: '--' });
    AppState.saveData('lms_submissions', subs);

    AppState.addNotice(\`Student Aditya submitted assignment: \${title}\`);
    loadAsns();
    App.showToast('Uploaded successfully!');
  }
`));

// STUDENT TIMETABLE
writeFile('pages/student/timetable.html', getPortalLayout('student', 'My Schedule Timetable', `
  <div class="card">
    <table class="data-table" style="text-align:center;">
      <thead>
        <tr><th>Slot</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr>
      </thead>
      <tbody>
        <tr><td>08:00 AM</td><td style="background-color:var(--primary-light);">Mathematics</td><td>Physics</td><td>Mathematics</td><td>Science</td><td>English</td></tr>
        <tr><td>12:45 PM</td><td>English</td><td>Science</td><td>English</td><td>Physics</td><td>Lab Session</td></tr>
      </tbody>
    </table>
  </div>
`));

// STUDENT ATTENDANCE
writeFile('pages/student/attendance.html', getPortalLayout('student', 'My Attendance Matrix', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Attendance Rate</h3>
      <h1 style="color:var(--primary); font-size:48px;">92%</h1>
      <p>Total Wards present status. Verified by Principal.</p>
    </div>
    <div class="card">
      <h3 class="card-title">Monthly Calendar Heatmap</h3>
      <div class="heatmap-calendar">
        <div class="heatmap-day heatmap-present">1</div>
        <div class="heatmap-day heatmap-present">2</div>
        <div class="heatmap-day heatmap-present">3</div>
        <div class="heatmap-day heatmap-present">4</div>
        <div class="heatmap-day heatmap-absent">5</div>
        <div class="heatmap-day heatmap-present">6</div>
        <div class="heatmap-day heatmap-holiday">7</div>
      </div>
    </div>
  </div>
`));

// STUDENT RESULTS
writeFile('pages/student/results.html', getPortalLayout('student', 'My Exam Results', `
  <div class="card">
    <table class="data-table">
      <thead><tr><th>Subject</th><th>Max</th><th>Marks Obtained</th><th>Grade</th><th>Remarks</th></tr></thead>
      <tbody id="studentResultsBody"></tbody>
    </table>
  </div>
`, `
  window.addEventListener('load', () => {
    const list = AppState.getData('lms_results');
    const body = document.getElementById('studentResultsBody');
    body.innerHTML = '';
    list.forEach(r => {
      body.innerHTML += \`<tr>
        <td><b>\${r.subject}</b></td>
        <td>\${r.max}</td>
        <td>\${r.obtained}</td>
        <td><b>\${r.grade}</b></td>
        <td>\${r.remarks}</td>
      </tr>\`;
    });
  });
`));


// ==================== PARENT PORTAL ====================
console.log('Generating Parent Pages...');

// PARENT DASHBOARD
writeFile('pages/parent/dashboard.html', getPortalLayout('parent', 'Parent Ward Console', `
  <div class="card">
    <h2>Ward: Aditya Patel</h2>
    <p>Grade: 10th Standard A | Roll: 12</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Attendance</h3><div class="stat-value">92%</div></div></div>
    <div class="stat-card" style="border-left-color: var(--primary)"><div class="stat-info"><h3>Avg Grade</h3><div class="stat-value">A+ (93%)</div></div></div>
    <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Pending Fee</h3><div class="stat-value" id="fee-val">₹12,500</div></div></div>
  </div>
`, `
  window.addEventListener('load', () => {
    const paid = localStorage.getItem('parent_fee_paid') === 'true';
    if(paid) {
      document.getElementById('fee-val').innerText = '₹0';
    }
  });
`));

// PARENT RESULTS
writeFile('pages/parent/results.html', getPortalLayout('parent', 'Ward Marks Transcript', `
  <div class="card">
    <table class="data-table">
      <thead><tr><th>Subject</th><th>Obtained Marks</th><th>Grade</th><th>Remarks</th></tr></thead>
      <tbody id="parentResultsBody"></tbody>
    </table>
  </div>
`, `
  window.addEventListener('load', () => {
    const list = AppState.getData('lms_results');
    const body = document.getElementById('parentResultsBody');
    body.innerHTML = '';
    list.forEach(r => {
      body.innerHTML += \`<tr>
        <td><b>\${r.subject}</b></td>
        <td>\${r.obtained} / \${r.max}</td>
        <td><b>\${r.grade}</b></td>
        <td>\${r.remarks}</td>
      </tr>\`;
    });
  });
`));

// PARENT FEES (With payment checkout update logic)
writeFile('pages/parent/fees.html', getPortalLayout('parent', 'Ward Academic Billing', `
  <div class="card">
    <h3 class="card-title">Pending Tuition Invoices</h3>
    <div style="font-size:24px; font-weight:700; color:var(--danger); margin-bottom:15px;" id="dueText">Outstanding Amount: ₹12,500</div>
    <button class="btn btn-primary" onclick="payFees()" id="payBtn">💳 Pay Online via Razorpay</button>
  </div>
`, `
  window.addEventListener('load', checkFeeState);

  function checkFeeState() {
    const paid = localStorage.getItem('parent_fee_paid') === 'true';
    if(paid) {
      document.getElementById('dueText').innerText = 'Outstanding Amount: ₹0 (No Pending Bills)';
      document.getElementById('dueText').style.color = 'var(--success)';
      document.getElementById('payBtn').style.display = 'none';
    }
  }

  function payFees() {
    App.showToast('Connecting to payment gateway checkout...');
    setTimeout(() => {
      localStorage.setItem('parent_fee_paid', 'true');
      checkFeeState();
      AppState.addNotice('Tuition fee payment processed online for Aditya Patel');
      App.showToast('Online payment processed! Receipt generated.', 'success');
    }, 1500);
  }
`));

// PARENT MESSAGES
writeFile('pages/parent/messages.html', getPortalLayout('parent', 'Teacher Communication Console', `
  <div class="card" style="display:flex; height:400px; padding:0; overflow:hidden;">
    <div style="flex:1; display:flex; flex-direction:column;">
      <div style="flex:1; padding:20px; overflow-y:auto; background-color:var(--gray-100);" id="parentChatBox"></div>
      <div style="padding:15px; border-top:1px solid var(--border-color); display:flex; gap:10px;">
        <input type="text" class="form-control" id="chatParentInput" placeholder="Write query...">
        <button class="btn btn-primary" onclick="sendMessage()">Send</button>
      </div>
    </div>
  </div>
`, `
  window.addEventListener('load', loadChat);

  function loadChat() {
    const msgs = AppState.getData('lms_chat');
    const box = document.getElementById('parentChatBox');
    box.innerHTML = '';
    msgs.forEach(m => {
      const isYou = m.from === 'parent';
      const col = isYou ? 'var(--primary)' : '#334155';
      const align = isYou ? 'right' : 'left';
      box.innerHTML += \`<div style="text-align:\${align}; margin-bottom:10px;">
        <span style="display:inline-block; padding:8px 12px; border-radius:10px; background-color:\${isYou ? 'var(--primary-light)' : '#E2E8F0'}; color:\${col};">
          <b>\${isYou ? 'You' : 'Teacher'}:</b> \${m.text}
        </span>
      </div>\`;
    });
    box.scrollTop = box.scrollHeight;
  }

  function sendMessage() {
    const input = document.getElementById('chatParentInput');
    const text = input.value.trim();
    if (!text) return;

    const msgs = AppState.getData('lms_chat');
    msgs.push({ from: 'parent', to: 'teacher', text });
    AppState.saveData('lms_chat', msgs);

    input.value = '';
    loadChat();
  }
`));

console.log('All portal updates completed successfully!');
