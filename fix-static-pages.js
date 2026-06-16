/**
 * Fix all remaining pages with static/placeholder content
 * node fix-static-pages.js
 */
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');

// ─── Helper: replace hardcoded name with dynamic ───────────────────────────
function fixUserChip(html) {
  // Replace hardcoded avatar+name combos with dynamic ones driven by auth-check.js
  return html
    .replace(/<div class="avatar-circle"\s*>\s*MRK\s*<\/div>\s*<div style="font-weight: 600;"\s*>\s*Mr\. Rajesh Kumar\s*<\/div>/g,
      '<div class="avatar-circle" id="userAvatar">T</div><div style="font-weight: 600;" id="userDisplayName">Teacher</div>')
    .replace(/<div class="avatar-circle"\s*>\s*A\s*<\/div>\s*<div style="font-weight: 600;"\s*>\s*Administrator\s*<\/div>/g,
      '<div class="avatar-circle" id="userAvatar">A</div><div style="font-weight: 600;" id="userDisplayName">Administrator</div>')
    .replace(/<div class="avatar-circle" id="userAvatar"\s*>\s*T\s*<\/div>\s*<div style="font-weight: 600;"\s*>\s*Teacher Name\s*<\/div>/g,
      '<div class="avatar-circle" id="userAvatar">T</div><div style="font-weight: 600;" id="userDisplayName">Teacher</div>');
}

// ─── Fix teacher study-materials ───────────────────────────────────────────
const STUDY_MATERIALS_SCRIPT = `
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const subjects = JSON.parse(localStorage.getItem('lms_subjects') || '[]');
      const classes = JSON.parse(localStorage.getItem('lms_classes') || '[]');
      const teacherId = localStorage.getItem('userId') || 'TCH001';

      // Populate subjects dropdown
      const subjSelect = document.getElementById('matSubject');
      if (subjSelect) {
        const uniqueSubjects = [...new Set(subjects.map(s => s.name))];
        const subList = uniqueSubjects.length > 0 ? uniqueSubjects :
          ['Mathematics','Science','English Language','Social Science','Computer Science','Hindi'];
        subList.forEach(n => subjSelect.innerHTML += '<option>' + n + '</option>');
      }

      // Populate class dropdown
      const classSelect = document.getElementById('matClass');
      if (classSelect) {
        const myClasses = classes.filter(c => c.teacherId === teacherId);
        const showClasses = myClasses.length > 0 ? myClasses : classes.slice(0, 6);
        showClasses.forEach(c => {
          classSelect.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>';
        });
      }

      loadMaterials();
    });

    function saveMaterial(e) {
      e.preventDefault();
      const title = document.getElementById('matTitle').value.trim();
      const type = document.getElementById('matType').value;
      const subject = document.getElementById('matSubject').value;
      const classVal = document.getElementById('matClass') ? document.getElementById('matClass').value : 'All';
      const link = document.getElementById('matLink').value.trim();

      const materials = JSON.parse(localStorage.getItem('lms_materials') || '[]');
      materials.unshift({
        id: 'MAT' + String(materials.length + 1).padStart(3, '0'),
        title, type, subject, class: classVal, link,
        date: new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}),
        teacherId: localStorage.getItem('userId')
      });
      localStorage.setItem('lms_materials', JSON.stringify(materials));
      AppState.addNotice('Study material shared: ' + title);
      App.showToast('Material shared successfully!', 'success');
      document.getElementById('materialForm').reset();
      loadMaterials();
    }

    function loadMaterials() {
      const materials = JSON.parse(localStorage.getItem('lms_materials') || '[]');
      const teacherId = localStorage.getItem('userId');
      const myMats = materials.filter(m => !m.teacherId || m.teacherId === teacherId);
      const tbody = document.getElementById('materialsTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      if (myMats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No materials shared yet.</td></tr>';
        return;
      }
      const typeColors = { 'PDF':'badge-danger', 'PPT Slide':'badge-warning', 'YouTube Video Link':'badge-info', 'Word Doc':'badge-primary', 'Image':'badge-success' };
      myMats.forEach(m => {
        tbody.innerHTML += '<tr>' +
          '<td><b>' + m.title + '</b></td>' +
          '<td><span class="badge ' + (typeColors[m.type] || 'badge-primary') + '">' + m.type + '</span></td>' +
          '<td>' + m.subject + '</td>' +
          '<td>' + m.date + '</td>' +
          '<td><button class="btn btn-outline" style="padding:3px 8px;font-size:12px;color:var(--danger);" onclick="deleteMaterial(\'' + m.id + '\')">🗑️</button></td>' +
        '</tr>';
      });
    }

    function deleteMaterial(id) {
      if (!confirm('Delete this material?')) return;
      let mats = JSON.parse(localStorage.getItem('lms_materials') || '[]');
      mats = mats.filter(m => m.id !== id);
      localStorage.setItem('lms_materials', JSON.stringify(mats));
      loadMaterials();
      App.showToast('Material removed.', 'success');
    }
  <\/script>`;

