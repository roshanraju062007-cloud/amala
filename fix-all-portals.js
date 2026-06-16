/**
 * Complete Portal Fixer — Rewrites all pages with static/placeholder content
 * with fully dynamic, localStorage-driven content
 * Run: node fix-all-portals.js
 */
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');

// ─── SIDEBAR TEMPLATES ───────────────────────────────────────────────────────
const ADMIN_SIDEBAR = `      <div class="sidebar-brand">
        <svg viewBox="0 0 500 500" class="sidebar-logo" fill="none">
          <circle cx="250" cy="250" r="230" fill="#FFF"/>
          <circle cx="250" cy="250" r="180" fill="#4F46E5"/>
          <text x="250" y="290" fill="#FFF" font-size="120" font-weight="900" text-anchor="middle">A</text>
        </svg>
        <div class="sidebar-title">AMALA HSS<span>EduSphere LMS</span></div>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-header">Main</li>
        <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
        <li class="sidebar-item"><a href="students.html">🎓 Students</a></li>
        <li class="sidebar-item"><a href="teachers.html">👨‍🏫 Teachers</a></li>
        <li class="sidebar-item"><a href="parents.html">👪 Parents</a></li>
        <li class="menu-header">Academics</li>
        <li class="sidebar-item"><a href="classes.html">🏫 Classes &amp; Sections</a></li>
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
        <li style="margin-top:20px;" class="sidebar-item"><a href="#" onclick="App.logout()">🚪 Logout</a></li>
      </ul>`;

const TEACHER_SIDEBAR = `      <div class="sidebar-brand">
        <svg viewBox="0 0 500 500" class="sidebar-logo" fill="none">
          <circle cx="250" cy="250" r="230" fill="#FFF"/>
          <circle cx="250" cy="250" r="180" fill="#10B981"/>
          <text x="250" y="290" fill="#FFF" font-size="120" font-weight="900" text-anchor="middle">A</text>
        </svg>
        <div class="sidebar-title">AMALA HSS<span>Teacher Portal</span></div>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-header">Teacher</li>
        <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
        <li class="sidebar-item"><a href="my-classes.html">🏫 My Classes</a></li>
        <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
        <li class="sidebar-item"><a href="assignments.html">📎 Assignments</a></li>
        <li class="sidebar-item"><a href="study-materials.html">📚 Study Materials</a></li>
        <li class="sidebar-item"><a href="exams.html">✍️ Exams &amp; Marks</a></li>
        <li class="sidebar-item"><a href="messages.html">💬 Messages</a></li>
        <li class="sidebar-item"><a href="profile.html">👤 Profile</a></li>
        <li style="margin-top:20px;" class="sidebar-item"><a href="#" onclick="App.logout()">🚪 Logout</a></li>
      </ul>`;

