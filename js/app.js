/**
 * EduSphere LMS — Shared App Utilities
 * PostgreSQL-backed version with dynamic local-sync bridge (AppState)
 */

// ── AUTH TOKEN HELPER ─────────────────────────────────────────────────────────
function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
  };
}

// ── API HELPER ─────────────────────────────────────────────────────────────────
const API = {
  async get(endpoint, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = '/api/' + endpoint + (qs ? '?' + qs : '');
    const res = await fetch(url, { headers: getAuthHeaders(), credentials: 'include' });
    if (res.status === 401) { App.logout(true); return { success: false, data: [] }; }
    return res.json();
  },

  async post(endpoint, body = {}) {
    const res = await fetch('/api/' + endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (res.status === 401) { App.logout(true); return { success: false }; }
    return res.json();
  },

  async put(endpoint, body = {}) {
    const res = await fetch('/api/' + endpoint, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (res.status === 401) { App.logout(true); return { success: false }; }
    return res.json();
  },

  async delete(endpoint) {
    const res = await fetch('/api/' + endpoint, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (res.status === 401) { App.logout(true); return { success: false }; }
    return res.json();
  },
};

// ── APP OBJECT ────────────────────────────────────────────────────────────────
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
    document.documentElement.classList.toggle('dark', isDark);
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
    const borderColMap = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)' };
    toast.style.borderLeftColor = borderColMap[type] || 'var(--primary)';
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },

  formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  async logout(silent = false) {
    if (silent || confirm('Are you sure you want to log out?')) {
      try { await API.post('auth/logout'); } catch (e) { /* ignore */ }
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('childId');
      localStorage.removeItem('authToken');
      sessionStorage.clear();
      // Navigate to login page — works from any subdirectory depth
      const parts = window.location.pathname.split('/');
      const depth = parts.length - 2;
      const prefix = depth > 0 ? '../'.repeat(depth) : '';
      window.location.href = prefix + 'index.html';
    }
  },

  initSidebar() {
    const ham     = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (ham && sidebar) {
      ham.addEventListener('click', () => sidebar.classList.toggle('open'));
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !ham.contains(e.target) && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    }
  },

  highlightActiveNav() {
    const current = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-item a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href === current) {
        a.parentElement.classList.add('active');
      }
    });
  },

  // Populate a <select> from API data
  async populateSelect(selectId, endpoint, valueKey, labelKey, params = {}, emptyLabel = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    if (emptyLabel) select.innerHTML = `<option value="">${emptyLabel}</option>`;
    try {
      const res = await API.get(endpoint, params);
      if (res.success && res.data) {
        res.data.forEach(item => {
          select.innerHTML += `<option value="${item[valueKey]}">${item[labelKey]}</option>`;
        });
      }
    } catch (e) {
      console.warn('populateSelect failed:', endpoint, e);
    }
  },
};