// Rebuild teacher study-materials.html
let studyMatHtml = fs.readFileSync(path.join(pagesDir, 'teacher', 'study-materials.html'), 'utf8');

// Replace the form
studyMatHtml = studyMatHtml.replace(
  /<form onsubmit="event\.preventDefault\(\); App\.showToast\('Shared successfully!'\);">([\s\S]*?)<\/form>/,
  `<form id="materialForm" onsubmit="saveMaterial(event)">
        <div class="form-group"><label class="form-label">Title *</label><input type="text" class="form-control" id="matTitle" required placeholder="e.g. Chapter 5 Notes"></div>
        <div class="form-group">
          <label class="form-label">Material Type</label>
          <select class="form-control" id="matType"><option>PDF</option><option>PPT Slide</option><option>YouTube Video Link</option><option>Word Doc</option><option>Image</option></select>
        </div>
        <div class="form-group"><label class="form-label">Subject</label><select class="form-control" id="matSubject"></select></div>
        <div class="form-group"><label class="form-label">For Class</label><select class="form-control" id="matClass"><option value="All">All Classes</option></select></div>
        <div class="form-group"><label class="form-label">Link / File Name</label><input type="text" class="form-control" id="matLink" placeholder="https://... or filename.pdf"></div>
        <button type="submit" class="btn btn-success" style="width:100%;">📤 Share Material</button>
      </form>`
);

// Replace static table with dynamic one
studyMatHtml = studyMatHtml.replace(
  /<table class="data-table">([\s\S]*?)<\/table>/,
  `<table class="data-table">
        <thead><tr><th>Title</th><th>Type</th><th>Subject</th><th>Uploaded</th><th>Action</th></tr></thead>
        <tbody id="materialsTableBody"></tbody>
      </table>`
);

// Replace the hardcoded script block
studyMatHtml = studyMatHtml.replace(
  /<script>\s*\/\/ Local script code injected per page\s*<\/script>/,
  STUDY_MATERIALS_SCRIPT
);

// Fix user chip
studyMatHtml = fixUserChip(studyMatHtml);

fs.writeFileSync(path.join(pagesDir, 'teacher', 'study-materials.html'), studyMatHtml, 'utf8');
console.log('✅ Fixed: teacher/study-materials.html');

// ─── Fix all remaining pages: replace hardcoded user chips ─────────────────
const allPortals = ['admin', 'teacher', 'student', 'parent'];
let fixedCount = 0;

allPortals.forEach(portal => {
  const dir = path.join(pagesDir, portal);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    let html = fs.readFileSync(fullPath, 'utf8');
    const fixed = fixUserChip(html);
    if (fixed !== html) {
      fs.writeFileSync(fullPath, fixed, 'utf8');
      console.log('✅ Fixed user chip: ' + portal + '/' + file);
      fixedCount++;
    }
  });
});

// ─── Fix missing userAvatar/userDisplayName ids on admin pages ─────────────
['admin'].forEach(portal => {
  const dir = path.join(pagesDir, portal);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    let html = fs.readFileSync(fullPath, 'utf8');
    // If admin page has avatar-circle but no id="userAvatar"
    if (html.includes('class="avatar-circle"') && !html.includes('id="userAvatar"')) {
      html = html.replace('class="avatar-circle"', 'class="avatar-circle" id="userAvatar"');
      html = html.replace(/(<div style="font-weight: 600;">)(Administrator|Teacher Name|Teacher)(<\/div>)/,
        '$1<span id="userDisplayName">$2</span>$3');
      fs.writeFileSync(fullPath, html, 'utf8');
      console.log('✅ Fixed avatar ids: ' + portal + '/' + file);
    }
  });
});

console.log(`\n✅ All fixes applied! Pages with user chip fix: ${fixedCount}`);