// ─── TEACHER MY-CLASSES — fully dynamic ─────────────────────────────────────
const TEACHER_MYCLASSES = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Classes - EduSphere Teacher Portal</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>:root{--primary:#10B981;--primary-dark:#059669;--primary-light:#ECFDF5;}</style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">
${TEACHER_SIDEBAR}
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">My Classes</h1>
        </div>
        <div class="header-right">
          <div class="search-bar">🔍 <input type="text" id="classSearch" placeholder="Search classes..." oninput="filterClasses()"></div>
          <button class="header-btn" id="darkModeToggle" onclick="App.toggleDark()">🌙</button>
          <div class="user-chip"><div class="avatar-circle" id="userAvatar">T</div><div style="font-weight:600;" id="userDisplayName">Teacher</div></div>
        </div>
      </header>
      <div class="content-area">
        <div class="grid-3" id="classesGrid"></div>
        <div class="card" style="margin-top:20px;">
          <h3 class="card-title">📋 My Students</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Section</th><th>Attendance</th><th>Fee Status</th></tr></thead>
              <tbody id="myStudentsTable"></tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
  <script src="../../js/app.js"></script>
  <script src="../../js/auth-check.js"></script>
  <script>
    let myClasses = [];
    let myStudents = [];

    document.addEventListener('DOMContentLoaded', () => {
      const teacherId = localStorage.getItem('userId') || 'TCH001';
      const teachers = JSON.parse(localStorage.getItem('lms_teachers') || '[]');
      const teacher = teachers.find(t => t.id === teacherId) || {};
      const classes = JSON.parse(localStorage.getItem('lms_classes') || '[]');
      const students = JSON.parse(localStorage.getItem('lms_students') || '[]');

      // Find classes assigned to this teacher
      myClasses = classes.filter(c => c.teacherId === teacherId);
      if (myClasses.length === 0 && classes.length > 0) {
        // Assign first class as fallback
        myClasses = [classes[0]];
      }

      const classNames = myClasses.map(c => c.name);
      myStudents = students.filter(s => classNames.includes(s.class));

      renderClasses();
      renderStudents(myStudents);
    });

    function renderClasses() {
      const grid = document.getElementById('classesGrid');
      grid.innerHTML = '';
      if (myClasses.length === 0) {
        grid.innerHTML = '<div class="card"><p style="color:var(--text-muted)">No classes assigned yet. Contact admin.</p></div>';
        return;
      }
      myClasses.forEach(cls => {
        const stuCount = (JSON.parse(localStorage.getItem('lms_students') || '[]')).filter(s => s.class === cls.name).length;
        grid.innerHTML += \`<div class="card" style="border-top:4px solid var(--primary);">
          <h4 style="font-size:15px; color:var(--primary); margin-bottom:10px;">\${cls.name}</h4>
          <p><b>Sections:</b> \${cls.sections ? cls.sections.join(', ') : 'A'}</p>
          <p><b>Students:</b> \${stuCount} enrolled</p>
          <p><b>Subjects:</b> \${cls.subjects || 'All Subjects'}</p>
          <button class="btn btn-success" style="width:100%;margin-top:12px;" onclick="scrollToStudents()">👥 View Students</button>
        </div>\`;
      });
    }

    function scrollToStudents() {
      document.getElementById('myStudentsTable').closest('.card').scrollIntoView({ behavior:'smooth' });
    }

    function renderStudents(list) {
      const tbody = document.getElementById('myStudentsTable');
      tbody.innerHTML = '';
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No students found.</td></tr>';
        return;
      }
      list.forEach(s => {
        const attColor = s.attendance >= 85 ? 'var(--success)' : s.attendance >= 75 ? 'var(--warning)' : 'var(--danger)';
        tbody.innerHTML += \`<tr>
          <td>\${s.id}</td>
          <td><b>\${s.name}</b></td>
          <td>\${s.class}</td>
          <td>\${s.section}</td>
          <td><span style="color:\${attColor};font-weight:600;">\${s.attendance || 90}%</span></td>
          <td><span class="badge \${s.fee==='Paid'?'badge-success':s.fee==='Partial'?'badge-warning':'badge-danger'}">\${s.fee}</span></td>
        </tr>\`;
      });
    }

    function filterClasses() {
      const q = document.getElementById('classSearch').value.toLowerCase();
      const filtered = myStudents.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
      renderStudents(filtered);
    }
  </script>
</body>
</html>`;

// ─── TEACHER ATTENDANCE ──────────────────────────────────────────────────────
const TEACHER_ATTENDANCE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mark Attendance - EduSphere Teacher Portal</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>:root{--primary:#10B981;--primary-dark:#059669;--primary-light:#ECFDF5;}
  .att-row{display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border-color);}
  .att-row:last-child{border-bottom:none;}
  .att-btns{display:flex;gap:8px;}
  .att-btn{padding:5px 14px;border-radius:4px;border:2px solid var(--border-color);cursor:pointer;font-size:13px;background:transparent;}
  .att-btn.P{background:#D1FAE5;border-color:#10B981;color:#065F46;font-weight:700;}
  .att-btn.A{background:#FEE2E2;border-color:#EF4444;color:#B91C1C;font-weight:700;}
  .att-btn.L{background:#FEF3C7;border-color:#F59E0B;color:#92400E;font-weight:700;}
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">
${TEACHER_SIDEBAR}
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Mark Attendance</h1>
        </div>
        <div class="header-right">
          <button class="header-btn" id="darkModeToggle" onclick="App.toggleDark()">🌙</button>
          <div class="user-chip"><div class="avatar-circle" id="userAvatar">T</div><div style="font-weight:600;" id="userDisplayName">Teacher</div></div>
        </div>
      </header>
      <div class="content-area">
        <div class="card">
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;align-items:center;">
            <div>
              <label class="form-label">Select Class</label>
              <select class="form-control" id="attClassSelect" onchange="loadStudentsForAtt()" style="min-width:200px;"></select>
            </div>
            <div>
              <label class="form-label">Date</label>
              <input type="date" class="form-control" id="attDate">
            </div>
            <div style="margin-top:22px;">
              <button class="btn btn-primary" onclick="markAllPresent()">✅ All Present</button>
            </div>
          </div>
          <div id="attendanceList"></div>
          <div style="margin-top:20px;display:flex;gap:12px;">
            <button class="btn btn-success" onclick="saveAttendance()">💾 Save Attendance</button>
            <span id="attStatus" style="align-self:center;color:var(--text-muted);font-size:13px;"></span>
          </div>
        </div>
      </div>
    </main>
  </div>
  <script src="../../js/app.js"></script>
  <script src="../../js/auth-check.js"></script>
  <script>
    let attMap = {};
    let currentStudents = [];

    document.addEventListener('DOMContentLoaded', () => {
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('attDate').value = today;

      const teacherId = localStorage.getItem('userId') || 'TCH001';
      const classes = JSON.parse(localStorage.getItem('lms_classes') || '[]');
      const teachers = JSON.parse(localStorage.getItem('lms_teachers') || '[]');
      const teacher = teachers.find(t => t.id === teacherId) || {};

      const select = document.getElementById('attClassSelect');
      const myClasses = classes.filter(c => c.teacherId === teacherId);
      const showClasses = myClasses.length > 0 ? myClasses : classes.slice(0, 5);

      showClasses.forEach(c => {
        c.sections.forEach(sec => {
          select.innerHTML += \`<option value="\${c.name}|\${sec}">\${c.name} — Section \${sec}</option>\`;
        });
      });
      loadStudentsForAtt();
    });

    function loadStudentsForAtt() {
      const val = document.getElementById('attClassSelect').value;
      if (!val) return;
      const [className, section] = val.split('|');
      const allStudents = JSON.parse(localStorage.getItem('lms_students') || '[]');
      currentStudents = allStudents.filter(s => s.class === className && s.section === section);
      attMap = {};
      currentStudents.forEach(s => attMap[s.id] = 'P');

      const list = document.getElementById('attendanceList');
      list.innerHTML = \`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--bg-secondary);border-radius:6px;margin-bottom:8px;font-weight:600;font-size:13px;">
        <span>STUDENT NAME</span><span>PRESENT / ABSENT / LEAVE</span>
      </div>\`;

      currentStudents.forEach(s => {
        list.innerHTML += \`<div class="att-row">
          <span><b>\${s.name}</b> <small style="color:var(--text-muted);">(\${s.id})</small></span>
          <div class="att-btns">
            <button class="att-btn P" id="btn_P_\${s.id}" onclick="markAtt('\${s.id}','P')">✓ P</button>
            <button class="att-btn" id="btn_A_\${s.id}" onclick="markAtt('\${s.id}','A')">✗ A</button>
            <button class="att-btn" id="btn_L_\${s.id}" onclick="markAtt('\${s.id}','L')">~ L</button>
          </div>
        </div>\`;
      });

      if (currentStudents.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No students in this class-section.</p>';
      }
    }

    function markAtt(stuId, status) {
      attMap[stuId] = status;
      ['P','A','L'].forEach(s => {
        const btn = document.getElementById('btn_' + s + '_' + stuId);
        if (btn) btn.className = 'att-btn' + (s === status ? ' ' + s : '');
      });
    }

    function markAllPresent() {
      currentStudents.forEach(s => markAtt(s.id, 'P'));
    }

    function saveAttendance() {
      const date = document.getElementById('attDate').value;
      const val = document.getElementById('attClassSelect').value;
      if (!val || !date) return;
      const [className, section] = val.split('|');

      const allAtt = JSON.parse(localStorage.getItem('lms_attendance') || '{}');
      const key = date + '_' + className + '_' + section;
      allAtt[key] = attMap;
      localStorage.setItem('lms_attendance', JSON.stringify(allAtt));

      const present = Object.values(attMap).filter(v => v === 'P').length;
      const absent = Object.values(attMap).filter(v => v === 'A').length;
      document.getElementById('attStatus').textContent = \`✅ Saved! Present: \${present}, Absent: \${absent}\`;
      App.showToast('Attendance saved for ' + date);
      AppState.addNotice('Attendance marked for ' + className + ' Section ' + section + ' on ' + date);
    }
  </script>
</body>
</html>`;

// Write files
const filesToWrite = [
  { path: path.join(pagesDir, 'teacher', 'my-classes.html'), content: TEACHER_MYCLASSES },
  { path: path.join(pagesDir, 'teacher', 'attendance.html'), content: TEACHER_ATTENDANCE },
];

filesToWrite.forEach(f => {
  fs.writeFileSync(f.path, f.content, 'utf8');
  console.log('✅ Written: ' + path.relative(__dirname, f.path));
});

console.log('\nAll critical pages written successfully!');