// ── APP STATE LOCAL-POSTGRES BRIDGE ─────────────────────────────────────────
const AppState = {
  init() {
    this.syncDatabaseToLocal();
  },

  async syncDatabaseToLocal() {
    if (!localStorage.getItem('userId')) return;
    try {
      const [classes, teachers, students, parents, subjects, results, assignments, materials, notices, timetable] = await Promise.all([
        API.get('classes'),
        API.get('teachers'),
        API.get('students'),
        API.get('parents'),
        API.get('subjects'),
        API.get('results'),
        API.get('assignments'),
        API.get('materials'),
        API.get('notices'),
        API.get('timetable')
      ]);

      if (classes.success) {
        localStorage.setItem('lms_classes', JSON.stringify(classes.data));
        window.dispatchEvent(new CustomEvent('lms-sync-classes'));
      }
      if (teachers.success) {
        localStorage.setItem('lms_teachers', JSON.stringify(teachers.data));
        window.dispatchEvent(new CustomEvent('lms-sync-teachers'));
      }
      if (students.success) {
        localStorage.setItem('lms_students', JSON.stringify(students.data));
        window.dispatchEvent(new CustomEvent('lms-sync-students'));
      }
      if (parents.success) {
        localStorage.setItem('lms_parents', JSON.stringify(parents.data));
        window.dispatchEvent(new CustomEvent('lms-sync-parents'));
      }
      if (subjects.success) {
        localStorage.setItem('lms_subjects', JSON.stringify(subjects.data));
        window.dispatchEvent(new CustomEvent('lms-sync-subjects'));
      }
      if (results.success) {
        localStorage.setItem('lms_results', JSON.stringify(results.data));
        window.dispatchEvent(new CustomEvent('lms-sync-results'));
      }
      if (assignments.success) {
        localStorage.setItem('lms_assignments', JSON.stringify(assignments.data));
        window.dispatchEvent(new CustomEvent('lms-sync-assignments'));
      }
      if (materials.success) {
        localStorage.setItem('lms_materials', JSON.stringify(materials.data));
        window.dispatchEvent(new CustomEvent('lms-sync-materials'));
      }
      if (notices.success) {
        localStorage.setItem('lms_notices', JSON.stringify(notices.data));
        window.dispatchEvent(new CustomEvent('lms-sync-notices'));
      }
      if (timetable.success) {
        localStorage.setItem('lms_timetable', JSON.stringify(timetable.data));
        window.dispatchEvent(new CustomEvent('lms-sync-timetable'));
      }
    } catch (e) {
      console.warn('AppState background database sync failed:', e);
    }
  },

  getData(key) {
    const rawLocal = localStorage.getItem(key);
    const data = rawLocal ? JSON.parse(rawLocal) : [];
    
    // Transform formatting to match legacy localStorage expectancies
    if (key === 'lms_students') {
      const parents = JSON.parse(localStorage.getItem('lms_parents')) || [];
      return data.map(s => {
        const p = parents.find(parent => parent.student_id === s.id) || {};
        return {
          id: s.student_id,
          name: s.name,
          class: s.class_name,
          section: s.section,
          parent: p.name || 'Parent',
          phone: s.phone,
          attendance: parseFloat(s.attendance_pct || 100),
          fee: s.fee_status,
          password: 'stud123',
          parentUsername: p.parent_id || '',
          parentPassword: 'par123'
        };
      });
    }

    if (key === 'lms_teachers') {
      return data.map(t => ({
        id: t.teacher_id,
        name: t.name,
        dept: t.department,
        classAssigned: t.class_assigned,
        subjects: t.subjects || 'All',
        phone: t.phone,
        status: t.status,
        password: 'teach123'
      }));
    }

    if (key === 'lms_classes') {
      const classesList = data.length > 0 ? data : [
        { name: 'LKG', sections: '{A,B}', students_count: 0 },
        { name: 'UKG', sections: '{A,B,C}', students_count: 0 },
        { name: '1st Standard', sections: '{A,B}', students_count: 0 },
        { name: '2nd Standard', sections: '{A,B}', students_count: 0 },
        { name: '3rd Standard', sections: '{A,B}', students_count: 0 },
        { name: '4th Standard', sections: '{A,B}', students_count: 0 },
        { name: '5th Standard', sections: '{A,B}', students_count: 0 },
        { name: '6th Standard', sections: '{A,B}', students_count: 0 },
        { name: '7th Standard', sections: '{A,B}', students_count: 0 },
        { name: '8th Standard', sections: '{A,B}', students_count: 0 },
        { name: '9th Standard', sections: '{A,B}', students_count: 0 },
        { name: '10th Standard', sections: '{A,B,C,D}', students_count: 0 },
        { name: '11th Standard - Computer Science with Mathematics', sections: '{A}', students_count: 0 },
        { name: '11th Standard - Biology with Mathematics', sections: '{A}', students_count: 0 },
        { name: '11th Standard - Pure Science', sections: '{A}', students_count: 0 },
        { name: '11th Standard - Commerce with Computer Application', sections: '{A}', students_count: 0 },
        { name: '11th Standard - Commerce with Business Maths', sections: '{A}', students_count: 0 },
        { name: '12th Standard - Computer Science with Mathematics', sections: '{A}', students_count: 0 },
        { name: '12th Standard - Biology with Mathematics', sections: '{A}', students_count: 0 },
        { name: '12th Standard - Pure Science', sections: '{A}', students_count: 0 },
        { name: '12th Standard - Commerce with Computer Application', sections: '{A}', students_count: 0 },
        { name: '12th Standard - Commerce with Business Maths', sections: '{A}', students_count: 0 }
      ];
      return classesList.map(c => ({
        name: c.name,
        sections: Array.isArray(c.sections) ? c.sections : (c.sections ? c.sections.replace(/[{}]/g, '').split(',') : ['A']),
        studentsCount: c.students_count || 0
      }));
    }

    if (key === 'lms_subjects') {
      return data.map(sub => ({
        code: sub.code,
        name: sub.name,
        class: sub.class_name,
        teacherId: sub.teacher_id,
        periods: sub.periods_week,
        type: sub.type
      }));
    }

    if (key === 'lms_results') {
      return data.map(r => ({
        stuId: r.student_code,
        subject: r.subject,
        exam: r.exam_name || 'Quarterly Examination',
        max: r.max_marks || 100,
        obtained: r.obtained,
        grade: r.grade,
        remarks: r.remarks
      }));
    }

    if (key === 'lms_assignments') {
      return data.map(a => ({
        id: a.asn_id,
        title: a.title,
        class: a.class_name,
        section: a.section,
        subject: a.subject,
        dueDate: a.due_date,
        due: a.due_date,
        maxMarks: a.max_marks,
        marks: a.max_marks,
        instructions: a.instructions,
        teacherId: a.teacher_id
      }));
    }

    if (key === 'lms_materials') {
      return data.map(m => ({
        id: m.mat_id,
        title: m.title,
        type: m.type,
        subject: m.subject,
        class: m.class_name,
        link: m.link,
        teacherId: m.teacher_id
      }));
    }

    if (key === 'lms_notices') {
      return data.map(n => {
        const d = new Date(n.posted_at || Date.now());
        const timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        return {
          time: timeStr,
          msg: n.message,
          postedBy: n.posted_by || 'Administration'
        };
      });
    }

    return data;
  },

  async saveData(key, data) {
    const rawLocal = localStorage.getItem(key);
    const oldData = rawLocal ? JSON.parse(rawLocal) : [];
    localStorage.setItem(key, JSON.stringify(data));

    // Dispatch sync events locally immediately for instantaneous UI updates
    const keyEventMap = {
      'lms_classes': 'lms-sync-classes',
      'lms_teachers': 'lms-sync-teachers',
      'lms_students': 'lms-sync-students',
      'lms_parents': 'lms-sync-parents',
      'lms_subjects': 'lms-sync-subjects',
      'lms_results': 'lms-sync-results',
      'lms_assignments': 'lms-sync-assignments',
      'lms_materials': 'lms-sync-materials',
      'lms_notices': 'lms-sync-notices',
      'lms_timetable': 'lms-sync-timetable'
    };
    if (keyEventMap[key]) {
      window.dispatchEvent(new CustomEvent(keyEventMap[key]));
    }

    // Sync to PostgreSQL DB asynchronously
    try {
      if (key === 'lms_students') {
        if (data.length > oldData.length) {
          const added = data.find(n => !oldData.some(o => (o.student_id || o.id) === (n.student_id || n.id)));
          if (added) {
            await API.post('students', {
              name: added.name,
              class_name: added.class,
              section: added.section,
              phone: added.phone,
              fee_status: added.fee,
              parent_name: added.parent,
              custom_student_id: added.id,
              student_password: added.password,
              parent_username: added.parentUsername,
              parent_password: added.parentPassword
            });
            this.syncDatabaseToLocal();
          }
        } else if (data.length < oldData.length) {
          const deleted = oldData.find(o => !data.some(n => (n.student_id || n.id) === (o.student_id || o.id)));
          if (deleted) {
            await API.delete('students/' + (deleted.student_id || deleted.id));
            this.syncDatabaseToLocal();
          }
        }
      }

      if (key === 'lms_teachers') {
        if (data.length > oldData.length) {
          const added = data.find(n => !oldData.some(o => (o.teacher_id || o.id) === (n.teacher_id || n.id)));
          if (added) {
            await API.post('teachers', {
              name: added.name,
              department: added.dept,
              subjects: added.subjects,
              phone: added.phone,
              class_assigned: added.classAssigned,
              status: added.status,
              custom_id: added.id,
              password: added.password
            });
            this.syncDatabaseToLocal();
          }
        } else if (data.length < oldData.length) {
          const deleted = oldData.find(o => !data.some(n => (n.teacher_id || n.id) === (o.teacher_id || o.id)));
          if (deleted) {
            await API.delete('teachers/' + (deleted.teacher_id || deleted.id));
            this.syncDatabaseToLocal();
          }
        }
      }

      if (key === 'lms_classes') {
        if (data.length > oldData.length) {
          const added = data.find(n => !oldData.some(o => o.name === n.name));
          if (added) {
            await API.post('classes', { name: added.name, sections: added.sections });
            this.syncDatabaseToLocal();
          }
        } else if (data.length < oldData.length) {
          const deleted = oldData.find(o => !data.some(n => n.name === o.name));
          if (deleted) {
            await API.delete('classes/' + deleted.name);
            this.syncDatabaseToLocal();
          }
        }
      }

      if (key === 'lms_subjects') {
        if (data.length > oldData.length) {
          const added = data.find(n => !oldData.some(o => o.code === n.code));
          if (added) {
            await API.post('subjects', {
              code: added.code,
              name: added.name,
              class_name: added.class,
              teacher_id: added.teacherId,
              periods_week: added.periods,
              type: added.type
            });
            this.syncDatabaseToLocal();
          }
        }
      }

      if (key === 'lms_notices') {
        if (data.length > oldData.length) {
          const added = data.find(n => !oldData.some(o => o.msg === n.msg));
          if (added) {
            await API.post('notices', { message: added.msg });
            this.syncDatabaseToLocal();
          }
        }
      }

      if (key === 'lms_assignments') {
        if (data.length > oldData.length) {
          const added = data.find(n => !oldData.some(o => o.id === n.id));
          if (added) {
            await API.post('assignments', {
              title: added.title,
              class_name: added.class,
              section: added.section,
              subject: added.subject,
              due_date: added.dueDate,
              max_marks: added.maxMarks,
              instructions: added.instructions
            });
            this.syncDatabaseToLocal();
          }
        } else if (data.length < oldData.length) {
          const deleted = oldData.find(o => !data.some(n => n.id === o.id));
          if (deleted) {
            await API.delete('assignments/' + deleted.id);
            this.syncDatabaseToLocal();
          }
        }
      }

      if (key === 'lms_materials') {
        if (data.length > oldData.length) {
          const added = data.find(n => !oldData.some(o => o.id === n.id));
          if (added) {
            await API.post('materials', {
              title: added.title,
              type: added.type,
              subject: added.subject,
              class_name: added.class,
              link: added.link
            });
            this.syncDatabaseToLocal();
          }
        } else if (data.length < oldData.length) {
          const deleted = oldData.find(o => !data.some(n => n.id === o.id));
          if (deleted) {
            await API.delete('materials/' + deleted.id);
            this.syncDatabaseToLocal();
          }
        }
      }
    } catch (err) {
      console.warn('AppState background save sync failed:', err);
    }
  },

  addNotice(msg) {
    const notices = this.getData('lms_notices');
    notices.unshift({ msg, time: 'Now' });
    this.saveData('lms_notices', notices);
  }
};

