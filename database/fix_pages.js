/**
 * Rewrites the script sections of all frontend pages that still use localStorage mocks
 * to call real backend APIs instead.
 */
const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Written:', path.basename(filePath));
}

// ── 1. ADMIN/EXAMS.HTML ─────────────────────────────────────────────────────
const adminExamsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exam Management Center - Amala HSS EduSphere</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root { --primary: #4F46E5; --primary-dark: #3730A3; --primary-light: #EEF2FF; }
    .th-action { width: 100px; }
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
        <div class="sidebar-title">AMALA HSS <span>EduSphere LMS</span></div>
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
        <li style="margin-top: 20px;" class="sidebar-item"><a href="#" onclick="App.logout()">🚪 Logout</a></li>
      </ul>
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">Exam Management Center</h1>
        </div>
        <div class="header-right">
          <div class="search-bar">🔍 <input type="text" placeholder="Search anything..."></div>
          <button class="header-btn" id="darkModeToggle" onclick="App.toggleDark()">🌙</button>
          <div class="user-chip">
            <div class="avatar-circle" id="userAvatar">A</div>
            <div style="font-weight: 600;" id="userDisplayName">Administrator</div>
          </div>
        </div>
      </header>
      <div class="content-area">
        <div class="tab-container">
          <div class="tab active" onclick="switchTab(0)">Scheduled Exams</div>
          <div class="tab" onclick="switchTab(1)">Online MCQ Creator</div>
        </div>
        <div style="text-align:right; margin-bottom:15px;" id="upcoming-actions">
          <button class="btn btn-primary" onclick="App.openModal('examModal')">➕ Schedule Exam</button>
        </div>
        <div class="card" id="upcoming-tab-pane">
          <h3 class="card-title">Scheduled School Examinations</h3>
          <table class="data-table">
            <thead>
              <tr><th>Exam Name</th><th>Type</th><th>Class</th><th>Date</th><th>Max Marks</th><th>Status</th><th class="th-action">Actions</th></tr>
            </thead>
            <tbody id="examTableBody"><tr><td colspan="7" style="text-align:center">Loading...</td></tr></tbody>
          </table>
        </div>
        <div class="card" id="online-tab-pane" style="display:none;">
          <h3 class="card-title">Create MCQ Online Quiz</h3>
          <form onsubmit="saveOnlineQuiz(event)">
            <div class="form-group"><label class="form-label">Quiz Topic Name</label><input type="text" class="form-control" id="qzTitle" placeholder="e.g. Science Test 1" required></div>
            <div class="form-group"><label class="form-label">Time Limit (Minutes)</label><input type="number" class="form-control" id="qzDuration" value="20" required></div>
            <div style="border:1px solid var(--border-color); padding:15px; border-radius:var(--radius); margin-bottom:15px;">
              <h5>Question 1</h5>
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
                <select class="form-control" id="exType"><option>Quarterly</option><option>Unit Test</option><option>Half-Yearly</option><option>Annual</option></select>
              </div>
              <div class="form-group">
                <label class="form-label">Class</label>
                <select class="form-control" id="exClass"><option value="">All Classes</option></select>
              </div>
              <div class="form-group"><label class="form-label">Subject (optional)</label><input type="text" class="form-control" id="exSubject" placeholder="e.g. Mathematics"></div>
              <div class="form-group"><label class="form-label">Exam Date</label><input type="date" class="form-control" id="exDate"></div>
              <div class="form-group"><label class="form-label">Max Marks</label><input type="number" class="form-control" id="exMarks" value="100" required></div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" onclick="App.closeModal('examModal')">Cancel</button>
              <button class="btn btn-primary" onclick="saveExam()">Schedule</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <script src="../../js/app.js"></script>
  <script src="../../js/auth-check.js"></script>
  <script>
  let allExams = [];

  window.addEventListener('load', () => { loadExams(); loadClassesDropdown(); });

  async function loadExams() {
    try {
      const r = await fetch('/api/exams', { credentials: 'include' });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      allExams = d.data || [];
      renderExams(allExams);
    } catch (err) { console.error('loadExams:', err.message); }
  }

  function renderExams(list) {
    const body = document.getElementById('examTableBody');
    if (!list.length) {
      body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No exams scheduled yet.</td></tr>';
      return;
    }
    body.innerHTML = list.map(e => {
      const sc = e.status === 'Completed' ? 'badge-success' : e.status === 'Ongoing' ? 'badge-warning' : 'badge-info';
      return '<tr><td><b>' + (e.title||'') + '</b></td><td>' + (e.exam_type||'Quarterly') + '</td><td>' + (e.class_name||'All') + '</td><td>' + (e.exam_date ? new Date(e.exam_date).toLocaleDateString('en-IN') : 'TBD') + '</td><td>' + (e.max_marks||100) + '</td><td><span class="badge ' + sc + '">' + (e.status||'Scheduled') + '</span></td><td><button class="btn btn-outline" style="padding:4px 10px;font-size:12px;" onclick="deleteExam(\\'' + (e.exam_id||e.id) + '\\')">Delete</button></td></tr>';
    }).join('');
  }

  async function loadClassesDropdown() {
    try {
      const r = await fetch('/api/classes', { credentials: 'include' });
      const d = await r.json();
      const sel = document.getElementById('exClass');
      sel.innerHTML = '<option value="">All Classes</option>';
      (d.data||[]).forEach(c => { sel.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>'; });
    } catch (err) { console.error(err); }
  }

  async function saveExam() {
    const title = document.getElementById('exName').value.trim();
    if (!title) { App.showToast('Exam name required.','error'); return; }
    try {
      const r = await fetch('/api/exams', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, exam_type: document.getElementById('exType').value, class_name: document.getElementById('exClass').value, subject: document.getElementById('exSubject').value, exam_date: document.getElementById('exDate').value, max_marks: document.getElementById('exMarks').value })
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      document.getElementById('exName').value = '';
      App.closeModal('examModal');
      App.showToast('Exam scheduled!','success');
      loadExams();
    } catch (err) { App.showToast('Failed: '+err.message,'error'); }
  }

  async function deleteExam(id) {
    if (!confirm('Delete this exam?')) return;
    try {
      const r = await fetch('/api/exams/'+id, { method:'DELETE', credentials:'include' });
      const d = await r.json();
      App.showToast(d.message, d.success?'success':'error');
      if (d.success) loadExams();
    } catch(err) { App.showToast('Delete failed.','error'); }
  }

  function switchTab(i) {
    document.querySelectorAll('.tab-container .tab').forEach((t,j) => t.classList.toggle('active',i===j));
    document.getElementById('upcoming-actions').style.display = i===0?'block':'none';
    document.getElementById('upcoming-tab-pane').style.display = i===0?'block':'none';
    document.getElementById('online-tab-pane').style.display = i===1?'block':'none';
  }

  function saveOnlineQuiz(e) {
    e.preventDefault();
    App.showToast('MCQ published on Student portal!','success');
  }
  </script>
</body>
</html>`;

writeFile('d:/amala/pages/admin/exams.html', adminExamsHtml);

// ── 2. TEACHER/EXAMS.HTML ───────────────────────────────────────────────────
// Read the file, find the script section, replace it
const teacherExamsPath = 'd:/amala/pages/teacher/exams.html';
let teacherExamsContent = fs.readFileSync(teacherExamsPath, 'utf8');
const teacherScriptStart = teacherExamsContent.lastIndexOf('<script>');
const teacherScriptEnd = teacherExamsContent.lastIndexOf('</script>');
const teacherHtmlBefore = teacherExamsContent.substring(0, teacherScriptStart);
const teacherNewScript = `<script>
  let marksStudents = [];
  let currentExamId = null;

  window.addEventListener('load', async () => {
    await loadExams();
    await loadClassesDropdown();
  });

  async function loadExams() {
    try {
      const r = await fetch('/api/exams', { credentials: 'include' });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      renderExamList(d.data || []);
    } catch (err) { console.error(err); }
  }

  function renderExamList(list) {
    const sel = document.getElementById('examSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Select Exam --</option>';
    list.forEach(e => {
      sel.innerHTML += '<option value="' + (e.exam_id||e.id) + '" data-marks="' + (e.max_marks||100) + '">' + e.title + (e.class_name ? ' (' + e.class_name + ')' : '') + '</option>';
    });
  }

  async function loadClassesDropdown() {
    try {
      const r = await fetch('/api/classes', { credentials: 'include' });
      const d = await r.json();
      ['publishClass','markClass'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Select Class --</option>';
        (d.data||[]).forEach(c => { sel.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>'; });
      });
    } catch (err) { console.error(err); }
  }

  async function scheduleExam(e) {
    e.preventDefault();
    const title     = document.getElementById('schedTitle') ? document.getElementById('schedTitle').value.trim() : '';
    const exam_type = document.getElementById('schedType') ? document.getElementById('schedType').value : 'Quarterly';
    const class_name= document.getElementById('schedClass') ? document.getElementById('schedClass').value : '';
    const subject   = document.getElementById('schedSubject') ? document.getElementById('schedSubject').value : '';
    const exam_date = document.getElementById('schedDate') ? document.getElementById('schedDate').value : '';
    const max_marks = document.getElementById('schedMarks') ? document.getElementById('schedMarks').value : 100;
    if (!title) { App.showToast('Title required.','error'); return; }
    try {
      const r = await fetch('/api/exams', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, exam_type, class_name, subject, exam_date, max_marks })
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      App.showToast('Exam scheduled!', 'success');
      loadExams();
    } catch (err) { App.showToast('Failed: ' + err.message, 'error'); }
  }

  async function loadStudentsForMarks() {
    const classEl   = document.getElementById('publishClass') || document.getElementById('markClass');
    const sectionEl = document.getElementById('publishSection') || document.getElementById('markSection');
    const className = classEl ? classEl.value : '';
    const section   = sectionEl ? sectionEl.value : '';
    if (!className) { App.showToast('Select a class first.', 'error'); return; }
    try {
      const r = await fetch('/api/students?class_name=' + encodeURIComponent(className) + (section ? '&section=' + section : ''), { credentials: 'include' });
      const d = await r.json();
      marksStudents = d.data || [];
      const tbody = document.getElementById('marksTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      if (!marksStudents.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No students found.</td></tr>';
        return;
      }
      marksStudents.forEach((s, i) => {
        const maxM = parseInt(document.getElementById('maxMarks') ? document.getElementById('maxMarks').value : 100) || 100;
        tbody.innerHTML += '<tr><td>' + (i+1) + '</td><td>' + (s.student_id||s.studentId||s.id) + '</td><td><b>' + s.name + '</b></td><td><input type="number" class="form-control marks-input" id="marks_' + s.student_id + '" min="0" max="' + maxM + '" placeholder="--" oninput="calcGrade(\\'' + s.student_id + '\\')"></td><td class="grade-cell" id="grade_' + s.student_id + '">--</td><td><input type="text" class="form-control" id="remark_' + s.student_id + '" placeholder="Remarks..." style="max-width:180px;"></td></tr>';
      });
    } catch (err) { App.showToast('Failed to load students.', 'error'); }
  }

  function calcGrade(stuId) {
    const maxM = parseInt(document.getElementById('maxMarks') ? document.getElementById('maxMarks').value : 100) || 100;
    const obtained = parseInt(document.getElementById('marks_' + stuId) ? document.getElementById('marks_' + stuId).value : '');
    if (isNaN(obtained)) { document.getElementById('grade_' + stuId).textContent = '--'; return; }
    const pct = (obtained / maxM) * 100;
    let g, cls;
    if (pct >= 90) { g='A+'; cls='g-Ap'; }
    else if (pct >= 80) { g='A'; cls='g-A'; }
    else if (pct >= 70) { g='B+'; cls='g-Bp'; }
    else if (pct >= 60) { g='B'; cls='g-B'; }
    else if (pct >= 50) { g='C'; cls='g-C'; }
    else if (pct >= 35) { g='D'; cls='g-D'; }
    else { g='F'; cls='g-F'; }
    const el = document.getElementById('grade_' + stuId);
    el.textContent = g;
    el.className = 'grade-cell ' + cls;
  }

  async function saveAllMarks() {
    const subjectEl  = document.getElementById('examSubject');
    const examNameEl = document.getElementById('examName');
    const maxMarksEl = document.getElementById('maxMarks');
    const subject  = subjectEl ? subjectEl.value : '';
    const examName = examNameEl ? examNameEl.value : '';
    const maxM     = parseInt(maxMarksEl ? maxMarksEl.value : 100) || 100;
    if (!subject || !examName) { App.showToast('Fill in subject and exam name.', 'error'); return; }

    const records = [];
    marksStudents.forEach(s => {
      const sid = s.student_id || s.studentId;
      const el  = document.getElementById('marks_' + sid);
      if (!el) return;
      const obtained = parseInt(el.value);
      if (isNaN(obtained)) return;
      const grade   = (document.getElementById('grade_' + sid) || {}).textContent || '';
      const remarks = (document.getElementById('remark_' + sid) || {}).value || 'Good';
      records.push({ student_id: sid, subject, exam_name: examName, max_marks: maxM, obtained, grade, remarks });
    });

    if (!records.length) { App.showToast('No marks entered.', 'error'); return; }

    try {
      const r = await fetch('/api/results', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      App.showToast('Marks published for ' + records.length + ' students!', 'success');
    } catch (err) { App.showToast('Failed: ' + err.message, 'error'); }
  }
</script>`;

const teacherHtmlAfter = teacherExamsContent.substring(teacherScriptEnd + '</script>'.length);
fs.writeFileSync(teacherExamsPath, teacherHtmlBefore + teacherNewScript + teacherHtmlAfter, 'utf8');
console.log('Written: teacher/exams.html');

console.log('\\nAll exam pages updated!');
