const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const fullPath = path.resolve(filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Rewritten: ${filePath}`);
}

// ==========================================================
// STUDENT SHARED SEGMENTS
// ==========================================================
const studentHeaderRightHtml = `
          <div class="search-bar">
            🔍 <input type="text" placeholder="Search course files...">
          </div>
          <button class="header-btn" id="darkModeToggle" onclick="App.toggleDark()">🌙</button>
          <button class="header-btn">
            🔔 <span class="badge-dot"></span>
          </button>
          <div class="user-chip">
            <div class="avatar-circle" id="userAvatar">S</div>
            <div style="font-weight: 600;" id="userDisplayName">Student Name</div>
          </div>
`;

const initStudentProfileJs = `
  let currentStudent = null;

  function loadStudentProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    currentStudent = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentStudent.name;
    const userAv = document.getElementById('userAvatar');
    if (currentStudent.photo) {
      userAv.innerHTML = \`<img src="\${currentStudent.photo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">\`;
      userAv.style.background = 'transparent';
    } else {
      const nameParts = currentStudent.name.split(' ');
      userAv.innerText = nameParts.map(p => p[0]).join('');
      userAv.style.backgroundColor = 'var(--primary-dark)';
    }
  }
`;

const studentSidebarHtml = `
      <div class="sidebar-brand">
        <svg viewBox="0 0 500 500" class="sidebar-logo" fill="none">
          <circle cx="250" cy="250" r="230" fill="#FFF"/>
          <circle cx="250" cy="250" r="180" fill="#4F46E5"/>
          <text x="250" y="290" fill="#FFF" font-size="120" font-weight="900" text-anchor="middle">A</text>
        </svg>
        <div class="sidebar-title">
          AMALA HSS
          <span>eVarsity® School ERP</span>
        </div>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-header">Student Portal</li>
        <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
        <li class="sidebar-item"><a href="subjects.html">📚 Curriculum Subjects</a></li>
        <li class="sidebar-item"><a href="study-materials.html">📖 Study Materials</a></li>
        <li class="sidebar-item"><a href="assignments.html">📎 Assignments</a></li>
        <li class="sidebar-item"><a href="online-tests.html">✍️ Online Tests</a></li>
        <li class="sidebar-item"><a href="timetable.html">📅 Class Timetable</a></li>
        <li class="sidebar-item"><a href="attendance.html">📝 Attendance Log</a></li>
        <li class="sidebar-item"><a href="results.html">🏆 Results & Internals</a></li>
        <li class="sidebar-item"><a href="report-card.html">📄 Term Report Card</a></li>
        <li class="sidebar-item"><a href="ai-assistant.html">🤖 AI Study Assistant</a></li>
        <li class="sidebar-item"><a href="chat.html">💬 Chat Inbox</a></li>
        <li class="sidebar-item"><a href="profile.html">👤 Student Profile</a></li>
        <li style="margin-top: 20px;" class="sidebar-item">
          <a href="#" onclick="App.logout()">🚪 Logout ERP</a>
        </li>
      </ul>
`;

// ==========================================================
// PARENT SHARED SEGMENTS
// ==========================================================
const parentHeaderRightHtml = `
          <div class="search-bar">
            🔍 <input type="text" placeholder="Search child records...">
          </div>
          <button class="header-btn" id="darkModeToggle" onclick="App.toggleDark()">🌙</button>
          <button class="header-btn">
            🔔 <span class="badge-dot"></span>
          </button>
          <div class="user-chip">
            <div class="avatar-circle" id="parentAvatar">P</div>
            <div style="font-weight: 600;" id="parentDisplayName">Parent Name</div>
          </div>
`;

const initParentProfileJs = `
  let currentParentName = '';
  let currentParentId = '';
  let currentChild = null;

  function loadParentProfile() {
    const parentId = localStorage.getItem('userId') || 'PAR001';
    const childId = localStorage.getItem('childId') || 'STU001';
    const students = AppState.getData('lms_students');
    
    currentChild = students.find(s => s.id === childId || s.parentUsername === parentId) || students[0];
    currentParentName = currentChild.parent;
    currentParentId = currentChild.parentUsername || parentId;

    document.getElementById('parentDisplayName').innerText = currentParentName;
    const nameParts = currentParentName.split(' ');
    document.getElementById('parentAvatar').innerText = nameParts.map(p => p[0]).join('');
  }
`;

const parentSidebarHtml = `
      <div class="sidebar-brand">
        <svg viewBox="0 0 500 500" class="sidebar-logo" fill="none">
          <circle cx="250" cy="250" r="230" fill="#FFF"/>
          <circle cx="250" cy="250" r="180" fill="#0D9488"/>
          <text x="250" y="290" fill="#FFF" font-size="120" font-weight="900" text-anchor="middle">A</text>
        </svg>
        <div class="sidebar-title">
          AMALA HSS
          <span>eVarsity® School ERP</span>
        </div>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-header">Parent Console</li>
        <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
        <li class="sidebar-item"><a href="attendance.html">📝 Attendance Log</a></li>
        <li class="sidebar-item"><a href="results.html">🏆 Results & CIA</a></li>
        <li class="sidebar-item"><a href="homework.html">📎 Ward Homework</a></li>
        <li class="sidebar-item"><a href="fees.html">💳 Fee Account</a></li>
        <li class="sidebar-item"><a href="timetable.html">📅 Class Timetable</a></li>
        <li class="sidebar-item"><a href="subjects.html">📚 Curriculum Subjects</a></li>
        <li class="sidebar-item"><a href="study-materials.html">📖 Study Materials</a></li>
        <li class="sidebar-item"><a href="messages.html">💬 Faculty Inbox</a></li>
        <li class="sidebar-item"><a href="profile.html">👤 Profile console</a></li>
        <li style="margin-top: 20px;" class="sidebar-item">
          <a href="#" onclick="App.logout()">🚪 Logout ERP</a>
        </li>
      </ul>
`;

// Helper to inject the ERP Student Info Card layout
const studentInfoCardHtml = `
        <div class="card" style="border-top: 4px solid var(--primary); padding:20px; margin-bottom:20px; background-color: var(--bg-card);">
          <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
            <div class="avatar-circle" style="width:70px; height:70px; font-size:28px; line-height:70px; background-color: var(--primary-light); color: var(--primary-dark); font-weight: bold;" id="stuBigAvatar">S</div>
            <div style="flex:1;">
              <h2 id="stuHeaderName" style="margin:0; font-size:22px; color:var(--text-main);">Loading Student Name...</h2>
              <p style="margin:4px 0 0 0; color:var(--text-muted); font-size:14px;" id="stuHeaderClass">Loading Standard...</p>
            </div>
            <div style="display:grid; grid-template-columns:auto auto; gap:10px 20px; font-size:13px; border-left:1px solid var(--border-color); padding-left:20px;">
              <div>🔑 <b>Admission ID:</b> <span id="infoAdmID">--</span></div>
              <div>📅 <b>Academic Term:</b> <span>Term I</span></div>
              <div>👨‍🏫 <b>Class Teacher:</b> <span id="infoTeacher">--</span></div>
              <div>🏫 <b>Academic Year:</b> <span>2026 - 2027</span></div>
            </div>
          </div>
        </div>
`;

const loadStudentInfoCardJs = `
  function loadStudentInfoCard(studentObj) {
    document.getElementById('stuHeaderName').innerText = studentObj.name;
    document.getElementById('stuHeaderClass').innerText = studentObj.class + ' - Section ' + studentObj.section;
    document.getElementById('infoAdmID').innerText = studentObj.id;

    // Resolve class teacher
    const classes = AppState.getData('lms_classes');
    const cls = classes.find(c => c.name === studentObj.class);
    document.getElementById('infoTeacher').innerText = cls ? cls.teacherName : 'Assigned Faculty';

    // Avatar
    const avatar = document.getElementById('stuBigAvatar');
    if (studentObj.photo) {
      avatar.innerHTML = \`<img src="\${studentObj.photo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">\`;
      avatar.style.background = 'transparent';
    } else {
      const nameParts = studentObj.name.split(' ');
      avatar.innerText = nameParts.map(p => p[0]).join('');
      avatar.style.backgroundColor = 'var(--primary-light)';
    }
  }
`;


// ==========================================================
// 1. pages/student/dashboard.html
// ==========================================================
writeFile('pages/student/dashboard.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Dashboard - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Student Dashboard Desk</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <!-- ERP Student Info Card -->
        ${studentInfoCardHtml}

        <div class="stats-grid">
          <div class="stat-card" style="border-left-color: var(--primary)">
            <div class="stat-info">
              <h3>My Attendance Log</h3>
              <div class="stat-value" id="attValue">--</div>
            </div>
          </div>
          <div class="stat-card" style="border-left-color: var(--success)">
            <div class="stat-info">
              <h3>Homework Tasks Due</h3>
              <div class="stat-value" id="due-count">--</div>
            </div>
          </div>
          <div class="stat-card" style="border-left-color: var(--warning)">
            <div class="stat-info">
              <h3>Exams Published</h3>
              <div class="stat-value" id="results-count">--</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <h3 class="card-title">Pending Homework Assignments</h3>
            <div id="pending-hw-box"></div>
          </div>
          <div class="card">
            <h3 class="card-title">School Announcements Board</h3>
            <ul style="list-style:none;" id="student-notices"></ul>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}
    ${loadStudentInfoCardJs}
    
    window.addEventListener('load', () => {
      loadStudentProfile();
      loadStudentInfoCard(currentStudent);

      document.getElementById('attValue').innerText = (currentStudent.attendance || 85) + '%';

      const asns = AppState.getData('lms_assignments').filter(a => a.class === currentStudent.class);
      const notices = AppState.getData('lms_notices');
      const results = AppState.getData('lms_results').filter(r => r.stuId === currentStudent.id);

      document.getElementById('due-count').innerText = asns.length;
      document.getElementById('results-count').innerText = results.length;

      // Notices
      const nBox = document.getElementById('student-notices');
      nBox.innerHTML = '';
      notices.slice(0, 4).forEach(n => {
        nBox.innerHTML += \`<li style="padding:8px 0; border-bottom:1px solid var(--border-color)">📢 \${n.msg} <small style="color:var(--text-muted); float:right;">\${n.time}</small></li>\`;
      });

      // HW
      const hwBox = document.getElementById('pending-hw-box');
      hwBox.innerHTML = '';
      if (asns.length === 0) {
        hwBox.innerHTML = '<p style="color:var(--text-muted)">No pending homework tasks!</p>';
      } else {
        asns.forEach(a => {
          hwBox.innerHTML += \`<div class="card" style="border-left:4px solid var(--danger); padding:12px; margin-bottom:10px;">
            <h4>\${a.title}</h4>
            <p>Subject: \${a.subject} | Due: \${a.due}</p>
            <button class="btn btn-primary" style="margin-top:8px; padding:4px 8px;" onclick="window.location.href='assignments.html'">Submit Homework</button>
          </div>\`;
        });
      }
    });
  </script>
</body>
</html>`);


// ==========================================================
// 2. pages/student/timetable.html
// ==========================================================
writeFile('pages/student/timetable.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Class Timetable - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Class Timetable Schedule</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="margin-bottom: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <label style="font-weight:600; margin-right:10px;">Select Class Standard to View Timetable:</label>
              <select class="form-control" style="display:inline-block; width:260px;" id="ttClassSelect" onchange="loadSelectedTimetable()"></select>
              <select class="form-control" style="display:inline-block; width:90px;" id="ttSectionSelect" onchange="loadSelectedTimetable()">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>
            <div>
              <button class="btn btn-outline" onclick="resetToMyClass()">My Class</button>
              <button class="btn btn-primary" onclick="window.print()">🖨️ Print timetable</button>
            </div>
          </div>
        </div>

        <div class="card">
          <table class="data-table" style="text-align:center;">
            <thead>
              <tr>
                <th>Time Period</th>
                <th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th>
              </tr>
            </thead>
            <tbody id="timetableBody"></tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}

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
      loadStudentProfile();
      loadClassesDropdown(() => {
        resetToMyClass();
      });
    });

    function loadClassesDropdown(callback) {
      const classes = AppState.getData('lms_classes');
      const select = document.getElementById('ttClassSelect');
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
      if(callback) callback();
    }

    function resetToMyClass() {
      if (!currentStudent) return;
      document.getElementById('ttClassSelect').value = currentStudent.class;
      document.getElementById('ttSectionSelect').value = currentStudent.section;
      loadSelectedTimetable();
    }

    function loadSelectedTimetable() {
      const className = document.getElementById('ttClassSelect').value;
      const section = document.getElementById('ttSectionSelect').value;
      const key = 'tt_' + className.replace(/ /g, '_') + '_' + section;
      const tt = AppState.getData(key) || {};
      
      const tbody = document.getElementById('timetableBody');
      tbody.innerHTML = '';

      timeSlots.forEach((slot, pIdx) => {
        let rowHtml = \`<tr><td><b>Period \${pIdx + 1}<br><small style="font-weight:normal; opacity:0.8;">\${slot}</small></b></td>\`;
        days.forEach((day, dIdx) => {
          const item = tt[\`\${pIdx}_\${dIdx}\`] || { sub: '--', tch: '--' };
          
          let cellStyle = '';
          if (item.sub !== '--') {
            cellStyle = 'background-color: var(--primary-light); color: var(--primary-dark); font-weight:600;';
          }

          rowHtml += \`<td style="\${cellStyle}">
            <div>\${item.sub}</div>
            <div style="font-size:10px; font-weight:normal; opacity:0.8;">\${item.tch}</div>
          </td>\`;
        });
        rowHtml += \`</tr>\`;
        tbody.innerHTML += rowHtml;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 3. pages/student/subjects.html
// ==========================================================
writeFile('pages/student/subjects.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Curriculum Subjects - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Curriculum Course Subjects</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="margin-bottom: 20px;">
          <div>
            <label style="font-weight:600; margin-right:10px;">View Subjects for Class Standard:</label>
            <select class="form-control" style="display:inline-block; width:280px;" id="subjectClassSelect" onchange="loadSelectedSubjects()"></select>
            <button class="btn btn-outline" style="margin-left: 10px;" onclick="resetToMyClass()">My Class</button>
          </div>
        </div>

        <div class="grid-3" id="subjects-grid"></div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}

    window.addEventListener('load', () => {
      loadStudentProfile();
      loadClassesDropdown(() => {
        resetToMyClass();
      });
    });

    function loadClassesDropdown(callback) {
      const classes = AppState.getData('lms_classes');
      const select = document.getElementById('subjectClassSelect');
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
      if(callback) callback();
    }

    function resetToMyClass() {
      if (!currentStudent) return;
      document.getElementById('subjectClassSelect').value = currentStudent.class;
      loadSelectedSubjects();
    }

    function loadSelectedSubjects() {
      const className = document.getElementById('subjectClassSelect').value;
      const subjects = AppState.getData('lms_subjects').filter(s => s.class === className);
      const grid = document.getElementById('subjects-grid');
      grid.innerHTML = '';

      if (subjects.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted)">No subjects mapped to this class.</p>';
        return;
      }

      subjects.forEach(s => {
        grid.innerHTML += \`<div class="card" style="border-top: 4px solid var(--primary);">
          <div style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:5px;">CODE: \${s.code}</div>
          <h4 style="margin-bottom:10px;">\${s.name}</h4>
          <p style="font-size:13px; margin: 4px 0;">🏫 Weekly Periods: <b>\${s.periods}</b></p>
          <p style="font-size:13px; margin: 4px 0;">👨‍🏫 Faculty Teacher: <b>\${s.teacher || 'Assigned Faculty'}</b></p>
        </div>\`;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 4. pages/student/study-materials.html
// ==========================================================
writeFile('pages/student/study-materials.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Study Materials - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Lecture Reference Study Materials</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="margin-bottom: 20px;">
          <div>
            <label style="font-weight:600; margin-right:10px;">Select Class to View Reference Materials:</label>
            <select class="form-control" style="display:inline-block; width:280px;" id="materialsClassSelect" onchange="loadSelectedMaterials()"></select>
            <button class="btn btn-outline" style="margin-left: 10px;" onclick="resetToMyClass()">My Class</button>
          </div>
        </div>

        <div class="grid-3" id="materials-grid"></div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}

    window.addEventListener('load', () => {
      loadStudentProfile();
      loadClassesDropdown(() => {
        resetToMyClass();
      });
    });

    function loadClassesDropdown(callback) {
      const classes = AppState.getData('lms_classes');
      const select = document.getElementById('materialsClassSelect');
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
      if(callback) callback();
    }

    function resetToMyClass() {
      if (!currentStudent) return;
      document.getElementById('materialsClassSelect').value = currentStudent.class;
      loadSelectedMaterials();
    }

    function loadSelectedMaterials() {
      const className = document.getElementById('materialsClassSelect').value;
      const materials = AppState.getData('lms_materials').filter(m => m.class === className);
      const grid = document.getElementById('materials-grid');
      grid.innerHTML = '';

      const finalMaterials = materials.length > 0 ? materials : [
        { title: className + ' Term Curriculum Syllabus', type: 'PDF' },
        { title: className + ' Recommended General Reference Books', type: 'DOC' }
      ];

      finalMaterials.forEach(m => {
        grid.innerHTML += \`<div class="card" style="text-align:center;">
          <div style="font-size:36px; margin-bottom:10px;">📚</div>
          <h4>\${m.title}</h4>
          <span class="badge badge-purple" style="margin:8px auto; display:inline-block;">\${m.type}</span>
          <button class="btn btn-outline" style="width:100%; margin-top:10px;" onclick="App.showToast('File downloaded successfully!')">⬇️ Download File</button>
        </div>\`;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 5. pages/student/profile.html
// ==========================================================
writeFile('pages/student/profile.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Profile - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Student Academic Profile</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        ${studentInfoCardHtml}

        <div class="card">
          <h3 class="card-title">Admission & Parent Registry Information</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:14px; line-height:2.0;">
            <div>👤 <b>Full Student Name:</b> <span id="profName"></span></div>
            <div>🔑 <b>Admission ID:</b> <span id="profId"></span></div>
            <div>🏫 <b>Class & Assigned Section:</b> <span id="profClass"></span></div>
            <div>📅 <b>Date of Birth (DOB):</b> <span id="profDOB">--</span></div>
            <div>👪 <b>Parent / Guardian:</b> <span id="profParent"></span></div>
            <div>✉️ <b>Parent Login ID (Username):</b> <span id="profParentUser"></span></div>
            <div>📞 <b>Contact Number:</b> <span id="profPhone"></span></div>
            <div>📝 <b>Cumulative Attendance Rate:</b> <span id="profAtt"></span></div>
            <div>🔑 <b>My Login Password (DOB format):</b> <span id="profPassword"></span></div>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <h3 class="card-title">Upload Profile Photo</h3>
          <div style="display:flex; gap:15px; align-items:center;">
            <input type="file" id="uploadPhotoInput" accept="image/*" class="form-control" style="max-width:300px;">
            <button class="btn btn-primary" onclick="uploadProfilePhoto()">Save Photo</button>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <h3 class="card-title">Change Password</h3>
          <div style="display:flex; gap:15px; align-items:flex-end;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">New Password</label>
              <input type="password" id="newPasswordInput" class="form-control" placeholder="Enter new password" style="max-width:300px;">
            </div>
            <button class="btn btn-primary" onclick="changeStudentPassword()">Update Password</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}
    ${loadStudentInfoCardJs}

    function uploadProfilePhoto() {
      const fileInput = document.getElementById('uploadPhotoInput');
      const file = fileInput.files[0];
      if (!file) return alert('Please select an image file first.');
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64 = e.target.result;
        const students = AppState.getData('lms_students');
        const idx = students.findIndex(s => s.id === currentStudent.id);
        if (idx !== -1) {
          students[idx].photo = base64;
          AppState.saveData('lms_students', students);
          currentStudent.photo = base64;
          loadStudentInfoCard(currentStudent);
          
          const userAv = document.getElementById('userAvatar');
          userAv.innerHTML = \`<img src="\${base64}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">\`;
          userAv.style.background = 'transparent';
          
          App.showToast('Profile photo updated successfully!');
        }
      };
      reader.readAsDataURL(file);
    }

    function changeStudentPassword() {
      const newPassword = document.getElementById('newPasswordInput').value.trim();
      if (!newPassword) return alert('Password cannot be empty.');
      
      const students = AppState.getData('lms_students');
      const idx = students.findIndex(s => s.id === currentStudent.id);
      if (idx !== -1) {
        students[idx].password = newPassword;
        AppState.saveData('lms_students', students);
        
        currentStudent.password = newPassword;
        document.getElementById('profPassword').innerText = newPassword;
        document.getElementById('newPasswordInput').value = '';
        
        App.showToast('Password updated successfully!');
      }
    }

    window.addEventListener('load', () => {
      loadStudentProfile();
      loadStudentInfoCard(currentStudent);

      document.getElementById('profName').innerText = currentStudent.name;
      document.getElementById('profId').innerText = currentStudent.id;
      document.getElementById('profClass').innerText = currentStudent.class + ' (' + currentStudent.section + ')';
      document.getElementById('profDOB').innerText = currentStudent.dob || '12-04-2011';
      document.getElementById('profPhone').innerText = currentStudent.phone;
      document.getElementById('profParent').innerText = currentStudent.parent;
      document.getElementById('profParentUser').innerText = currentStudent.parentUsername || 'None';
      document.getElementById('profAtt').innerText = (currentStudent.attendance || 85) + '%';
      document.getElementById('profPassword').innerText = currentStudent.password || 'stud123';
    });
  </script>
</body>
</html>`);


// ==========================================================
// 6. pages/student/results.html
// ==========================================================
writeFile('pages/student/results.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Examination Results - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Academic Marks & Internals</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <!-- ERP Info Card -->
        ${studentInfoCardHtml}

        <!-- 1. Continuous Internal Assessments (CIA) Table -->
        <div class="card" style="margin-bottom:20px;">
          <h3 class="card-title">Continuous Internal Assessments (CIA) Log</h3>
          <div class="table-responsive">
            <table class="data-table" style="text-align:center;">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Unit Test I (20)</th>
                  <th>Unit Test II (20)</th>
                  <th>Model Exam (40)</th>
                  <th>Assignments (10)</th>
                  <th>Attendance Marks (10)</th>
                  <th>CIA Total Score (100)</th>
                </tr>
              </thead>
              <tbody id="ciaTableBody"></tbody>
            </table>
          </div>
        </div>

        <!-- 2. Term End Examinations Table -->
        <div class="card">
          <h3 class="card-title">Term End Final Examinations Scorecard</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Exam Session</th><th>Subject</th><th>Marks Obtained</th><th>Grade</th><th>Remarks</th></tr>
              </thead>
              <tbody id="resultsTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}
    ${loadStudentInfoCardJs}

    window.addEventListener('load', () => {
      loadStudentProfile();
      loadStudentInfoCard(currentStudent);
      loadCiaMarks();
      loadResults();
    });

    function loadCiaMarks() {
      const cia = AppState.getData('lms_cia').filter(c => c.stuId === currentStudent.id);
      const tbody = document.getElementById('ciaTableBody');
      tbody.innerHTML = '';

      if (cia.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted)">No Continuous Internal Assessment marks pre-populated.</td></tr>';
        return;
      }

      cia.forEach(c => {
        tbody.innerHTML += \`<tr>
          <td style="text-align:left; font-weight:600;">\${c.subject}</td>
          <td>\${c.ut1}</td>
          <td>\${c.ut2}</td>
          <td>\${c.model}</td>
          <td>\${c.assignment}</td>
          <td>\${c.attendance}</td>
          <td><b>\${c.total}</b> / 100</td>
        </tr>\`;
      });
    }

    function loadResults() {
      const results = AppState.getData('lms_results').filter(r => r.stuId === currentStudent.id);
      const body = document.getElementById('resultsTableBody');
      body.innerHTML = '';
      
      if(results.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">No term end grades published yet.</td></tr>';
        return;
      }

      results.forEach(r => {
        body.innerHTML += \`<tr>
          <td><b>\${r.exam}</b></td>
          <td>\${r.subject}</td>
          <td><b>\${r.obtained}</b> / \${r.max}</td>
          <td><span class="badge badge-success">\${r.grade}</span></td>
          <td>\${r.remarks}</td>
        </tr>\`;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 7. pages/student/attendance.html
// ==========================================================
writeFile('pages/student/attendance.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendance Log - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Academic Attendance Ledger</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        ${studentInfoCardHtml}

        <div class="card" style="text-align:center;">
          <h3 class="card-title">Overall Cumulative Attendance Rate</h3>
          <div style="font-size: 64px; font-weight: 800; color: var(--success); margin: 20px 0;" id="attValueText">92%</div>
          <p>Minimum required attendance to sit for final Term End Exams: <b>75%</b></p>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}
    ${loadStudentInfoCardJs}

    window.addEventListener('load', () => {
      loadStudentProfile();
      loadStudentInfoCard(currentStudent);
      document.getElementById('attValueText').innerText = (currentStudent.attendance || 85) + '%';
    });
  </script>
</body>
</html>`);


// ==========================================================
// 8. pages/student/assignments.html
// ==========================================================
writeFile('pages/student/assignments.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignments - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">School Homework & Assignments</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="margin-bottom: 20px;">
          <div>
            <label style="font-weight:600; margin-right:10px;">Select Class Standard to View Tasks:</label>
            <select class="form-control" style="display:inline-block; width:280px;" id="asnClassSelect" onchange="loadSelectedAssignments()"></select>
            <button class="btn btn-outline" style="margin-left: 10px;" onclick="resetToMyClass()">My Class</button>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Pending Homework Assignments</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Title</th><th>Subject</th><th>Due Date</th><th>Max Marks</th><th>Submission</th></tr>
              </thead>
              <tbody id="asnTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}

    window.addEventListener('load', () => {
      loadStudentProfile();
      loadClassesDropdown(() => {
        resetToMyClass();
      });
    });

    function loadClassesDropdown(callback) {
      const classes = AppState.getData('lms_classes');
      const select = document.getElementById('asnClassSelect');
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
      if(callback) callback();
    }

    function resetToMyClass() {
      if (!currentStudent) return;
      document.getElementById('asnClassSelect').value = currentStudent.class;
      loadSelectedAssignments();
    }

    function loadSelectedAssignments() {
      const className = document.getElementById('asnClassSelect').value;
      const asns = AppState.getData('lms_assignments').filter(a => a.class === className);
      const submissions = AppState.getData('lms_submissions') || [];
      const body = document.getElementById('asnTableBody');
      body.innerHTML = '';

      if (asns.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No pending homework assignments found.</td></tr>';
        return;
      }

      asns.forEach(a => {
        const sub = submissions.find(s => s.assignmentId === a.id && s.studentId === currentStudent.id);
        let actionCol = '';
        if (sub) {
          actionCol = \`<span class="badge badge-success" style="font-weight:600;">✔️ Submitted</span><br>
                       <a href="\${sub.fileData}" download="\${sub.fileName}" style="font-size:11px; color:var(--primary); text-decoration:underline;">💾 Download File</a>\`;
        } else {
          actionCol = \`<button class="btn btn-primary" style="padding:4px 8px;" onclick="submitAsn('\${a.id}')">Submit File</button>\`;
        }

        body.innerHTML += \`<tr>
          <td><b>\${a.title}</b></td>
          <td>\${a.subject}</td>
          <td>\${a.due}</td>
          <td>\${a.marks} Marks</td>
          <td>\${actionCol}</td>
        </tr>\`;
      });
    }

    function submitAsn(id) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '*/*';
      fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(readerEvt) {
            const base64 = readerEvt.target.result;
            const submissions = AppState.getData('lms_submissions') || [];
            submissions.push({
              id: 'SUB' + Math.floor(1000 + Math.random()*9000),
              assignmentId: id,
              studentId: currentStudent.id,
              studentName: currentStudent.name,
              fileName: file.name,
              fileData: base64,
              submittedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN')
            });
            AppState.saveData('lms_submissions', submissions);
            App.showToast('Homework file submitted successfully!');
            loadSelectedAssignments();
          };
          reader.readAsDataURL(file);
        }
      };
      fileInput.click();
    }
  </script>
</body>
</html>`);


// ==========================================================
// 9. pages/student/chat.html
// ==========================================================
writeFile('pages/student/chat.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faculty Chat Inbox - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Faculty Chat Inbox</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="display:flex; flex-direction:column; height:450px;">
          <div style="flex:1; padding:20px; overflow-y:auto;" id="chatBody">
            <p style="color:var(--text-muted); text-align:center;">Ask your academic doubts to your Class Teacher!</p>
          </div>
          <div style="padding:15px; display:flex; gap:10px; border-top:1px solid var(--border-color);">
            <input type="text" class="form-control" id="chatMsg" placeholder="Type message to teacher...">
            <button class="btn btn-primary" onclick="sendMsg()">Send</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}

    window.addEventListener('load', () => {
      loadStudentProfile();
      loadChat();
    });

    function loadChat() {
      const chats = AppState.getData('lms_chat');
      const body = document.getElementById('chatBody');
      body.innerHTML = '';
      
      chats.forEach(c => {
        const align = c.from === 'student' ? 'text-align:right;' : 'text-align:left; color:var(--primary);';
        const sender = c.from === 'student' ? 'You' : 'Teacher';
        body.innerHTML += \`<p style="\${align} margin-top:8px;"><b>\${sender}:</b> \${c.text}</p>\`;
      });
      body.scrollTop = body.scrollHeight;
    }

    function sendMsg() {
      const input = document.getElementById('chatMsg');
      const val = input.value.trim();
      if(!val) return;

      const chats = AppState.getData('lms_chat');
      chats.push({ from: 'student', to: 'teacher', text: val });
      AppState.saveData('lms_chat', chats);
      
      input.value = '';
      loadChat();

      setTimeout(() => {
        chats.push({ from: 'teacher', to: 'student', text: 'Thank you for reaching out. I will clarify your doubts tomorrow in class.' });
        AppState.saveData('lms_chat', chats);
        loadChat();
      }, 1000);
    }
  </script>
</body>
</html>`);


// ==========================================================
// 10. pages/student/online-tests.html
// ==========================================================
writeFile('pages/student/online-tests.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Online Assessments - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Online Assessment Player</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" id="testPlayerCard">
          <h3>Mock Quiz: Math General Assignment</h3>
          <p>Total Questions: 3 | Max Marks: 30</p>
          <hr style="margin:15px 0; border:0; border-top:1px solid var(--border-color)">
          <div id="quizBox">
            <h4 style="margin-bottom:15px;">Q1. Solve for x: 5x + 3 = 18</h4>
            <input type="radio" name="q1" value="a"> x = 3<br>
            <input type="radio" name="q1" value="b" style="margin-top:10px;"> x = 4<br>
            <input type="radio" name="q1" value="c" style="margin-top:10px;"> x = 5<br>
            <button class="btn btn-primary" style="margin-top:20px;" onclick="submitMockQuiz()">Submit Quiz</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}

    window.addEventListener('load', () => {
      loadStudentProfile();
    });

    function submitMockQuiz() {
      const q1 = document.querySelector('input[name="q1"]:checked');
      if (!q1) return alert('Please select an option before submitting.');

      const quizBox = document.getElementById('quizBox');
      if (q1.value === 'a') {
        quizBox.innerHTML = \`<div style="text-align:center; padding:20px;">
          <h2 style="color:var(--success)">🎉 Correct Answer! Score: 30/30</h2>
          <p>Great job! Math concept verified.</p>
        </div>\`;
      } else {
        quizBox.innerHTML = \`<div style="text-align:center; padding:20px;">
          <h2 style="color:var(--danger)">❌ Incorrect! Score: 0/30</h2>
          <p>Correct answer is: x = 3</p>
        </div>\`;
      }
    }
  </script>
</body>
</html>`);


// ==========================================================
// 11. pages/student/report-card.html
// ==========================================================
writeFile('pages/student/report-card.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Progress Report Card - Amala HSS eVarsity</title>
  <style>
    body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.5; background-color:#F8FAFC; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: bold; margin:0; }
    .subtitle { font-size: 14px; margin-top:5px; text-transform:uppercase; color:#64748B; }
    .stu-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; font-size: 14px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color:#FFF; }
    .data-table th, .data-table td { border: 1px solid #CBD5E1; padding: 10px; text-align: left; }
    .data-table th { background-color: #F1F5F9; }
    .summary { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 15px; }
    .print-btn { background-color: #4F46E5; color: #FFF; border: none; padding: 10px 20px; font-size: 14px; border-radius: 4px; cursor: pointer; display: inline-block; margin-bottom: 20px; text-decoration: none; }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; background-color:#FFF; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto;">
    <a href="dashboard.html" class="print-btn">⬅️ Back to Portal</a>
    <button onclick="window.print()" class="print-btn" style="float: right;">🖨️ Print Report Card</button>

    <div class="header">
      <div class="title">AMALA HIGHER SECONDARY SCHOOL</div>
      <div class="subtitle">eVarsity® Academic Progress Report Card</div>
    </div>

    <div class="stu-details">
      <div>👤 <b>Student Name:</b> <span id="stuName">--</span></div>
      <div>🔑 <b>Admission ID:</b> <span id="stuId">--</span></div>
      <div>🏫 <b>Class & Section:</b> <span id="stuClass">--</span></div>
      <div>📅 <b>Academic Session:</b> 2026 - 2027</div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Subject Name</th>
          <th>Max Marks</th>
          <th>Marks Obtained</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody id="reportCardTable"></tbody>
    </table>

    <div class="summary">
      <div>Overall Term Percentage: <span id="avgPercentage">--</span></div>
      <div>Class Teacher Status: PASS</div>
    </div>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    window.addEventListener('load', () => {
      const stuId = localStorage.getItem('userId') || 'STU001';
      const students = AppState.getData('lms_students');
      const currentS = students.find(s => s.id === stuId) || students[0];

      document.getElementById('stuName').innerText = currentS.name;
      document.getElementById('stuId').innerText = currentS.id;
      document.getElementById('stuClass').innerText = currentS.class + ' (' + currentS.section + ')';
      
      const results = AppState.getData('lms_results').filter(r => r.stuId === currentS.id);
      const table = document.getElementById('reportCardTable');
      table.innerHTML = '';
      
      if (results.length === 0) {
        table.innerHTML = '<tr><td colspan="4" style="text-align:center;">No results published yet.</td></tr>';
        return;
      }

      let totalMax = 0;
      let totalObtained = 0;
      results.forEach(r => {
        totalMax += r.max;
        totalObtained += r.obtained;
        table.innerHTML += \`<tr>
          <td><b>\${r.subject}</b></td>
          <td>\${r.max}</td>
          <td>\${r.obtained}</td>
          <td><b>\${r.grade}</b></td>
        </tr>\`;
      });

      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
      document.getElementById('avgPercentage').innerText = percentage + '%';
    });
  </script>
</body>
</html>`);


// ==========================================================
// 12. pages/student/ai-assistant.html
// ==========================================================
writeFile('pages/student/ai-assistant.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Study Partner - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #6366F1;
      --primary-dark: #4F46E5;
      --primary-light: #EEF2FF;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${studentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">AI Study Partner</h1>
        </div>
        <div class="header-right">${studentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="display:flex; flex-direction:column; height:500px;">
          <div style="padding:15px; border-bottom:1px solid var(--border-color)">
            <p><b>StudyBot:</b> I can help you solve math equations, explain biology concepts or grammar rules.</p>
          </div>
          <div style="flex:1; padding:20px; overflow-y:auto; background-color:var(--gray-100);" id="studentChatPanel">
            <p><b>StudyBot:</b> Select a suggested question or write yours below!</p>
            <div style="display:flex; gap:10px; margin-top:15px;">
              <button class="btn btn-outline" style="font-size:12px; padding:6px;" onclick="askAssistant('Explain photosynthesis')">Explain Photosynthesis 🌿</button>
              <button class="btn btn-outline" style="font-size:12px; padding:6px;" onclick="askAssistant('Solve equation 3x-7=14')">Solve equation 3x-7=14 📐</button>
            </div>
          </div>
          <div style="padding:15px; display:flex; gap:10px; border-top:1px solid var(--border-color);">
            <input type="text" class="form-control" id="studentChatMsg" placeholder="Ask Claude study engine...">
            <button class="btn btn-primary" onclick="sendStudentAiMsg()">Ask</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initStudentProfileJs}

    window.addEventListener('load', () => {
      loadStudentProfile();
    });

    function askAssistant(prompt) {
      document.getElementById('studentChatMsg').value = prompt;
      sendStudentAiMsg();
    }

    function sendStudentAiMsg() {
      const input = document.getElementById('studentChatMsg');
      const val = input.value.trim();
      if(!val) return;
      
      const panel = document.getElementById('studentChatPanel');
      panel.innerHTML += \`<p style="text-align:right; margin-top:10px;"><b>You:</b> \${val}</p>\`;
      input.value = '';
      
      panel.innerHTML += \`<p style="color:var(--primary); margin-top:10px;"><b>StudyBot:</b> Analyzing doubt. Reading curriculum guides...</p>\`;
      
      setTimeout(() => {
        panel.innerHTML += \`<p style="color:var(--primary); margin-top:5px;"><b>StudyBot:</b> Here is the step-by-step resolution: Photosynthesis is the chemical process by which plants convert sunlight, carbon dioxide, and water into oxygen and glucose. The key component is Chlorophyll. Formula: 6CO2 + 6H2O -> C6H12O6 + 6O2.</p>\`;
        panel.scrollTop = panel.scrollHeight;
      }, 1000);
    }
  </script>
</body>
</html>`);


// ==========================================================
// 13. pages/parent/dashboard.html
// ==========================================================
writeFile('pages/parent/dashboard.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parent Ward Console - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Parent Ward Console</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <!-- ERP Student Info Card -->
        ${studentInfoCardHtml}

        <div class="stats-grid">
          <div class="stat-card" style="border-left-color: var(--success)">
            <div class="stat-info">
              <h3>Attendance Log</h3>
              <div class="stat-value" id="attValue">--</div>
            </div>
          </div>
          <div class="stat-card" style="border-left-color: var(--primary)">
            <div class="stat-info">
              <h3>Term Performance</h3>
              <div class="stat-value" id="grade-val">A+ (92%)</div>
            </div>
          </div>
          <div class="stat-card" style="border-left-color: var(--danger)">
            <div class="stat-info">
              <h3>Pending Fees Due</h3>
              <div class="stat-value" id="fee-val">₹0</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <h3 class="card-title">Ward's Homework Tasks</h3>
            <div id="parent-hw-box"></div>
          </div>
          <div class="card">
            <h3 class="card-title">School Announcements</h3>
            <ul style="list-style:none;" id="parent-notices"></ul>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}
    ${loadStudentInfoCardJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      loadStudentInfoCard(currentChild);
      
      document.getElementById('attValue').innerText = (currentChild.attendance || 85) + '%';
      
      // Calculate average mark
      const results = AppState.getData('lms_results').filter(r => r.stuId === currentChild.id);
      if (results.length > 0) {
        let totalMax = 0, totalObtained = 0;
        results.forEach(r => { totalMax += r.max; totalObtained += r.obtained; });
        const pct = ((totalObtained / totalMax) * 100).toFixed(0);
        document.getElementById('grade-val').innerText = pct + '%';
      } else {
        document.getElementById('grade-val').innerText = 'N/A';
      }

      // Fees Box
      let balance = 0;
      if (currentChild.fee === 'Unpaid') balance = 25000;
      if (currentChild.fee === 'Partial') balance = 12500;
      document.getElementById('fee-val').innerText = '₹' + balance.toLocaleString();

      // Notices
      const notices = AppState.getData('lms_notices');
      const nBox = document.getElementById('parent-notices');
      nBox.innerHTML = '';
      notices.slice(0, 4).forEach(n => {
        nBox.innerHTML += \`<li style="padding:8px 0; border-bottom:1px solid var(--border-color)">📢 \${n.msg} <small style="color:var(--text-muted); float:right;">\${n.time}</small></li>\`;
      });

      // Homework
      const asns = AppState.getData('lms_assignments').filter(a => a.class === currentChild.class);
      const hwBox = document.getElementById('parent-hw-box');
      hwBox.innerHTML = '';
      if (asns.length === 0) {
        hwBox.innerHTML = '<p style="color:var(--text-muted)">No homework assignments due.</p>';
      } else {
        asns.forEach(a => {
          hwBox.innerHTML += \`<div class="card" style="border-left:4px solid var(--primary); padding:12px; margin-bottom:10px;">
            <h4>\${a.title}</h4>
            <p>Subject: \${a.subject} | Due: \${a.due}</p>
          </div>\`;
        });
      }
    });
  </script>
</body>
</html>`);


// ==========================================================
// 14. pages/parent/attendance.html
// ==========================================================
writeFile('pages/parent/attendance.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ward Attendance - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Ward Attendance Ledger</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        ${studentInfoCardHtml}

        <div class="card" style="text-align:center; margin-bottom:20px;">
          <h3 class="card-title">Overall Cumulative Attendance Rate</h3>
          <div style="font-size: 64px; font-weight: 800; color: var(--primary); margin: 20px 0;" id="attValueText">--</div>
          <p>Adherence Status: <b style="color:var(--success)">Good Standing</b></p>
        </div>

        <div class="card">
          <h3 class="card-title" style="margin-bottom:15px;">Recent Attendance Sessions</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Date</th><th>Session Period</th><th>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                <tr><td>15 Jun 2026</td><td>Morning & Afternoon</td><td><span class="badge badge-success">Present</span></td><td>Regular Attendant</td></tr>
                <tr><td>14 Jun 2026</td><td>Morning & Afternoon</td><td><span class="badge badge-success">Present</span></td><td>Regular Attendant</td></tr>
                <tr><td>13 Jun 2026</td><td>Morning & Afternoon</td><td><span class="badge badge-success">Present</span></td><td>Regular Attendant</td></tr>
                <tr><td>12 Jun 2026</td><td>Morning & Afternoon</td><td><span class="badge badge-success">Present</span></td><td>Regular Attendant</td></tr>
                <tr><td>11 Jun 2026</td><td>Morning & Afternoon</td><td><span class="badge badge-success">Present</span></td><td>Regular Attendant</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}
    ${loadStudentInfoCardJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      loadStudentInfoCard(currentChild);
      document.getElementById('attValueText').innerText = (currentChild.attendance || 85) + '%';
    });
  </script>
</body>
</html>`);


// ==========================================================
// 15. pages/parent/results.html
// ==========================================================
writeFile('pages/parent/results.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ward Results - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Ward Examination & Internals</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        ${studentInfoCardHtml}

        <!-- 1. Continuous Internal Assessments (CIA) Table -->
        <div class="card" style="margin-bottom:20px;">
          <h3 class="card-title">Continuous Internal Assessment (CIA) Marks</h3>
          <div class="table-responsive">
            <table class="data-table" style="text-align:center;">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Unit Test I (20)</th>
                  <th>Unit Test II (20)</th>
                  <th>Model Exam (40)</th>
                  <th>Assignments (10)</th>
                  <th>Attendance Marks (10)</th>
                  <th>CIA Total Score (100)</th>
                </tr>
              </thead>
              <tbody id="ciaTableBody"></tbody>
            </table>
          </div>
        </div>

        <!-- 2. Term End Examinations Table -->
        <div class="card">
          <h3 class="card-title">Term End Final Examination Scores</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Exam Session</th><th>Subject</th><th>Marks Obtained</th><th>Grade</th><th>Remarks</th></tr>
              </thead>
              <tbody id="parentResultsBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}
    ${loadStudentInfoCardJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      loadStudentInfoCard(currentChild);
      loadCiaMarks();
      loadResults();
    });

    function loadCiaMarks() {
      const cia = AppState.getData('lms_cia').filter(c => c.stuId === currentChild.id);
      const tbody = document.getElementById('ciaTableBody');
      tbody.innerHTML = '';

      if (cia.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted)">No Continuous Internal Assessment marks found.</td></tr>';
        return;
      }

      cia.forEach(c => {
        tbody.innerHTML += \`<tr>
          <td style="text-align:left; font-weight:600;">\${c.subject}</td>
          <td>\${c.ut1}</td>
          <td>\${c.ut2}</td>
          <td>\${c.model}</td>
          <td>\${c.assignment}</td>
          <td>\${c.attendance}</td>
          <td><b>\${c.total}</b> / 100</td>
        </tr>\`;
      });
    }

    function loadResults() {
      const results = AppState.getData('lms_results').filter(r => r.stuId === currentChild.id);
      const body = document.getElementById('parentResultsBody');
      body.innerHTML = '';
      
      if(results.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">No examination results published yet.</td></tr>';
        return;
      }

      results.forEach(r => {
        body.innerHTML += \`<tr>
          <td><b>\${r.exam}</b></td>
          <td>\${r.subject}</td>
          <td><b>\${r.obtained}</b> / \${r.max}</td>
          <td><span class="badge badge-primary">\${r.grade}</span></td>
          <td>\${r.remarks}</td>
        </tr>\`;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 16. pages/parent/homework.html
// ==========================================================
writeFile('pages/parent/homework.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ward Homework Tracker - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Ward Homework Tracker</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="margin-bottom: 20px;">
          <div>
            <label style="font-weight:600; margin-right:10px;">Select Class Standard to View Homework:</label>
            <select class="form-control" style="display:inline-block; width:280px;" id="hwClassSelect" onchange="loadSelectedHomework()"></select>
            <button class="btn btn-outline" style="margin-left: 10px;" onclick="resetToMyChildClass()">Ward's Class</button>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Assigned School Homework Tasks</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Subject</th><th>Assignment Title</th><th>Due Date</th><th>Submission Status</th></tr>
              </thead>
              <tbody id="parentHwBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      loadClassesDropdown(() => {
        resetToMyChildClass();
      });
    });

    function loadClassesDropdown(callback) {
      const classes = AppState.getData('lms_classes');
      const select = document.getElementById('hwClassSelect');
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
      if(callback) callback();
    }

    function resetToMyChildClass() {
      if (!currentChild) return;
      document.getElementById('hwClassSelect').value = currentChild.class;
      loadSelectedHomework();
    }

    function loadSelectedHomework() {
      const className = document.getElementById('hwClassSelect').value;
      const asns = AppState.getData('lms_assignments').filter(a => a.class === className);
      const body = document.getElementById('parentHwBody');
      body.innerHTML = '';

      if (asns.length === 0) {
        body.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No homework assigned for this class!</td></tr>';
        return;
      }

      asns.forEach(a => {
        const statusHtml = className === currentChild.class 
          ? '<span class="badge badge-warning">Pending</span>'
          : '<span class="badge badge-purple">Not Assigned to Ward</span>';

        body.innerHTML += \`<tr>
          <td><b>\${a.subject}</b></td>
          <td>\${a.title}</td>
          <td>\${a.due}</td>
          <td>\${statusHtml}</td>
        </tr>\`;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 17. pages/parent/fees.html
// ==========================================================
writeFile('pages/parent/fees.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fee Accounts - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal-overlay.open { display: flex; }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">School ERP Fee Ledger</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        ${studentInfoCardHtml}

        <div class="card" style="margin-bottom:20px;">
          <h3 class="card-title">Fee Outstanding Details</h3>
          <hr style="margin:15px 0; border:0; border-top:1px solid var(--border-color)">
          
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; text-align:center;">
            <div class="card" style="background-color: var(--primary-light);">
              <h4 style="color:var(--primary-dark)">Total School Fee</h4>
              <h2 style="margin-top:10px; color:var(--primary-dark)">₹25,000</h2>
            </div>
            <div class="card" style="background-color: var(--gray-100);">
              <h4>Paid Amount</h4>
              <h2 style="margin-top:10px;" id="paidAmtText">₹0</h2>
            </div>
            <div class="card" style="background-color: var(--danger-light);">
              <h4 style="color:var(--danger)">Balance Outstanding</h4>
              <h2 style="margin-top:10px; color:var(--danger)" id="balanceAmtText">₹0</h2>
            </div>
          </div>
          
          <div style="margin-top:20px; text-align:right;" id="payBtnContainer">
            <button class="btn btn-primary" onclick="openPaymentModal()">💳 Pay Outstanding Fees</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Mock Payment Modal -->
  <div class="modal-overlay" id="payModal">
    <div class="card" style="width:400px;">
      <h3 style="margin-bottom:15px;">🔒 Gateway: Mock payment</h3>
      <p style="margin-bottom:15px;">Paying school fees amount: <b id="payModalAmt">--</b></p>
      
      <div class="form-group">
        <label>Select Payment Mode</label>
        <select class="form-control">
          <option>Net Banking / UPI</option>
          <option>Credit / Debit Card</option>
        </select>
      </div>
      <div class="form-group" style="margin-top:10px;">
        <label>Payment PIN (Mock)</label>
        <input type="password" class="form-control" placeholder="••••" value="1234">
      </div>
      
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button class="btn btn-outline" onclick="closePaymentModal()">Cancel</button>
        <button class="btn btn-primary" onclick="processPayment()">Confirm & Pay</button>
      </div>
    </div>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}
    ${loadStudentInfoCardJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      loadStudentInfoCard(currentChild);
      renderFeeDetails();
    });

    function renderFeeDetails() {
      let balance = 0;
      let paid = 25000;
      if (currentChild.fee === 'Unpaid') { balance = 25000; paid = 0; }
      if (currentChild.fee === 'Partial') { balance = 12500; paid = 12500; }

      document.getElementById('paidAmtText').innerText = '₹' + paid.toLocaleString();
      document.getElementById('balanceAmtText').innerText = '₹' + balance.toLocaleString();

      const btnContainer = document.getElementById('payBtnContainer');
      if (balance === 0) {
        btnContainer.innerHTML = '<b style="color:var(--success)">✔️ School Fee Ledger Balance Cleared.</b>';
      } else {
        btnContainer.innerHTML = '<button class="btn btn-primary" onclick="openPaymentModal()">💳 Pay Outstanding Fees</button>';
      }
    }

    function openPaymentModal() {
      let balance = 25000;
      if (currentChild.fee === 'Partial') balance = 12500;
      document.getElementById('payModalAmt').innerText = '₹' + balance.toLocaleString();
      document.getElementById('payModal').classList.add('open');
    }

    function closePaymentModal() {
      document.getElementById('payModal').classList.remove('open');
    }

    function processPayment() {
      const students = AppState.getData('lms_students');
      const idx = students.findIndex(s => s.id === currentChild.id);
      if (idx !== -1) {
        students[idx].fee = 'Paid';
        AppState.saveData('lms_students', students);
        currentChild.fee = 'Paid';
      }
      
      closePaymentModal();
      App.showToast('School fees payment completed successfully!');
      renderFeeDetails();
    }
  </script>
</body>
</html>`);


// ==========================================================
// 18. pages/parent/timetable.html
// ==========================================================
writeFile('pages/parent/timetable.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Class Timetable - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Class Timetable Schedule</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="margin-bottom: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <label style="font-weight:600; margin-right:10px;">Select Class Standard to View Schedule:</label>
              <select class="form-control" style="display:inline-block; width:260px;" id="ttClassSelect" onchange="loadSelectedTimetable()"></select>
              <select class="form-control" style="display:inline-block; width:90px;" id="ttSectionSelect" onchange="loadSelectedTimetable()">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>
            <div>
              <button class="btn btn-outline" onclick="resetToMyChildClass()">Ward's Class</button>
              <button class="btn btn-primary" onclick="window.print()">🖨️ Print timetable</button>
            </div>
          </div>
        </div>

        <div class="card">
          <table class="data-table" style="text-align:center;">
            <thead>
              <tr>
                <th>Time Period</th>
                <th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th>
              </tr>
            </thead>
            <tbody id="timetableBody"></tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}

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
      loadParentProfile();
      loadClassesDropdown(() => {
        resetToMyChildClass();
      });
    });

    function loadClassesDropdown(callback) {
      const classes = AppState.getData('lms_classes');
      const select = document.getElementById('ttClassSelect');
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
      if(callback) callback();
    }

    function resetToMyChildClass() {
      if (!currentChild) return;
      document.getElementById('ttClassSelect').value = currentChild.class;
      document.getElementById('ttSectionSelect').value = currentChild.section;
      loadSelectedTimetable();
    }

    function loadSelectedTimetable() {
      const className = document.getElementById('ttClassSelect').value;
      const section = document.getElementById('ttSectionSelect').value;
      const key = 'tt_' + className.replace(/ /g, '_') + '_' + section;
      const tt = AppState.getData(key) || {};
      
      const tbody = document.getElementById('timetableBody');
      tbody.innerHTML = '';

      timeSlots.forEach((slot, pIdx) => {
        let rowHtml = \`<tr><td><b>Period \${pIdx + 1}<br><small style="font-weight:normal; opacity:0.8;">\${slot}</small></b></td>\`;
        days.forEach((day, dIdx) => {
          const item = tt[\`\${pIdx}_\${dIdx}\`] || { sub: '--', tch: '--' };
          
          let cellStyle = '';
          if (item.sub !== '--') {
            cellStyle = 'background-color: var(--primary-light); color: var(--primary-dark); font-weight:600;';
          }

          rowHtml += \`<td style="\${cellStyle}">
            <div>\${item.sub}</div>
            <div style="font-size:10px; font-weight:normal; opacity:0.8;">\${item.tch}</div>
          </td>\`;
        });
        rowHtml += \`</tr>\`;
        tbody.innerHTML += rowHtml;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 19. pages/parent/subjects.html
// ==========================================================
writeFile('pages/parent/subjects.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Curriculum Subjects - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Curriculum Subjects</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="margin-bottom: 20px;">
          <div>
            <label style="font-weight:600; margin-right:10px;">View Subjects for Class Standard:</label>
            <select class="form-control" style="display:inline-block; width:280px;" id="subjectClassSelect" onchange="loadSelectedSubjects()"></select>
            <button class="btn btn-outline" style="margin-left: 10px;" onclick="resetToMyChildClass()">Ward's Class</button>
          </div>
        </div>

        <div class="grid-3" id="subjects-grid"></div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      loadClassesDropdown(() => {
        resetToMyChildClass();
      });
    });

    function loadClassesDropdown(callback) {
      const classes = AppState.getData('lms_classes');
      const select = document.getElementById('subjectClassSelect');
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
      if(callback) callback();
    }

    function resetToMyChildClass() {
      if (!currentChild) return;
      document.getElementById('subjectClassSelect').value = currentChild.class;
      loadSelectedSubjects();
    }

    function loadSelectedSubjects() {
      const className = document.getElementById('subjectClassSelect').value;
      const subjects = AppState.getData('lms_subjects').filter(s => s.class === className);
      const grid = document.getElementById('subjects-grid');
      grid.innerHTML = '';

      if (subjects.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted)">No subjects mapped to this class.</p>';
        return;
      }

      subjects.forEach(s => {
        grid.innerHTML += \`<div class="card" style="border-top: 4px solid var(--primary);">
          <div style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:5px;">CODE: \${s.code}</div>
          <h4 style="margin-bottom:10px;">\${s.name}</h4>
          <p style="font-size:13px; margin: 4px 0;">🏫 Weekly Periods: <b>\${s.periods}</b></p>
          <p style="font-size:13px; margin: 4px 0;">👨‍🏫 Faculty Teacher: <b>\${s.teacher || 'Assigned Faculty'}</b></p>
        </div>\`;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 20. pages/parent/study-materials.html
// ==========================================================
writeFile('pages/parent/study-materials.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Study Materials - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Lecture Reference Study Materials</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="margin-bottom: 20px;">
          <div>
            <label style="font-weight:600; margin-right:10px;">Select Class to View Reference Materials:</label>
            <select class="form-control" style="display:inline-block; width:280px;" id="materialsClassSelect" onchange="loadSelectedMaterials()"></select>
            <button class="btn btn-outline" style="margin-left: 10px;" onclick="resetToMyChildClass()">Ward's Class</button>
          </div>
        </div>

        <div class="grid-3" id="materials-grid"></div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      loadClassesDropdown(() => {
        resetToMyChildClass();
      });
    });

    function loadClassesDropdown(callback) {
      const classes = AppState.getData('lms_classes');
      const select = document.getElementById('materialsClassSelect');
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
      if(callback) callback();
    }

    function resetToMyChildClass() {
      if (!currentChild) return;
      document.getElementById('materialsClassSelect').value = currentChild.class;
      loadSelectedMaterials();
    }

    function loadSelectedMaterials() {
      const className = document.getElementById('materialsClassSelect').value;
      const materials = AppState.getData('lms_materials').filter(m => m.class === className);
      const grid = document.getElementById('materials-grid');
      grid.innerHTML = '';

      const finalMaterials = materials.length > 0 ? materials : [
        { title: className + ' Term Curriculum Syllabus', type: 'PDF' },
        { title: className + ' Recommended General Reference Books', type: 'DOC' }
      ];

      finalMaterials.forEach(m => {
        grid.innerHTML += \`<div class="card" style="text-align:center;">
          <div style="font-size:36px; margin-bottom:10px;">📚</div>
          <h4>\${m.title}</h4>
          <span class="badge badge-purple" style="margin:8px auto; display:inline-block;">\${m.type}</span>
          <button class="btn btn-outline" style="width:100%; margin-top:10px;" onclick="App.showToast('File downloaded successfully!')">⬇️ Download File</button>
        </div>\`;
      });
    }
  </script>
</body>
</html>`);


// ==========================================================
// 21. pages/parent/messages.html
// ==========================================================
writeFile('pages/parent/messages.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faculty Chat - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Class Teacher Inbox</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        <div class="card" style="display:flex; flex-direction:column; height:450px;">
          <div style="padding:15px; border-bottom:1px solid var(--border-color)">
            <h4 id="teacherChatName">Chatting with Class Teacher</h4>
          </div>
          <div style="flex:1; padding:20px; overflow-y:auto;" id="parentChatBody">
            <p style="color:var(--text-muted); text-align:center;">Ask your queries directly to your child's Class Teacher!</p>
          </div>
          <div style="padding:15px; display:flex; gap:10px; border-top:1px solid var(--border-color);">
            <input type="text" class="form-control" id="parentChatMsg" placeholder="Type message to teacher...">
            <button class="btn btn-primary" onclick="sendParentMsg()">Send</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      
      const classes = AppState.getData('lms_classes');
      const cls = classes.find(c => c.name === currentChild.class);
      if (cls) {
        document.getElementById('teacherChatName').innerText = 'Chatting with Class Teacher: Mr/Mrs. ' + cls.teacherName;
      }

      loadChat();
    });

    function loadChat() {
      const chats = AppState.getData('lms_chat_parent') || [];
      const body = document.getElementById('parentChatBody');
      body.innerHTML = '';
      
      chats.forEach(c => {
        const align = c.from === 'parent' ? 'text-align:right;' : 'text-align:left; color:var(--primary);';
        const sender = c.from === 'parent' ? 'You' : 'Teacher';
        body.innerHTML += \`<p style="\${align} margin-top:8px;"><b>\${sender}:</b> \${c.text}</p>\`;
      });
      body.scrollTop = body.scrollHeight;
    }

    function sendParentMsg() {
      const input = document.getElementById('parentChatMsg');
      const val = input.value.trim();
      if(!val) return;

      const chats = AppState.getData('lms_chat_parent') || [];
      chats.push({ from: 'parent', to: 'teacher', text: val });
      AppState.saveData('lms_chat_parent', chats);
      
      input.value = '';
      loadChat();

      setTimeout(() => {
        chats.push({ from: 'teacher', to: 'parent', text: "Thank you for writing. I will look into your child's progress and respond shortly." });
        AppState.saveData('lms_chat_parent', chats);
        loadChat();
      }, 1000);
    }
  </script>
</body>
</html>`);


// ==========================================================
// 22. pages/parent/profile.html
// ==========================================================
writeFile('pages/parent/profile.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parent Profile - eVarsity® School ERP</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: #0D9488;
      --primary-dark: #0F766E;
      --primary-light: #F0FDFA;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">${parentSidebarHtml}</aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Parent Profile Console</h1>
        </div>
        <div class="header-right">${parentHeaderRightHtml}</div>
      </header>

      <div class="content-area">
        ${studentInfoCardHtml}

        <div class="card" style="margin-bottom: 20px;">
          <h3 class="card-title">Parent Account details</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:14px; line-height:2.0;">
            <div>👤 <b>Parent Name:</b> <span id="parName">--</span></div>
            <div>🔑 <b>Parent ID / Username:</b> <span id="parUser">--</span></div>
            <div>✉️ <b>Registered Email:</b> <span id="parEmail">--</span></div>
            <div>📞 <b>Contact Number:</b> <span id="parPhone">--</span></div>
            <div>🔑 <b>Login Password:</b> <span id="parPassword">--</span></div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Associated Ward Information</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:14px; line-height:2.0;">
            <div>👤 <b>Student Name:</b> <span id="childName">--</span></div>
            <div>🔑 <b>Admission ID:</b> <span id="childID">--</span></div>
            <div>🏫 <b>Class Standard & Section:</b> <span id="childClass">--</span></div>
            <div>📅 <b>Date of Birth (DOB):</b> <span id="childDOB">--</span></div>
            <div>📝 <b>Cumulative Attendance Rate:</b> <span id="childAtt">--</span></div>
            <div>💳 <b>Ledger Fee Status:</b> <span id="childFee">--</span></div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    ${initParentProfileJs}
    ${loadStudentInfoCardJs}

    window.addEventListener('load', () => {
      loadParentProfile();
      loadStudentInfoCard(currentChild);

      document.getElementById('parName').innerText = currentChild.parent;
      document.getElementById('parUser').innerText = currentChild.parentUsername;
      document.getElementById('parEmail').innerText = currentChild.parentEmail || 'None';
      document.getElementById('parPhone').innerText = currentChild.phone;
      document.getElementById('parPassword').innerText = currentChild.parentPassword || 'par123';

      document.getElementById('childName').innerText = currentChild.name;
      document.getElementById('childID').innerText = currentChild.id;
      document.getElementById('childClass').innerText = currentChild.class + ' (' + currentChild.section + ')';
      document.getElementById('childDOB').innerText = currentChild.dob || '12-04-2011';
      document.getElementById('childAtt').innerText = (currentChild.attendance || 85) + '%';
      document.getElementById('childFee').innerText = currentChild.fee;
    });
  </script>
</body>
</html>`);

console.log('--- ALL SCHOOL EVARSITY ERP PORTAL PAGES REWRITTEN SUCCESSFULLY ---');