// ── CANVAS CHARTS ─────────────────────────────────────────────────────────────
function drawBarChart(canvasId, labels, data, color = '#4F46E5') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { width, height } = canvas;
  const padding = 40;
  const chartH = height - padding * 2;
  const chartW = width - padding * 2;
  const maxVal = Math.max(...data) * 1.2 || 10;

  ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding); ctx.lineTo(padding, height - padding); ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const barW = (chartW / data.length) * 0.6;
  const spacing = chartW / data.length;
  data.forEach((val, i) => {
    const bH = (val / maxVal) * chartH;
    const x  = padding + i * spacing + (spacing - barW) / 2;
    const y  = height - padding - bH;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, bH);
    ctx.fillStyle = '#64748B'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, height - padding + 15);
    ctx.fillText(val, x + barW / 2, y - 5);
  });
}

function drawLineChart(canvasId, labels, data, color = '#10B981') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { width, height } = canvas;
  const padding = 40;
  const chartH = height - padding * 2;
  const chartW = width - padding * 2;
  const maxVal = Math.max(...data) * 1.2 || 10;
  const pc = data.length;
  const sp = chartW / (pc - 1 || 1);

  ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding); ctx.lineTo(padding, height - padding); ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const points = data.map((val, i) => ({
    x: padding + i * sp,
    y: height - padding - (val / maxVal) * chartH,
  }));

  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  points.forEach((p, i) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#64748B'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(labels[i], p.x, height - padding + 15);
    ctx.fillText(data[i], p.x, p.y - 10);
  });
}

// ── INIT ──────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  AppState.init();
  App.initDark();
  App.initSidebar();
  App.highlightActiveNav();
});
