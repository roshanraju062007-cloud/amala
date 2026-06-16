const fs = require('fs');
const path = require('path');

// Helper to write files
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// 1. UPDATE app.js to include AppState and LocalStorage bindings
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
        { name: '1st Standard', sections: ['A', 'B'], teacher: 'Mrs. Sita S.', students: 78 },
        { name: '2nd Standard', sections: ['A', 'B'], teacher: 'Mrs. Radha K.', students: 82 },
        { name: '3rd Standard', sections: ['A', 'B'], teacher: 'Mrs. Anita P.', students: 75 },
        { name: '4th Standard', sections: ['A', 'B'], teacher: 'Mr. John M.', students: 88 },
        { name: '5th Standard', sections: ['A', 'B'], teacher: 'Mr. David L.', students: 80 },
        { name: '6th Standard', sections: ['A', 'B', 'C'], teacher: 'Mr. Gopal V.', students: 110 },
        { name: '7th Standard', sections: ['A', 'B'], teacher: 'Mrs. Shanthi R.', students: 85 },
        { name: '8th Standard', sections: ['A', 'B'], teacher: 'Mr. Wilson J.', students: 92 },
        { name: '9th Standard', sections: ['A', 'B', 'C'], teacher: 'Mrs. Kavitha M.', students: 125 },
        { name: '10th Standard', sections: ['A', 'B', 'C', 'D'], teacher: 'Mr. Rajesh Kumar', students: 152 },
        { name: '11th Science', sections: ['A', 'B'], teacher: 'Mrs. Priya Sharma', students: 82 },
        { name: '11th Commerce', sections: ['A', 'B'], teacher: 'Mr. Alok Dixit', students: 74 },
        { name: '11th Arts', sections: ['A'], teacher: 'Mrs. Sumita Roy', students: 40 },
        { name: '12th Science', sections: ['A', 'B'], teacher: 'Mrs. Priya Sharma', students: 80 },
        { name: '12th Commerce', sections: ['A', 'B'], teacher: 'Mr. Alok Dixit', students: 72 },
        { name: '12th Arts', sections: ['A'], teacher: 'Mrs. Sumita Roy', students: 38 }
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

// Helper to wrap layouts
function getPortalLayout(role, activeMenu, title, bodyContent, customScript = '') {
  const userName = role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Mr. Rajesh Kumar' : role === 'student' ? 'Aditya Patel' : 'Suresh Patel';
  
  let menuHtml = '';
  if (role === 'admin') {
    menuHtml = `
      <li class="menu-header">Main</li>
      <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
      <li class="sidebar-item"><a href="students.html">🎓 Students</a></li>
      <li class="sidebar-item"><a href="teachers.html">👨‍🏫 Teachers</a></li>
      <li class="sidebar-item"><a href="parents.html">👪 Parents</a></li>
      <li class="menu-header">Academics</li>
      <li class="sidebar-item"><a href="classes.html">🏫 Classes & Sections</a></li>
      <li class="sidebar-item"><a href="subjects.html">📚 Subjects</a></li>
      <li class="sidebar-item"><a href="timetable.html">📅 Timetable</a></li>
      <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
      <li class="menu-header">Assessment</li>
      <li class="sidebar-item"><a href="exams.html">✍️ Exams</a></li>
      <li class="sidebar-item"><a href="assignments.html">📎 Assignments</a></li>
      <li class="sidebar-item"><a href="results.html">🏆 Results</a></li>
      <li class="menu-header">Administration</li>
      <li class="sidebar-item"><a href="fees.html">💳 Fee Management</a></li>
      <li class="sidebar-item"><a href="library.html">📖 Library</a></li>
      <li class="sidebar-item"><a href="transport.html">🚌 Transport</a></li>
      <li class="sidebar-item"><a href="notifications.html">🔔 Notifications</a></li>
      <li class="menu-header">System</li>
      <li class="sidebar-item"><a href="analytics.html">📈 Analytics</a></li>
      <li class="sidebar-item"><a href="ai-tools.html">🤖 AI Tools</a></li>
      <li class="sidebar-item"><a href="settings.html">⚙️ Settings</a></li>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Amala HSS EduSphere</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #4F46E5;
      --primary-dark: #3730A3;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Sidebar -->
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

    <!-- Main Content -->
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

// 2. ADMIN DASHBOARD PAGE
const dashboardHtml = getPortalLayout('admin', 'Dashboard', 'Admin Dashboard', `
  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--info)">
      <div class="stat-info">
        <h3>Total Students</h3>
        <div class="stat-value" id="stat-students">2,547</div>
      </div>
      <div class="stat-icon">🎓</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--success)">
      <div class="stat-info">
        <h3>Teachers</h3>
        <div class="stat-value" id="stat-teachers">148</div>
      </div>
      <div class="stat-icon">👨‍🏫</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--warning)">
      <div class="stat-info">
        <h3>Classes</h3>
        <div class="stat-value" id="stat-classes">18</div>
      </div>
      <div class="stat-icon">🏫</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--danger)">
      <div class="stat-info">
        <h3>Exams Scheduled</h3>
        <div class="stat-value" id="stat-exams">2</div>
      </div>
      <div class="stat-icon">✍️</div>
    </div>
  </div>

  <div class="card">
    <h3 class="card-title">Quick Actions</h3>
    <div class="actions-grid">
      <button class="btn btn-outline" onclick="App.openModal('noticeModal')">📣 Send Notice</button>
      <button class="btn btn-outline" onclick="runBackup()">💾 Database Backup</button>
      <button class="btn btn-primary" onclick="window.location.href='students.html'">➕ Add Student</button>
      <button class="btn btn-success" onclick="window.location.href='teachers.html'">➕ Add Teacher</button>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Attendance Monthly Trend</h3>
      <canvas id="attendanceChart" width="500" height="250" style="width:100%; height:250px;"></canvas>
    </div>
    <div class="card">
      <h3 class="card-title">Fee Collection (Last 6 Months)</h3>
      <canvas id="feeChart" width="400" height="250" style="width:100%; height:250px;"></canvas>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Recent Activity Log</h3>
      <ul style="list-style:none;" id="activity-log"></ul>
    </div>
    <div class="card">
      <h3 class="card-title">Classes Overview</h3>
      <div style="max-height: 250px; overflow-y:auto;">
        <table class="data-table">
          <thead>
            <tr><th>Class</th><th>Sections</th><th>Students</th></tr>
          </thead>
          <tbody id="classes-summary-body"></tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Send Notification Modal -->
  <div class="modal-overlay" id="noticeModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Broadcast Notification</h3>
        <button class="modal-close" onclick="App.closeModal('noticeModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Recipients</label>
          <select class="form-control" id="notice-target">
            <option>All Students & Parents</option>
            <option>Teachers Only</option>
            <option>Class 10 Only</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea class="form-control" rows="4" id="notice-msg" placeholder="Write message here..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('noticeModal')">Cancel</button>
        <button class="btn btn-primary" onclick="broadcastNotice()">Send Notification</button>
      </div>
    </div>
  </div>
