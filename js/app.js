/**
 * EduSphere LMS — Shared App Utilities (Supabase Edition)
 * All API calls go directly to Supabase via the JS client.
 * Requires js/supabase.js to be loaded first.
 */

// ── SUPABASE-BACKED API ──────────────────────────────────────────────────────
// Drop-in replacement for the old fetch-based API object.
// Pages still call API.get('students'), API.post('students', body), etc.
// This layer translates those calls to Supabase queries.

const API = {
  // Route map: endpoint string → Supabase table/handler
  // Complex endpoints are handled by custom functions below
  _tableMap: {
    'classes':    'classes',
    'subjects':   'subjects',
    'students':   'students',
    'teachers':   'teachers',
    'parents':    'parents',
    'results':    'results',
    'attendance': 'attendance',
    'notices':    'notices',
    'assignments':'assignments',
    'materials':  'materials',
    'timetable':  'timetable',
    'settings':   'school_settings',
  },

  _parseEndpoint(endpoint) {
    const clean = endpoint.replace(/^\/?(api\/)?/, '').replace(/\/$/, '');
    const parts = clean.split('/');
    return { base: parts[0], rest: parts.slice(1), full: clean };
  },

  async get(endpoint, params = {}) {
    const sb = window.EduSupabase;
    if (!sb) return { success: false, data: [], message: 'Supabase not initialized' };

    const { base, rest, full } = this._parseEndpoint(endpoint);

    // ── Special endpoints ──
    if (full === 'auth/me') return this._authMe();
    if (full === 'analytics/overview') return this._analyticsOverview();
    if (base === 'messages') return this._getMessages(rest, params);
    if (full === 'messages/rooms') return this._getMessageRooms();
    if (full === 'messages/users') return this._getMessageUsers();
    if (base === 'library') return this._libraryGet(rest, params);
    if (base === 'transport') return this._transportGet(rest, params);
    if (base === 'exams') return this._examsGet(rest, params);
    if (base === 'fees') return this._feesGet(rest, params);

    // ── Standard table queries ──
    const table = this._tableMap[base];
    if (!table) {
      console.warn('[API.get] Unknown endpoint:', endpoint);
      return { success: false, data: [] };
    }

    // Single item by ID
    if (rest.length === 1) {
      const id = rest[0];
      const { data, error } = await sb.from(table).select('*').eq('id', id).single();
      if (error) return { success: false, message: error.message };
      return { success: true, data };
    }

    // List with optional filters
    let query = sb.from(table).select('*');
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    }

    // Default ordering
    if (table === 'notices') query = query.order('created_at', { ascending: false });
    else if (table === 'classes') query = query.order('id');
    else if (table === 'students') query = query.order('student_id');
    else if (table === 'teachers') query = query.order('teacher_id');

    const { data, error } = await query;
    if (error) return { success: false, message: error.message, data: [] };

    // Apply field mappings for backward compatibility
    const mapped = this._mapFields(base, data);
    return { success: true, data: mapped };
  },

  async post(endpoint, body = {}) {
    const sb = window.EduSupabase;
    if (!sb) return { success: false, message: 'Supabase not initialized' };

    const { base, rest, full } = this._parseEndpoint(endpoint);

    if (full === 'auth/login') return this._login(body);
    if (full === 'auth/logout') return this._logout();
    if (full === 'auth/change-password') return this._changePassword(body);
    if (base === 'messages') return this._sendMessage(body);
    if (base === 'library') return this._libraryPost(rest, body);
    if (base === 'transport') return this._transportPost(rest, body);
    if (base === 'attendance') return this._attendancePost(body);

    const table = this._tableMap[base];
    if (!table) {
      console.warn('[API.post] Unknown endpoint:', endpoint);
      return { success: false };
    }

    const { data, error } = await sb.from(table).insert(body).select().single();
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  },

  async put(endpoint, body = {}) {
    const sb = window.EduSupabase;
    if (!sb) return { success: false, message: 'Supabase not initialized' };

    const { base, rest, full } = this._parseEndpoint(endpoint);

    if (full.startsWith('auth/admin/update-credentials')) return this._updateCredentials(body);
    if (base === 'settings') return this._updateSettings(body);

    const table = this._tableMap[base];
    if (!table || rest.length === 0) {
      console.warn('[API.put] Unknown endpoint:', endpoint);
      return { success: false };
    }

    const id = rest[0];
    const { data, error } = await sb.from(table).update(body).eq('id', id).select().single();
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  },

  async delete(endpoint) {
    const sb = window.EduSupabase;
    if (!sb) return { success: false, message: 'Supabase not initialized' };

    const { base, rest } = this._parseEndpoint(endpoint);

    const table = this._tableMap[base];
    if (!table || rest.length === 0) {
      console.warn('[API.delete] Unknown endpoint:', endpoint);
      return { success: false };
    }

    const id = rest[0];
    // Classes are deleted by name, not by numeric id
    if (base === 'classes') {
      const { error } = await sb.from(table).delete().eq('name', id);
      if (error) return { success: false, message: error.message };
    } else {
      const { error } = await sb.from(table).delete().eq('id', id);
      if (error) return { success: false, message: error.message };
    }
    return { success: true, message: 'Deleted successfully.' };
  },

  // ── FIELD MAPPINGS (backward compatibility) ──────────────────────────────────
  _mapFields(base, rows) {
    if (!rows) return [];
    if (base === 'subjects') {
      return rows.map(sub => ({ ...sub, class: sub.class_name, teacherId: sub.teacher_id, periods: sub.periods_week }));
    }
    if (base === 'classes') {
      return rows.map(c => ({ ...c, studentsCount: c.students_count || 0 }));
    }
    return rows;
  },

  // ── AUTH HANDLERS ────────────────────────────────────────────────────────────
  async _login(body) {
    const sb = window.EduSupabase;
    const { user_id, password, role } = body;

    // Call the login RPC function in Supabase
    const { data, error } = await sb.rpc('authenticate_user', {
      p_user_id: user_id.trim(),
      p_password: password,
      p_role: role
    });

    if (error) return { success: false, message: error.message || 'Login failed.' };
    if (!data || !data.success) return { success: false, message: (data && data.message) || 'Invalid credentials.' };

    return {
      success: true,
      user: data.user,
      token: data.token || 'supabase-session'
    };
  },

  async _authMe() {
    const userId = localStorage.getItem('userId');
    if (!userId) return { success: false, message: 'Not authenticated.' };

    const sb = window.EduSupabase;
    const { data, error } = await sb.from('users').select('user_id, name, role, email, avatar').eq('user_id', userId).single();
    if (error || !data) return { success: false, message: 'User not found.' };
    return { success: true, user: data };
  },

  async _logout() {
    // Clear local storage
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    return { success: true, message: 'Logged out successfully.' };
  },

  async _changePassword(body) {
    const sb = window.EduSupabase;
    const userId = localStorage.getItem('userId');
    const { oldPassword, newPassword } = body;

    const { data, error } = await sb.rpc('change_user_password', {
      p_user_id: userId,
      p_old_password: oldPassword,
      p_new_password: newPassword
    });

    if (error) return { success: false, message: error.message };
    if (!data || !data.success) return { success: false, message: (data && data.message) || 'Password change failed.' };
    return { success: true, message: 'Password updated successfully.' };
  },

  async _updateCredentials(body) {
    const sb = window.EduSupabase;
    const { data, error } = await sb.rpc('admin_update_credentials', {
      p_role: body.role,
      p_old_id: body.old_id,
      p_new_username: body.new_username,
      p_new_password: body.new_password || null
    });

    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Credentials updated successfully.' };
  },

  // ── ATTENDANCE ───────────────────────────────────────────────────────────────
  async _attendancePost(body) {
    const sb = window.EduSupabase;
    // Attendance can be a single record or batch
    if (Array.isArray(body.records)) {
      const { error } = await sb.from('attendance').upsert(body.records, { onConflict: 'student_id,date' });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Attendance saved.' };
    }
    const { data, error } = await sb.from('attendance').upsert(body, { onConflict: 'student_id,date' }).select().single();
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  },

  // ── MESSAGES ─────────────────────────────────────────────────────────────────
  async _getMessages(rest, params) {
    const sb = window.EduSupabase;
    if (rest[0] === 'rooms') return this._getMessageRooms();
    if (rest[0] === 'users') return this._getMessageUsers();

    const roomId = params.room_id;
    let query = sb.from('messages').select('*').order('created_at', { ascending: true });
    if (roomId) query = query.eq('room_id', roomId);
    const { data, error } = await query;
    if (error) return { success: false, data: [] };
    return { success: true, data: data || [] };
  },

  async _getMessageRooms() {
    const sb = window.EduSupabase;
    const userId = localStorage.getItem('userId');
    const { data, error } = await sb.from('message_rooms').select('*').or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    if (error) return { success: false, data: [] };
    return { success: true, data: data || [] };
  },

  async _getMessageUsers() {
    const sb = window.EduSupabase;
    const { data, error } = await sb.from('users').select('user_id, name, role, avatar').eq('is_active', true).order('name');
    if (error) return { success: false, data: [] };
    return { success: true, data: data || [] };
  },

  async _sendMessage(body) {
    const sb = window.EduSupabase;
    const { data, error } = await sb.from('messages').insert(body).select().single();
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  },

  // ── LIBRARY ──────────────────────────────────────────────────────────────────
  async _libraryGet(rest, params) {
    const sb = window.EduSupabase;
    if (rest[0] === 'books') {
      const { data, error } = await sb.from('books').select('*').order('title');
      if (error) return { success: false, data: [] };
      return { success: true, data: data || [] };
    }
    if (rest[0] === 'issues') {
      let query = sb.from('library_issues').select('*, books(title, author)');
      if (params.student_id) query = query.eq('student_id', params.student_id);
      const { data, error } = await query.order('issue_date', { ascending: false });
      if (error) return { success: false, data: [] };
      return { success: true, data: data || [] };
    }
    return { success: false, data: [] };
  },

  async _libraryPost(rest, body) {
    const sb = window.EduSupabase;
    if (rest[0] === 'books') {
      const { data, error } = await sb.from('books').insert(body).select().single();
      if (error) return { success: false, message: error.message };
      return { success: true, data };
    }
    if (rest[0] === 'issue') {
      const { data, error } = await sb.rpc('issue_book', {
        p_book_id: body.book_id,
        p_student_id: body.student_id,
        p_due_date: body.due_date
      });
      if (error) return { success: false, message: error.message };
      return { success: true, data };
    }
    if (rest[0] === 'return') {
      const issueId = rest[1];
      const { data, error } = await sb.rpc('return_book', { p_issue_id: parseInt(issueId) });
      if (error) return { success: false, message: error.message };
      return { success: true, data };
    }
    return { success: false };
  },

  // ── TRANSPORT ────────────────────────────────────────────────────────────────
  async _transportGet(rest, params) {
    const sb = window.EduSupabase;
    if (rest[0] === 'vehicles') {
      const { data, error } = await sb.from('transport_vehicles').select('*');
      if (error) return { success: false, data: [] };
      return { success: true, data: data || [] };
    }
    if (rest[0] === 'assignments') {
      let query = sb.from('transport_assignments').select('*, transport_vehicles(vehicle_name, route)');
      if (params.student_id) query = query.eq('student_id', params.student_id);
      const { data, error } = await query;
      if (error) return { success: false, data: [] };
      return { success: true, data: data || [] };
    }
    return { success: false, data: [] };
  },

  async _transportPost(rest, body) {
    const sb = window.EduSupabase;
    const table = rest[0] === 'vehicles' ? 'transport_vehicles' : 'transport_assignments';
    const { data, error } = await sb.from(table).insert(body).select().single();
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  },

  // ── EXAMS ────────────────────────────────────────────────────────────────────
  async _examsGet(rest, params) {
    const sb = window.EduSupabase;
    if (rest.length === 1) {
      const { data, error } = await sb.from('exams').select('*').eq('id', rest[0]).single();
      if (error) return { success: false };
      return { success: true, data };
    }
    let query = sb.from('exams').select('*');
    if (params.class_name) query = query.eq('class_name', params.class_name);
    if (params.teacher_id) query = query.eq('teacher_id', params.teacher_id);
    const { data, error } = await query.order('exam_date', { ascending: false });
    if (error) return { success: false, data: [] };
    return { success: true, data: data || [] };
  },

  // ── FEES ─────────────────────────────────────────────────────────────────────
  async _feesGet(rest, params) {
    const sb = window.EduSupabase;
    let query = sb.from('fee_records').select('*');
    if (params.student_id) query = query.eq('student_id', params.student_id);
    if (params.class_name) query = query.eq('class_name', params.class_name);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return { success: false, data: [] };
    return { success: true, data: data || [] };
  },

  // ── SETTINGS ─────────────────────────────────────────────────────────────────
  async _updateSettings(body) {
    const sb = window.EduSupabase;
    // Upsert settings as key-value pairs
    const entries = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));
    const { error } = await sb.from('school_settings').upsert(entries, { onConflict: 'key' });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Settings saved.' };
  },

  // ── ANALYTICS ────────────────────────────────────────────────────────────────
  async _analyticsOverview() {
    const sb = window.EduSupabase;
    try {
      const [students, teachers, classes, parents] = await Promise.all([
        sb.from('students').select('id', { count: 'exact', head: true }),
        sb.from('teachers').select('id', { count: 'exact', head: true }),
        sb.from('classes').select('id', { count: 'exact', head: true }),
        sb.from('parents').select('id', { count: 'exact', head: true }),
      ]);
      return {
        success: true,
        data: {
          totalStudents: students.count || 0,
          totalTeachers: teachers.count || 0,
          totalClasses: classes.count || 0,
          totalParents: parents.count || 0,
        }
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
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
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('childId');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userAvatar');
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

// ── APP STATE LOCAL-SUPABASE BRIDGE ─────────────────────────────────────────
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
    if (key.startsWith('tt_')) {
      const section = key.split('_').pop();
      const className = key.substring(3, key.length - 2).replace(/_/g, ' ');
      const timetableData = JSON.parse(localStorage.getItem('lms_timetable')) || [];
      const grid = {};
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      timetableData.forEach(row => {
        if (row.class_name === className && row.section === section) {
          const dIdx = dayNames.indexOf(row.day);
          const pIdx = row.period - 1;
          if (dIdx >= 0 && pIdx >= 0) {
            grid[`${pIdx}_${dIdx}`] = {
              sub: row.subject,
              tch: row.teacher_id || 'Staff'
            };
          }
        }
      });
      return grid;
    }

    const rawLocal = localStorage.getItem(key);
    const data = rawLocal ? JSON.parse(rawLocal) : [];
    
    // Transform formatting to match legacy localStorage expectancies
    if (key === 'lms_students') {
      return data.map(s => ({
        id: s.student_id || s.id,
        name: s.name,
        class: s.class_name || s.class,
        section: s.section,
        parent: s.parent || 'Parent',
        phone: s.phone,
        attendance: parseFloat(s.attendance_pct || s.attendance || 100),
        fee: s.fee_status || s.fee,
        password: s.password || '',
        parentUsername: s.parentUsername || '',
        parentPassword: s.parentPassword || '',
        photo: s.photo || null
      }));
    }

    if (key === 'lms_teachers') {
      return data.map(t => ({
        id: t.teacher_id || t.id,
        name: t.name,
        dept: t.department || t.dept,
        classAssigned: t.class_assigned || t.classAssigned,
        subjects: t.subjects || 'All',
        phone: t.phone,
        status: t.status,
        password: t.password || '',
        photo: t.photo || null
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

    if (key === 'lms_cia') {
      const results = this.getData('lms_results');
      const subjectsMap = {};
      results.forEach(r => {
        const uniqueKey = r.stuId + '_' + r.subject;
        if (!subjectsMap[uniqueKey]) {
          subjectsMap[uniqueKey] = { subject: r.subject, ut1: '--', ut2: '--', model: '--', assignment: '--', attendance: '--', total: 0, stuId: r.stuId };
        }
        const obj = subjectsMap[uniqueKey];
        const val = parseInt(r.obtained) || 0;
        if (r.exam === 'Unit Test 1') { obj.ut1 = val; obj.total += val; }
        else if (r.exam === 'Unit Test 2') { obj.ut2 = val; obj.total += val; }
        else if (r.exam === 'Model Exam') { obj.model = val; obj.total += val; }
        else if (r.exam === 'Assignment') { obj.assignment = val; obj.total += val; }
        else if (r.exam === 'Attendance') { obj.attendance = val; obj.total += val; }
      });
      return Object.values(subjectsMap);
    }

    return data;
  },

  async saveData(key, data) {
    const rawLocal = localStorage.getItem(key);
    const oldData = rawLocal ? JSON.parse(rawLocal) : (key.startsWith('tt_') ? {} : []);
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

    // Sync to Supabase asynchronously
    try {
      if (key.startsWith('tt_')) {
        const parts = key.split('_');
        const section = parts.pop();
        const className = key.substring(3, key.length - 2).replace(/_/g, ' ');
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const timeSlots = [
          { start: '08:00', end: '08:45' },
          { start: '08:45', end: '09:30' },
          { start: '09:30', end: '10:15' },
          { start: '10:15', end: '11:00' },
          { start: '11:00', end: '11:45' },
          { start: '11:45', end: '12:30' },
          { start: '12:30', end: '13:15' }
        ];

        for (let pIdx = 0; pIdx < 7; pIdx++) {
          for (let dIdx = 0; dIdx < 6; dIdx++) {
            const oldVal = (oldData || {})[`${pIdx}_${dIdx}`] || { sub: '--', tch: '--' };
            const newVal = (data || {})[`${pIdx}_${dIdx}`] || { sub: '--', tch: '--' };
            if (oldVal.sub !== newVal.sub || oldVal.tch !== newVal.tch) {
              await API.post('timetable', {
                class_name: className,
                section: section,
                day: dayNames[dIdx],
                period: pIdx + 1,
                subject: newVal.sub,
                teacher_id: newVal.tch === '--' ? null : newVal.tch,
                start_time: timeSlots[pIdx].start,
                end_time: timeSlots[pIdx].end
              });
            }
          }
        }
        this.syncDatabaseToLocal();
        return;
      }

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