`, `
  window.addEventListener('load', () => {
    loadDashboardStats();
    drawCharts();
  });

  function loadDashboardStats() {
    const students = AppState.getData('lms_students');
    const teachers = AppState.getData('lms_teachers');
    const classes = AppState.getData('lms_classes');
    const exams = AppState.getData('lms_exams');
    const notices = AppState.getData('lms_notices');

    document.getElementById('stat-students').innerText = students.length;
    document.getElementById('stat-teachers').innerText = teachers.length;
    document.getElementById('stat-classes').innerText = classes.length;
    document.getElementById('stat-exams').innerText = exams.length;

    // Load activities
    const log = document.getElementById('activity-log');
    log.innerHTML = '';
    notices.forEach(n => {
      log.innerHTML += \`<li style="padding:10px 0; border-bottom:1px solid var(--border-color)">🕒 <b>\${n.time}</b> - \${n.msg}</li>\`;
    });

    // Load classes overview
    const clBody = document.getElementById('classes-summary-body');
    clBody.innerHTML = '';
    classes.slice(0, 4).forEach(c => {
      clBody.innerHTML += \`<tr><td>\${c.name}</td><td>\${c.sections.join(', ')}</td><td>\${c.students}</td></tr>\`;
    });
  }

  function drawCharts() {
    drawBarChart('feeChart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [8.2, 9.5, 11.2, 10.4, 9.8, 12.4], 'var(--danger)');
    drawLineChart('attendanceChart', ['01 Jun', '03 Jun', '05 Jun', '07 Jun', '09 Jun', '11 Jun', '13 Jun'], [92, 91, 93, 89, 94, 91, 95], 'var(--primary)');
  }

  function broadcastNotice() {
    const msg = document.getElementById('notice-msg').value.trim();
    const target = document.getElementById('notice-target').value;
    if (!msg) return alert('Message cannot be empty.');
    AppState.addNotice(\`Notice sent to \${target}: "\${msg}"\`);
    App.closeModal('noticeModal');
    loadDashboardStats();
    App.showToast('Broadcasted successfully!');
  }

  function runBackup() {
    App.showToast('Generating MySQL Backup...');
    setTimeout(() => {
      App.showToast('Database Backup saved locally under backup/ folder!', 'success');
    }, 1500);
  }
`);

writeFile('pages/admin/dashboard.html', dashboardHtml);

// 3. ADMIN STUDENTS PAGE
const studentsHtml = getPortalLayout('admin', 'Students', 'Student Registry', `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <h3 class="card-title" style="margin-bottom:0;">Student Database</h3>
      <button class="btn btn-primary" onclick="App.openModal('addStudentModal')">➕ Add Student</button>
    </div>

    <!-- Filter Bar -->
    <div style="display:grid; grid-template-columns: 2fr 2fr 4fr; gap:15px; margin-bottom:20px;">
      <select class="form-control" id="classFilter" onchange="filterStudents()">
        <option value="All">All Classes</option>
        <option>LKG</option>
        <option>UKG</option>
        <option>10th Standard</option>
        <option>12th Science</option>
      </select>
      <select class="form-control" id="sectionFilter" onchange="filterStudents()">
        <option value="All">All Sections</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
        <option>D</option>
      </select>
      <input type="text" class="form-control" id="searchFilter" onkeyup="filterStudents()" placeholder="Search by name, ID...">
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Section</th>
            <th>Parent</th>
            <th>Phone</th>
            <th>Fee Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="studentTableBody"></tbody>
      </table>
    </div>
  </div>

  <!-- Add Student Modal -->
  <div class="modal-overlay" id="addStudentModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">New Student Admission</h3>
        <button class="modal-close" onclick="App.closeModal('addStudentModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" id="stuName" required></div>
        <div class="form-group">
          <label class="form-label">Class</label>
          <select class="form-control" id="stuClass"></select>
        </div>
        <div class="form-group">
          <label class="form-label">Section</label>
          <select class="form-control" id="stuSection"><option>A</option><option>B</option><option>C</option><option>D</option></select>
        </div>
        <div class="form-group"><label class="form-label">Parent / Guardian Name</label><input type="text" class="form-control" id="stuParent" required></div>
        <div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-control" id="stuPhone" required></div>
        <div class="form-group">
          <label class="form-label">Fee Status</label>
          <select class="form-control" id="stuFee"><option>Paid</option><option>Partial</option><option>Unpaid</option></select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('addStudentModal')">Cancel</button>
        <button class="btn btn-primary" onclick="saveStudent()">Save Student</button>
      </div>
    </div>
  </div>
`, `
  window.addEventListener('load', () => {
    loadStudents();
    loadClassesDropdown();
  });

  function loadStudents() {
    const students = AppState.getData('lms_students');
    renderTable(students);
  }

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('stuClass');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }

  function renderTable(list) {
    const body = document.getElementById('studentTableBody');
    body.innerHTML = '';
    list.forEach(s => {
      let badge = 'badge-success';
      if (s.fee === 'Partial') badge = 'badge-warning';
      if (s.fee === 'Unpaid') badge = 'badge-danger';

      body.innerHTML += \`<tr>
        <td>\${s.id}</td>
        <td><b>\${s.name}</b></td>
        <td>\${s.class}</td>
        <td>Section \${s.section}</td>
        <td>\${s.parent}</td>
        <td>\${s.phone}</td>
        <td><span class="badge \${badge}">\${s.fee}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:4px 8px; color:var(--danger);" onclick="deleteStudent('\${s.id}')">🗑️</button>
        </td>
      </tr>\`;
    });
  }

  function filterStudents() {
    const classVal = document.getElementById('classFilter').value;
    const sectionVal = document.getElementById('sectionFilter').value;
    const searchVal = document.getElementById('searchFilter').value.toLowerCase();

    const students = AppState.getData('lms_students');
    const filtered = students.filter(s => {
      const matchClass = classVal === 'All' || s.class === classVal;
      const matchSection = sectionVal === 'All' || s.section === sectionVal;
      const matchSearch = s.name.toLowerCase().includes(searchVal) || s.id.toLowerCase().includes(searchVal);
      return matchClass && matchSection && matchSearch;
    });
    renderTable(filtered);
  }

  function saveStudent() {
    const name = document.getElementById('stuName').value.trim();
    const className = document.getElementById('stuClass').value;
    const section = document.getElementById('stuSection').value;
    const parent = document.getElementById('stuParent').value.trim();
    const phone = document.getElementById('stuPhone').value.trim();
    const fee = document.getElementById('stuFee').value;

    if (!name || !parent || !phone) return alert('Fill in all fields.');

    const students = AppState.getData('lms_students');
    const id = 'ADM' + Math.floor(100000 + Math.random() * 900000);
    const newStudent = { id, name, class: className, section, parent, phone, attendance: 100, fee };

    students.push(newStudent);
    AppState.saveData('lms_students', students);
    AppState.addNotice(\`Student "\${name}" admitted to \${className}\`);

    // Clean inputs
    document.getElementById('stuName').value = '';
    document.getElementById('stuParent').value = '';
    document.getElementById('stuPhone').value = '';

    App.closeModal('addStudentModal');
    loadStudents();
    App.showToast('Student admitted successfully!');
  }

  function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete student ' + id + '?')) return;
    let students = AppState.getData('lms_students');
    students = students.filter(s => s.id !== id);
    AppState.saveData('lms_students', students);
    loadStudents();
    App.showToast('Student deleted.');
  }
`);

writeFile('pages/admin/students.html', studentsHtml);

// 4. ADMIN TEACHERS PAGE
const teachersHtml = getPortalLayout('admin', 'Teachers', 'Faculty Registry', `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <h3 class="card-title" style="margin-bottom:0;">Academic Staff Directory</h3>
      <button class="btn btn-primary" onclick="App.openModal('addTeacherModal')">➕ Add Teacher</button>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Department</th><th>Subjects</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody id="teacherTableBody"></tbody>
      </table>
    </div>
  </div>

  <!-- Add Teacher Modal -->
  <div class="modal-overlay" id="addTeacherModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Register New Faculty</h3>
        <button class="modal-close" onclick="App.closeModal('addTeacherModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" id="tchName" required></div>
        <div class="form-group"><label class="form-label">Department</label><input type="text" class="form-control" id="tchDept" required></div>
        <div class="form-group"><label class="form-label">Subject Specialties</label><input type="text" class="form-control" id="tchSub" placeholder="e.g. Physics, Calculus" required></div>
        <div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-control" id="tchPhone" required></div>
        <div class="form-group">
          <label class="form-label">Staff Status</label>
          <select class="form-control" id="tchStatus"><option>Full-Time</option><option>Part-Time</option></select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('addTeacherModal')">Cancel</button>
        <button class="btn btn-primary" onclick="saveTeacher()">Save Faculty</button>
      </div>
    </div>
  </div>
`, `
  window.addEventListener('load', loadTeachers);

  function loadTeachers() {
    const list = AppState.getData('lms_teachers');
    const body = document.getElementById('teacherTableBody');
    body.innerHTML = '';
    list.forEach(t => {
      body.innerHTML += \`<tr>
        <td>\${t.id}</td>
        <td><b>\${t.name}</b></td>
        <td>\${t.dept}</td>
        <td>\${t.subjects}</td>
        <td>\${t.phone}</td>
        <td><span class="badge badge-success">\${t.status}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:4px 8px; color:var(--danger);" onclick="deleteTeacher('\${t.id}')">🗑️</button>
        </td>
      </tr>\`;
    });
  }

  function saveTeacher() {
    const name = document.getElementById('tchName').value.trim();
    const dept = document.getElementById('tchDept').value.trim();
    const subjects = document.getElementById('tchSub').value.trim();
    const phone = document.getElementById('tchPhone').value.trim();
    const status = document.getElementById('tchStatus').value;

    if (!name || !dept || !subjects || !phone) return alert('Fill all fields.');

    const list = AppState.getData('lms_teachers');
    const id = 'TCH' + Math.floor(100 + Math.random() * 900);
    const newT = { id, name, dept, subjects, phone, status };
    list.push(newT);
    AppState.saveData('lms_teachers', list);
    AppState.addNotice(\`Registered Faculty member: \${name}\`);

    document.getElementById('tchName').value = '';
    document.getElementById('tchDept').value = '';
    document.getElementById('tchSub').value = '';
    document.getElementById('tchPhone').value = '';

    App.closeModal('addTeacherModal');
    loadTeachers();
    App.showToast('Faculty member registered successfully!');
  }

  function deleteTeacher(id) {
    if (!confirm('Delete teacher ' + id + '?')) return;
    let list = AppState.getData('lms_teachers');
    list = list.filter(t => t.id !== id);
    AppState.saveData('lms_teachers', list);
    loadTeachers();
    App.showToast('Staff profile deleted.');
  }
`);

writeFile('pages/admin/teachers.html', teachersHtml);

// 5. ADMIN CLASSES PAGE (With 18 classes list + section management)
const classesHtml = getPortalLayout('admin', 'Classes & Sections', 'School Structure Configuration', `
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
    <h3>Grade Configurations</h3>
    <button class="btn btn-primary" onclick="openNewClassModal()">➕ New Class</button>
  </div>

  <div class="grid-3" id="class-cards-grid"></div>

  <!-- Manage Sections Modal -->
  <div class="modal-overlay" id="sectionModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title" id="sectionModalTitle">Manage Sections</h3>
        <button class="modal-close" onclick="App.closeModal('sectionModal')">×</button>
      </div>
      <div class="modal-body">
        <div style="margin-bottom:15px;">
          <b>Current Class Teacher:</b> <span id="sectionClassTeacher"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Class Sections</label>
          <div style="display:flex; gap:10px; margin-bottom:15px;" id="section-checkboxes"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Assign Class Teacher</label>
          <select class="form-control" id="sectionTeacherSelect"></select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('sectionModal')">Close</button>
        <button class="btn btn-primary" onclick="saveSections()">Save Configurations</button>
      </div>
    </div>
  </div>

  <!-- New Class Modal -->
  <div class="modal-overlay" id="newClassModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Create Grade Level</h3>
        <button class="modal-close" onclick="App.closeModal('newClassModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Grade / Class Name</label>
          <input type="text" class="form-control" id="newClassName" placeholder="e.g. 10th Standard" required>
        </div>
        <div class="form-group">
          <label class="form-label">Assign Class Teacher</label>
          <select class="form-control" id="newClassTeacherSelect"></select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('newClassModal')">Cancel</button>
        <button class="btn btn-primary" onclick="saveNewClass()">Create Grade</button>
      </div>
    </div>
  </div>
`, `
  let selectedClassIndex = null;

  window.addEventListener('load', () => {
    loadClasses();
    loadTeachersSelect();
  });

  function loadClasses() {
    const list = AppState.getData('lms_classes');
    const grid = document.getElementById('class-cards-grid');
    grid.innerHTML = '';
    
    list.forEach((c, index) => {
      let bracket = 'Pre-Primary';
      let bracketCol = 'badge-purple';
      if (c.name.includes('Standard')) {
        const lvl = parseInt(c.name);
        if (lvl >= 1 && lvl <= 5) { bracket = 'Primary'; bracketCol = 'badge-success'; }
        else if (lvl >= 6 && lvl <= 8) { bracket = 'Middle'; bracketCol = 'badge-warning'; }
        else if (lvl >= 9 && lvl <= 10) { bracket = 'Secondary'; bracketCol = 'badge-info'; }
      } else if (c.name.includes('11th') || c.name.includes('12th')) {
        bracket = 'HSC / Higher Secondary';
        bracketCol = 'badge-danger';
      }

      grid.innerHTML += \`<div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="font-size:16px;">\${c.name}</h4>
          <span class="badge \${bracketCol}">\${bracket}</span>
        </div>
        <p><b>Sections:</b> \${c.sections.join(', ')}</p>
        <p><b>Total Students:</b> \${c.students} Wards</p>
        <p><b>Head Teacher:</b> \${c.teacher || 'Not Assigned'}</p>
        <div style="margin-top:15px; display:flex; gap:10px;">
          <button class="btn btn-primary" style="padding:4px 8px; flex:1;" onclick="openManageSections(\${index})">⚙️ Configure</button>
        </div>
      </div>\`;
    });
  }

  function loadTeachersSelect() {
    const list = AppState.getData('lms_teachers');
    const sel = document.getElementById('sectionTeacherSelect');
    const newSel = document.getElementById('newClassTeacherSelect');
    sel.innerHTML = '<option value="">Not Assigned</option>';
    newSel.innerHTML = '<option value="">Not Assigned</option>';
    list.forEach(t => {
      sel.innerHTML += \`<option value="\&lt;TCH\&gt; \${t.name}">\${t.name}</option>\`;
      newSel.innerHTML += \`<option value="\&lt;TCH\&gt; \${t.name}">\${t.name}</option>\`;
    });
  }

  function openNewClassModal() {
    App.openModal('newClassModal');
  }

  function saveNewClass() {
    const name = document.getElementById('newClassName').value.trim();
    const teacher = document.getElementById('newClassTeacherSelect').value;
    if(!name) return alert('Name required.');

    const list = AppState.getData('lms_classes');
    list.push({ name, sections: ['A'], teacher, students: 0 });
    AppState.saveData('lms_classes', list);
    App.closeModal('newClassModal');
    loadClasses();
    App.showToast('Grade Created Successfully!');
  }

  function openManageSections(index) {
    selectedClassIndex = index;
    const c = AppState.getData('lms_classes')[index];
    document.getElementById('sectionModalTitle').innerText = 'Configure ' + c.name;
    document.getElementById('sectionClassTeacher').innerText = c.teacher || 'Not Assigned';
    
    // Checkboxes sections
    const box = document.getElementById('section-checkboxes');
    box.innerHTML = '';
    ['A', 'B', 'C', 'D'].forEach(letter => {
      const checked = c.sections.includes(letter) ? 'checked' : '';
      box.innerHTML += \`<label><input type="checkbox" value="\${letter}" \${checked}> Section \${letter}</label>\`;
    });
    
    document.getElementById('sectionTeacherSelect').value = c.teacher || '';
    App.openModal('sectionModal');
  }

  function saveSections() {
    const list = AppState.getData('lms_classes');
    const c = list[selectedClassIndex];
    
    const checkboxes = document.querySelectorAll('#section-checkboxes input[type=checkbox]');
    const sections = [];
    checkboxes.forEach(b => {
      if(b.checked) sections.push(b.value);
    });
    if(sections.length === 0) return alert('Must select at least one section.');
    
    c.sections = sections;
    c.teacher = document.getElementById('sectionTeacherSelect').value;
    
    AppState.saveData('lms_classes', list);
    App.closeModal('sectionModal');
    loadClasses();
    App.showToast('Sections updated.');
  }
`);

writeFile('pages/admin/classes.html', classesHtml);

// 6. ADMIN SUBJECTS PAGE
const subjectsHtml = getPortalLayout('admin', 'Subjects', 'Subject Management', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Subject Registry</h3>
      <table class="data-table">
        <thead>
          <tr><th>Code</th><th>Name</th><th>Class</th><th>Weekly Periods</th><th>Type</th></tr>
        </thead>
        <tbody id="subjectTableBody"></tbody>
      </table>
    </div>
    
    <div class="card">
      <h3 class="card-title">Add New Subject</h3>
      <form onsubmit="saveSubject(event)">
        <div class="form-group"><label class="form-label">Subject Code</label><input type="text" class="form-control" id="subCode" required></div>
        <div class="form-group"><label class="form-label">Subject Name</label><input type="text" class="form-control" id="subName" required></div>
        <div class="form-group">
          <label class="form-label">Target Class</label>
          <select class="form-control" id="subClass"></select>
        </div>
        <div class="form-group"><label class="form-label">Periods per Week</label><input type="number" class="form-control" id="subPeriods" value="5"></div>
        <div class="form-group">
          <label class="form-label">Subject Type</label>
          <select class="form-control" id="subType"><option>Core</option><option>Elective</option><option>Language</option></select>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Register Subject</button>
      </form>
    </div>
  </div>
`, `
  window.addEventListener('load', () => {
    loadSubjects();
    loadClassesDropdown();
  });

  function loadSubjects() {
    const list = AppState.getData('lms_subjects');
    const body = document.getElementById('subjectTableBody');
    body.innerHTML = '';
    list.forEach(s => {
      body.innerHTML += \`<tr><td>\${s.code}</td><td><b>\${s.name}</b></td><td>\${s.class}</td><td>\${s.periods}</td><td>\${s.type}</td></tr>\`;
    });
  }

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('subClass');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }

  function saveSubject(e) {
    e.preventDefault();
    const code = document.getElementById('subCode').value.trim();
    const name = document.getElementById('subName').value.trim();
    const className = document.getElementById('subClass').value;
    const periods = document.getElementById('subPeriods').value;
    const type = document.getElementById('subType').value;

    const list = AppState.getData('lms_subjects');
    list.push({ code, name, class: className, periods, type });
    AppState.saveData('lms_subjects', list);
    
    document.getElementById('subCode').value = '';
    document.getElementById('subName').value = '';
    
    loadSubjects();
    App.showToast('Subject Registered successfully!');
  }
`);

writeFile('pages/admin/subjects.html', subjectsHtml);

// 7. ADMIN TIMETABLE PAGE (With dynamic AI generation and cell click edits)
const timetableHtml = getPortalLayout('admin', 'Timetable', 'School Timetable Planner', `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <div>
        <select class="form-control" style="display:inline-block; width:150px; margin-right:10px;" id="ttClassSelect" onchange="loadTimetable()">
          <option>10th Standard</option>
          <option>12th Science</option>
        </select>
        <select class="form-control" style="display:inline-block; width:100px; margin-right:10px;" id="ttSectionSelect" onchange="loadTimetable()">
          <option>A</option>
          <option>B</option>
        </select>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-warning" onclick="aiGenerateTimetable()">🤖 Generate Timetable (AI)</button>
        <button class="btn btn-primary" onclick="window.print()">Print PDF</button>
      </div>
    </div>

    <table class="data-table" style="text-align:center;">
      <thead>
        <tr>
          <th>Time Slot</th>
          <th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th>
        </tr>
      </thead>
      <tbody id="timetableBody"></tbody>
    </table>
  </div>

  <!-- Edit Slot Modal -->
  <div class="modal-overlay" id="editSlotModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Edit Class Period</h3>
        <button class="modal-close" onclick="App.closeModal('editSlotModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Subject</label>
          <select class="form-control" id="slotSubSelect"></select>
        </div>
        <div class="form-group">
          <label class="form-label">Teacher</label>
          <select class="form-control" id="slotTchSelect"></select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('editSlotModal')">Cancel</button>
        <button class="btn btn-primary" onclick="saveSlot()">Save Slot</button>
      </div>
    </div>
  </div>

  <!-- Loading Animation overlay -->
  <div class="loading-overlay" id="aiLoader">
    <div style="text-align: center;">
      <div class="spinner"></div>
      <p style="margin-top: 15px; font-weight: 600; color: var(--text-main);">AI Generator constructing schedule...</p>
    </div>
  </div>
`, `
  let selectedDayIndex = 0;
  let selectedPeriodIndex = 0;
  const timeSlots = [
    '08:00 - 08:45 AM',
    '08:45 - 09:30 AM',
    '09:30 - 10:15 AM',
    '10:15 - 11:00 AM',
    '11:00 - 11:45 AM',
    '11:45 - 12:30 PM',
    '12:30 - 01:15 PM'
  ];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  window.addEventListener('load', () => {
    loadTimetable();
    loadSlotDropdowns();
  });

  function getTimetableStateKey() {
    const c = document.getElementById('ttClassSelect').value;
    const s = document.getElementById('ttSectionSelect').value;
    return 'tt_' + c.replace(' ', '_') + '_' + s;
  }

  function loadTimetable() {
    const key = getTimetableStateKey();
    const tt = AppState.getData(key) || {};
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    timeSlots.forEach((slot, pIdx) => {
      let rowHtml = \`<tr><td><b>\${slot}</b></td>\`;
      days.forEach((day, dIdx) => {
        const item = tt[\`\${pIdx}_\${dIdx}\`] || { sub: '--', tch: '--' };
        rowHtml += \`<td onclick="openSlotEditor(\${pIdx}, \${dIdx})" style="cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
          <div><b>\${item.sub}</b></div>
          <div style="font-size:11px; color:var(--text-muted);">\${item.tch}</div>
        </td>\`;
      });
      rowHtml += \`</tr>\`;
      tbody.appendChild(rowHtml);
    });
  }

  function loadSlotDropdowns() {
    const subs = AppState.getData('lms_subjects');
    const tchs = AppState.getData('lms_teachers');

    const sSel = document.getElementById('slotSubSelect');
    sSel.innerHTML = '<option value="--">Free Period</option>';
    subs.forEach(s => {
      sSel.innerHTML += \`<option value="\${s.name}">\${s.name}</option>\`;
    });

    const tSel = document.getElementById('slotTchSelect');
    tSel.innerHTML = '<option value="--">No Teacher</option>';
    tchs.forEach(t => {
      tSel.innerHTML += \`<option value="\${t.name}">\${t.name}</option>\`;
    });
  }

  function openSlotEditor(pIdx, dIdx) {
    selectedPeriodIndex = pIdx;
    selectedDayIndex = dIdx;
    const key = getTimetableStateKey();
    const tt = AppState.getData(key) || {};
    const item = tt[\`\${pIdx}_\${dIdx}\`] || { sub: '--', tch: '--' };

    document.getElementById('slotSubSelect').value = item.sub;
    document.getElementById('slotTchSelect').value = item.tch;

    App.openModal('editSlotModal');
  }

  function saveSlot() {
    const key = getTimetableStateKey();
    const tt = AppState.getData(key) || {};
    tt[\`\${selectedPeriodIndex}_\${selectedDayIndex}\`] = {
      sub: document.getElementById('slotSubSelect').value,
      tch: document.getElementById('slotTchSelect').value
    };
    AppState.saveData(key, tt);
    App.closeModal('editSlotModal');
    loadTimetable();
    App.showToast('Schedule period saved.');
  }

  function aiGenerateTimetable() {
    const loader = document.getElementById('aiLoader');
    loader.classList.add('active');
    setTimeout(() => {
      loader.classList.remove('active');
      
      const key = getTimetableStateKey();
      const tt = {};
      const subsList = AppState.getData('lms_subjects').map(s=>s.name);
      const tchsList = AppState.getData('lms_teachers').map(t=>t.name);

      timeSlots.forEach((slot, pIdx) => {
        days.forEach((day, dIdx) => {
          const randSub = subsList[Math.floor(Math.random()*subsList.length)] || 'Free Period';
          const randTch = tchsList[Math.floor(Math.random()*tchsList.length)] || '--';
          tt[\`\${pIdx}_\${dIdx}\`] = { sub: randSub, tch: randTch };
        });
      });

      AppState.saveData(key, tt);
      loadTimetable();
      App.showToast('Schedule AI generated matching CBSE norms!', 'success');
    }, 1500);
  }
`);

writeFile('pages/admin/timetable.html', timetableHtml);

// 8. ADMIN ATTENDANCE PAGE (Roster marks, saving, calendars)
const attendanceHtml = getPortalLayout('admin', 'Attendance', 'Daily Attendance Sheet', `
  <div class="grid-2" style="grid-template-columns: 8fr 4fr;">
    <div class="card">
      <h3 class="card-title">Attendance Register</h3>
      
      <div style="display:flex; gap:15px; margin-bottom:15px;">
        <select class="form-control" style="width:150px;" id="attClass" onchange="loadAttendanceRoster()"></select>
        <input type="date" class="form-control" style="width:180px;" id="attDate" onchange="loadAttendanceRoster()">
      </div>

      <table class="data-table">
        <thead><tr><th>ID</th><th>Student</th><th>Status</th><th>Remarks</th></tr></thead>
        <tbody id="attRosterBody"></tbody>
      </table>
      
      <div style="margin-top:15px; text-align:right;">
        <button class="btn btn-warning" onclick="sendAlerts()">📢 Send Absentee Alerts</button>
        <button class="btn btn-primary" onclick="saveAttendance()">Save Register</button>
      </div>
    </div>

    <div>
      <div class="card">
        <h3 class="card-title">Daily Heatmap calendar</h3>
        <p style="font-size:12px; margin-bottom:10px;">Marking a student absent writes a red block on their monthly dashboard calendar.</p>
        <div class="heatmap-calendar">
          <div class="heatmap-day heatmap-present">1</div>
          <div class="heatmap-day heatmap-present">2</div>
          <div class="heatmap-day heatmap-present">3</div>
          <div class="heatmap-day heatmap-present">4</div>
          <div class="heatmap-day heatmap-absent" id="hm-target">5</div>
          <div class="heatmap-day heatmap-present">6</div>
          <div class="heatmap-day heatmap-holiday">7</div>
          <div class="heatmap-day heatmap-present">8</div>
          <div class="heatmap-day heatmap-present">9</div>
        </div>
      </div>
    </div>
  </div>
`, `
  window.addEventListener('load', () => {
    // Today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attDate').value = today;

    loadClassesDropdown();
    loadAttendanceRoster();
  });

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('attClass');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }

  function loadAttendanceRoster() {
    const cVal = document.getElementById('attClass').value;
    const dateVal = document.getElementById('attDate').value;
    const students = AppState.getData('lms_students');
    const filtered = students.filter(s => s.class === cVal);
    
    const attState = AppState.getData('lms_attendance') || {};
    const body = document.getElementById('attRosterBody');
    body.innerHTML = '';

    if(filtered.length === 0) {
      body.innerHTML = '<tr><td colspan="4">No students enrolled in this grade class.</td></tr>';
      return;
    }

    filtered.forEach(s => {
      const stateKey = \`\${dateVal}_\${s.id}\`;
      const marked = attState[stateKey] || 'Present';
      
      const pChecked = marked === 'Present' ? 'checked' : '';
      const aChecked = marked === 'Absent' ? 'checked' : '';
      const lChecked = marked === 'Late' ? 'checked' : '';

      body.innerHTML += \`<tr>
        <td>\${s.id}</td>
        <td><b>\${s.name}</b></td>
        <td>
          <label><input type="radio" name="att_\${s.id}" value="Present" \${pChecked}> Present</label> &nbsp;
          <label><input type="radio" name="att_\${s.id}" value="Absent" \${aChecked}> Absent</label> &nbsp;
          <label><input type="radio" name="att_\${s.id}" value="Late" \${lChecked}> Late</label>
        </td>
        <td><input type="text" class="form-control" id="rem_\${s.id}" placeholder="Remarks" value=""></td>
      </tr>\`;
    });
  }

  function saveAttendance() {
    const cVal = document.getElementById('attClass').value;
    const dateVal = document.getElementById('attDate').value;
    const students = AppState.getData('lms_students');
    const filtered = students.filter(s => s.class === cVal);

    const attState = AppState.getData('lms_attendance') || {};
    let absentCount = 0;
    
    filtered.forEach(s => {
      const radios = document.getElementsByName(\`att_\${s.id}\`);
      let status = 'Present';
      radios.forEach(r => {
        if(r.checked) status = r.value;
      });
      if(status === 'Absent') absentCount++;
      attState[\`\${dateVal}_\${s.id}\`] = status;
    });

    AppState.saveData('lms_attendance', attState);
    
    // Update Heatmap demo box
    const hmTarget = document.getElementById('hm-target');
    if(absentCount > 0) {
      hmTarget.className = 'heatmap-day heatmap-absent';
    } else {
      hmTarget.className = 'heatmap-day heatmap-present';
    }

    AppState.addNotice(\`Attendance marked for \${cVal} on \${dateVal}\`);
    App.showToast('Attendance Register saved.');
  }

  function sendAlerts() {
    App.showToast('Triggering Twilio/SMS Parent notices...');
    setTimeout(() => {
      App.showToast('Absentees parents alerted successfully via SMS/WhatsApp!', 'success');
    }, 1500);
  }
`);

writeFile('pages/admin/attendance.html', attendanceHtml);

// 9. ADMIN EXAMS PAGE
const examsHtml = getPortalLayout('admin', 'Examinations', 'Exam Management Center', `
  <div class="tab-container">
    <div class="tab active" onclick="switchTab(0)">Upcoming Exams</div>
    <div class="tab" onclick="switchTab(1)">Online MCQ Creator</div>
  </div>

  <div style="text-align:right; margin-bottom:15px;" id="upcoming-actions">
    <button class="btn btn-primary" onclick="App.openModal('examModal')">➕ Schedule Exam</button>
  </div>

  <div class="card" id="upcoming-tab-pane">
    <h3 class="card-title">Scheduled School Examinations</h3>
    <table class="data-table">
      <thead>
        <tr><th>Exam Name</th><th>Type</th><th>Classes</th><th>Date Range</th><th>Max Marks</th><th>Status</th></tr>
      </thead>
      <tbody id="examTableBody"></tbody>
    </table>
  </div>

  <!-- Online MCQ Pane -->
  <div class="card" id="online-tab-pane" style="display:none;">
    <h3 class="card-title">Create MCQ Online Quiz</h3>
    <form onsubmit="saveOnlineQuiz(event)">
      <div class="form-group"><label class="form-label">Quiz Topic Name</label><input type="text" class="form-control" id="qzTitle" placeholder="e.g. Science Test 1" required></div>
      <div class="form-group"><label class="form-label">Time Limit (Minutes)</label><input type="number" class="form-control" id="qzDuration" value="20" required></div>
      <div style="border:1px solid var(--border-color); padding:15px; border-radius:var(--radius); margin-bottom:15px;">
        <h5>Add Question 1</h5>
        <div class="form-group"><input type="text" class="form-control" id="qzQ1" placeholder="Question Text" required></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <input type="text" class="form-control" id="qzQ1a" placeholder="Option A" required>
          <input type="text" class="form-control" id="qzQ1b" placeholder="Option B" required>
        </div>
      </div>
      <button type="submit" class="btn btn-success">Publish MCQ Test</button>
    </form>
  </div>

  <!-- Schedule Exam Modal -->
  <div class="modal-overlay" id="examModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Schedule Academic Exam</h3>
        <button class="modal-close" onclick="App.closeModal('examModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Exam Name</label><input type="text" class="form-control" id="exName" required></div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select class="form-control" id="exType"><option>Quarterly</option><option>Unit Test</option><option>Annual</option></select>
        </div>
        <div class="form-group">
          <label class="form-label">Class</label>
          <select class="form-control" id="exClass"></select>
        </div>
        <div class="form-group"><label class="form-label">Max Marks</label><input type="number" class="form-control" id="exMarks" value="100" required></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('examModal')">Cancel</button>
        <button class="btn btn-primary" onclick="saveExam()">Schedule</button>
      </div>
    </div>
  </div>
`, `
  window.addEventListener('load', () => {
    loadExams();
    loadClassesDropdown();
  });

  function loadExams() {
    const list = AppState.getData('lms_exams');
    const body = document.getElementById('examTableBody');
    body.innerHTML = '';
    list.forEach(e => {
      body.innerHTML += \`<tr>
        <td><b>\${e.name}</b></td>
        <td>\${e.type}</td>
        <td>\${e.classes}</td>
        <td>\${e.dates || 'July 2026'}</td>
        <td>\${e.marks}</td>
        <td><span class="badge badge-success">\${e.status}</span></td>
      </tr>\`;
    });
  }

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('exClass');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }

  function saveExam() {
    const name = document.getElementById('exName').value.trim();
    const type = document.getElementById('exType').value;
    const className = document.getElementById('exClass').value;
    const marks = document.getElementById('exMarks').value;

    if(!name) return alert('Name required.');

    const list = AppState.getData('lms_exams');
    list.push({ name, type, classes: className, dates: 'Jul 2026', marks, status: 'Scheduled' });
    AppState.saveData('lms_exams', list);
    AppState.addNotice(\`Scheduled Exam: \${name} for \${className}\`);

    document.getElementById('exName').value = '';
    App.closeModal('examModal');
    loadExams();
    App.showToast('Exam scheduled successfully!');
  }

  function switchTab(index) {
    const tabs = document.querySelectorAll('.tab-container .tab');
    tabs.forEach((t, i) => {
      if(i === index) t.classList.add('active');
      else t.classList.remove('active');
    });

    if(index === 0) {
      document.getElementById('upcoming-actions').style.display = 'block';
      document.getElementById('upcoming-tab-pane').style.display = 'block';
      document.getElementById('online-tab-pane').style.display = 'none';
    } else {
      document.getElementById('upcoming-actions').style.display = 'none';
      document.getElementById('upcoming-tab-pane').style.display = 'none';
      document.getElementById('online-tab-pane').style.display = 'block';
    }
  }

  function saveOnlineQuiz(e) {
    e.preventDefault();
    const title = document.getElementById('qzTitle').value;
    App.showToast('MCQ published on Student portal under Online Tests!', 'success');
  }
`);

writeFile('pages/admin/exams.html', examsHtml);

console.log('Interactivity generation complete!');
