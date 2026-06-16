const fs = require('fs');
const path = require('path');

// Helper to write files
function writeFile(filePath, content) {
  const fullPath = path.resolve(filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// ==========================================
// 1. UPDATE js/app.js
// ==========================================
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
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('childId');
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
    const classList = [
      { name: 'LKG', sections: ['A', 'B'] },
      { name: 'UKG', sections: ['A', 'B', 'C'] },
      { name: '1st Standard', sections: ['A', 'B'] },
      { name: '2nd Standard', sections: ['A', 'B'] },
      { name: '3rd Standard', sections: ['A', 'B'] },
      { name: '4th Standard', sections: ['A', 'B'] },
      { name: '5th Standard', sections: ['A', 'B'] },
      { name: '6th Standard', sections: ['A', 'B'] },
      { name: '7th Standard', sections: ['A', 'B'] },
      { name: '8th Standard', sections: ['A', 'B'] },
      { name: '9th Standard', sections: ['A', 'B'] },
      { name: '10th Standard', sections: ['A', 'B', 'C', 'D'] },
      { name: '11th Standard - Computer science with Mathematics', sections: ['A'] },
      { name: '11th Standard - Biology with Mathematics', sections: ['A'] },
      { name: '11th Standard - Pure science', sections: ['A'] },
      { name: '11th Standard - Commerce with Computer Application', sections: ['A'] },
      { name: '11th Standard - Commerce with Business Maths', sections: ['A'] },
      { name: '12th Standard - Computer science with Mathematics', sections: ['A'] },
      { name: '12th Standard - Biology with Mathematics', sections: ['A'] },
      { name: '12th Standard - Pure science', sections: ['A'] },
      { name: '12th Standard - Commerce with Computer Application', sections: ['A'] },
      { name: '12th Standard - Commerce with Business Maths', sections: ['A'] }
    ];

    const teacherNames = [
      'Rajesh Kumar', 'Priya Sharma', 'Alok Dixit', 'Sumita Roy', 'Anita Vyas',
      'Pavan Gupta', 'Mary L.', 'Gopal Varma', 'Shanthi R.', 'Wilson Joseph',
      'Kavitha M.', 'Devendra Shah', 'Meera Nair', 'Rahul Sen', 'Neha Patil',
      'Sandeep Joshi', 'Vikram Singh', 'Sanjay Rawat', 'Manoj Pandey', 'Deepak Verma',
      'Divya Nair', 'Ritu Kapur'
    ];

    if (!localStorage.getItem('lms_classes')) {
      const classesData = classList.map((c, idx) => {
        const tId = 'TCH' + String(idx + 1).padStart(3, '0');
        const tName = teacherNames[idx % teacherNames.length];
        return {
          name: c.name,
          sections: c.sections,
          teacherId: tId,
          teacherName: tName,
          studentsCount: 40
        };
      });
      localStorage.setItem('lms_classes', JSON.stringify(classesData));
    }

    if (!localStorage.getItem('lms_teachers')) {
      const teachers = [];
      classList.forEach((c, idx) => {
        const id = 'TCH' + String(idx + 1).padStart(3, '0');
        const name = teacherNames[idx % teacherNames.length];
        const dept = c.name.includes('LKG') || c.name.includes('UKG') ? 'Pre-Primary' : (c.name.includes('Standard') && parseInt(c.name) < 6 ? 'Primary' : 'High School');
        teachers.push({
          id,
          name,
          dept,
          classAssigned: c.name,
          subjects: c.name.includes('LKG') || c.name.includes('UKG') ? 'All Pre-Primary Subjects' : 'Mathematics & Science',
          phone: '+91 944' + String(1000000 + idx * 24391),
          status: 'Full-Time',
          password: 'teach123'
        });
      });
      localStorage.setItem('lms_teachers', JSON.stringify(teachers));
    }

    if (!localStorage.getItem('lms_students')) {
      const students = [];
      const studentFirstNames = ['Aditya', 'Pooja', 'Rohan', 'Sneha', 'Amit', 'Karan', 'Vijay', 'Rahul', 'Priya', 'Anjali', 'Arjun', 'Neha', 'Divya', 'Sandeep', 'Vikram', 'Manoj', 'Ritu', 'Meena', 'Kiran', 'Deepika', 'Karthik', 'Suresh', 'Manish', 'Jyoti', 'Shweta', 'Abhishek', 'Harish', 'Preeti', 'Swati', 'Anil', 'Nikhil', 'Pankaj', 'Aarti', 'Siddharth', 'Nisha', 'Ravi', 'Simran', 'Varun', 'Komal', 'Tushar', 'Riya'];
      const studentLastNames = ['Patel', 'Sharma', 'Gupta', 'Roy', 'Shah', 'Varma', 'Kumar', 'Singh', 'Nair', 'Sen', 'Patil', 'Joshi', 'Iyer', 'Pillai', 'Rao', 'Reddy', 'Chawla', 'Mehta', 'Bose', 'Das', 'Mishra', 'Pandey', 'Trivedi', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Saxena', 'Kapoor', 'Khanna', 'Malhotra', 'Verma', 'Yadav', 'Prasad', 'Choudhury', 'Dutta', 'Grover', 'Sood', 'Gill', 'Joshi', 'Bahl'];

      let stuIndex = 1;
      classList.forEach((c) => {
        for (let i = 1; i <= 40; i++) {
          const id = 'STU' + String(stuIndex).padStart(3, '0');
          const firstName = studentFirstNames[(stuIndex - 1) % studentFirstNames.length];
          const lastName = studentLastNames[(i + stuIndex) % studentLastNames.length];
          
          students.push({
            id,
            name: firstName + ' ' + lastName,
            class: c.name,
            section: c.sections[i % c.sections.length],
            parent: studentFirstNames[(stuIndex + i + 10) % studentFirstNames.length] + ' ' + lastName,
            parentEmail: studentFirstNames[(stuIndex + i + 10) % studentFirstNames.length].toLowerCase() + '.' + lastName.toLowerCase() + '@example.com',
            parentUsername: 'PAR' + String(stuIndex).padStart(3, '0'),
            parentPassword: 'par123',
            phone: '+91 9' + String(800000000 + stuIndex * 1111),
            attendance: Math.floor(Math.random() * (100 - 78 + 1)) + 78,
            fee: i % 3 === 0 ? 'Paid' : (i % 3 === 1 ? 'Partial' : 'Unpaid'),
            password: 'stud123'
          });
          stuIndex++;
        }
      });
      localStorage.setItem('lms_students', JSON.stringify(students));
    }

    if (!localStorage.getItem('lms_subjects')) {
      const subjects = [];
      const coreSubjects = ['Mathematics', 'Science', 'English Language', 'Social Science', 'Hindi Language', 'Computer Science'];
      classList.forEach((c, cIdx) => {
        const classTeacherName = teacherNames[cIdx % teacherNames.length];
        
        let subNames = [];
        if (c.name.includes('LKG') || c.name.includes('UKG')) {
          subNames = ['Rhymes & Singing', 'Alphabet Writing', 'Drawing & Coloring', 'Numbers & Counting', 'Storytelling'];
        } else if (c.name.includes('Standard - Computer science with Mathematics')) {
          subNames = ['Mathematics', 'Physics', 'Chemistry', 'English Language', 'Computer Science'];
        } else if (c.name.includes('Standard - Biology with Mathematics')) {
          subNames = ['Mathematics', 'Physics', 'Chemistry', 'English Language', 'Biology'];
        } else if (c.name.includes('Standard - Pure science')) {
          subNames = ['Physics', 'Chemistry', 'Biology', 'English Language', 'Zoology & Botany'];
        } else if (c.name.includes('Standard - Commerce with Computer Application')) {
          subNames = ['Accountancy', 'Business Studies', 'Economics', 'English Language', 'Computer Application'];
        } else if (c.name.includes('Standard - Commerce with Business Maths')) {
          subNames = ['Accountancy', 'Business Studies', 'Economics', 'English Language', 'Business Mathematics'];
        } else {
          subNames = coreSubjects;
        }

        subNames.forEach((s, sIdx) => {
          subjects.push({
            code: c.name.substring(0, 3).toUpperCase().replace(/ /g, '') + '_' + sIdx + '01',
            name: s,
            class: c.name,
            periods: 5,
            type: 'Core',
            teacher: classTeacherName
          });
        });
      });
      localStorage.setItem('lms_subjects', JSON.stringify(subjects));
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
        { time: '14:15', msg: 'Attendance marked for LKG-A by Mrs. Mary L.' },
        { time: '13:00', msg: 'New Student Admitted to LKG' },
        { time: '11:30', msg: 'System configurations completed for LKG-12th Standard' },
        { time: '10:00', msg: 'Welcome to AMALA HIGHER SECONDARY SCHOOL portal' }
      ]));
    }

    if (!localStorage.getItem('lms_assignments')) {
      localStorage.setItem('lms_assignments', JSON.stringify([
        { id: 'ASN001', title: 'Quadratic Equations Practice', subject: 'Mathematics', class: '10th Standard', section: 'A', due: '2026-06-20', instructions: 'Solve all questions from exercise 4.2', marks: 50, submissions: 4 }
      ]));
    }

    if (!localStorage.getItem('lms_submissions')) {
      localStorage.setItem('lms_submissions', JSON.stringify([]));
    }

    if (!localStorage.getItem('lms_materials')) {
      localStorage.setItem('lms_materials', JSON.stringify([]));
    }

    if (!localStorage.getItem('lms_chat')) {
      localStorage.setItem('lms_chat', JSON.stringify([]));
    }

    if (!localStorage.getItem('lms_results')) {
      const results = [];
      const students = JSON.parse(localStorage.getItem('lms_students')) || [];
      const subjects = JSON.parse(localStorage.getItem('lms_subjects')) || [];
      
      students.slice(0, 10).forEach(stu => {
        const stuSubs = subjects.filter(s => s.class === stu.class);
        stuSubs.forEach(sub => {
          const obtained = Math.floor(Math.random() * (98 - 60 + 1)) + 60;
          results.push({
            stuId: stu.id,
            exam: 'Quarterly Examination',
            subject: sub.name,
            max: 100,
            obtained,
            grade: obtained >= 90 ? 'A+' : (obtained >= 80 ? 'A' : (obtained >= 70 ? 'B' : 'C')),
            remarks: obtained >= 90 ? 'Excellent' : 'Good Progress'
          });
        });
      });
      localStorage.setItem('lms_results', JSON.stringify(results));
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

// ==========================================
// 2. UPDATE js/login.js
// ==========================================
const loginJsContent = `/* eVarsity School ERP Login Controller */
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
    badge.textContent = \`Use Demo: \${userVal} / \${passVal}\`;
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
        window.location.href = \`pages/\${redirectRole}/dashboard.html\`;
      }, 1200);
    } else {
      alert('Invalid ID or Password. Check credentials and selected role.');
      generateCaptcha();
    }
  });

  // Init
  updateDemoCredentials();
});
`;
writeFile('js/login.js', loginJsContent);

// ==========================================
// 3. UPDATE index.html
// ==========================================
let indexContent = fs.readFileSync('index.html', 'utf8');
const targetDiv = `<div class="login-container">`;
if (!indexContent.includes('Amala HSS EduSphere')) {
  const replacementDiv = `<div class="login-container">
    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 11px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
      🏫 <b>Amala HSS EduSphere</b><br>
      All LKG-12th standard portals are fully functional.<br>
      Select appropriate tab below, then click "Use Demo" or type ID.
    </div>`;
  indexContent = indexContent.replace(targetDiv, replacementDiv);
}

const captchaTarget = `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <input type="checkbox" id="remember" style="cursor: pointer;">
            <label for="remember" style="font-size: 13px; cursor: pointer; user-select: none;">Remember Me</label>
          </div>`;

const captchaReplacement = `<div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label" style="display: block; margin-bottom: 6px;">Security Verification Code</label>
            <div style="display: flex; gap: 10px; align-items: center;">
              <canvas id="captchaCanvas" width="130" height="42" style="border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;" onclick="generateCaptcha()"></canvas>
              <input type="text" id="captchaInput" class="form-control" placeholder="Enter Code" required style="flex: 1; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; text-align: center;">
            </div>
            <small style="color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 4px; display: block;">Click captcha image to reload a new code</small>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <input type="checkbox" id="remember" style="cursor: pointer;">
            <label for="remember" style="font-size: 13px; cursor: pointer; user-select: none;">Remember Me</label>
          </div>`;

if (!indexContent.includes('captchaCanvas')) {
  indexContent = indexContent.replace(captchaTarget, captchaReplacement);
}

writeFile('index.html', indexContent);

// ==========================================
// 4. UPDATE pages/admin/students.html
// ==========================================
let studentsHtml = fs.readFileSync('pages/admin/students.html', 'utf8');
const filterTarget = `<select class="form-control" id="classFilter" onchange="filterStudents()">
        <option value="All">All Classes</option>
        <option>LKG</option>
        <option>UKG</option>
        <option>10th Standard</option>
        <option>12th Science</option>
      </select>`;
const filterReplacement = `<select class="form-control" id="classFilter" onchange="filterStudents()">
        <option value="All">All Classes</option>
        <option>LKG</option>
        <option>UKG</option>
        <option>1st Standard</option>
        <option>2nd Standard</option>
        <option>3rd Standard</option>
        <option>4th Standard</option>
        <option>5th Standard</option>
        <option>6th Standard</option>
        <option>7th Standard</option>
        <option>8th Standard</option>
        <option>9th Standard</option>
        <option>10th Standard</option>
        <option>11th Standard - Computer science with Mathematics</option>
        <option>11th Standard - Biology with Mathematics</option>
        <option>11th Standard - Pure science</option>
        <option>11th Standard - Commerce with Computer Application</option>
        <option>11th Standard - Commerce with Business Maths</option>
        <option>12th Standard - Computer science with Mathematics</option>
        <option>12th Standard - Biology with Mathematics</option>
        <option>12th Standard - Pure science</option>
        <option>12th Standard - Commerce with Computer Application</option>
        <option>12th Standard - Commerce with Business Maths</option>
      </select>`;
if (studentsHtml.includes(filterTarget)) {
  studentsHtml = studentsHtml.replace(filterTarget, filterReplacement);
}

const modalTarget = `<div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-control" id="stuPhone" required></div>`;
const modalReplacement = `<div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-control" id="stuPhone" required></div>
        <div class="form-group"><label class="form-label">Custom Student ID (Optional)</label><input type="text" class="form-control" id="stuCustomId" placeholder="e.g. STU1001 (Leave blank to auto-generate)"></div>
        <div class="form-group"><label class="form-label">Login Password</label><input type="password" class="form-control" id="stuPassword" value="stud123" required></div>`;
if (studentsHtml.includes(modalTarget) && !studentsHtml.includes('stuCustomId')) {
  studentsHtml = studentsHtml.replace(modalTarget, modalReplacement);
}

const renderTarget = `body.innerHTML += \`<tr>
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
      </tr>\`;`;
const renderReplacement = `body.innerHTML += \`<tr>
        <td>\${s.id}</td>
        <td><b>\${s.name}</b></td>
        <td>\${s.class}</td>
        <td>Section \${s.section}</td>
        <td>\${s.parent}</td>
        <td>\${s.phone}</td>
        <td><span class="badge \${badge}">\${s.fee}</span></td>
        <td>
          <code style="display:block;">User: \${s.id}</code>
          <small style="color:var(--text-muted)">Pass: \${s.password || 'stud123'}</small>
          <hr style="margin:4px 0; border:0; border-top:1px solid var(--border-color);">
          <code style="display:block;">Parent: \${s.parentUsername || ''}</code>
          <small style="color:var(--text-muted)">Pass: \${s.parentPassword || 'par123'}</small>
        </td>
        <td>
          <button class="btn btn-outline" style="padding:4px 8px; color:var(--danger);" onclick="deleteStudent('\${s.id}')">🗑️</button>
        </td>
      </tr>\`;`;
if (studentsHtml.includes(renderTarget)) {
  studentsHtml = studentsHtml.replace(renderTarget, renderReplacement);
  studentsHtml = studentsHtml.replace('<th>Fee Status</th>\n            <th>Actions</th>', '<th>Fee Status</th>\n            <th>Login Details</th>\n            <th>Actions</th>');
}

const saveTarget = `const students = AppState.getData('lms_students');
    const id = 'ADM' + Math.floor(100000 + Math.random() * 900000);
    const newStudent = { id, name, class: className, section, parent, phone, attendance: 100, fee };`;
const saveReplacement = `const students = AppState.getData('lms_students');
    const customId = document.getElementById('stuCustomId').value.trim();
    const id = customId || ('STU' + String(students.length + 1).padStart(3, '0'));
    const password = document.getElementById('stuPassword').value.trim() || 'stud123';
    
    const parentUsername = 'PAR' + id.replace('STU', '');
    const parentPassword = 'par123';

    const newStudent = { 
      id, 
      name, 
      class: className, 
      section, 
      parent, 
      phone, 
      attendance: 100, 
      fee,
      password,
      parentUsername,
      parentPassword
    };`;
if (studentsHtml.includes(saveTarget)) {
  studentsHtml = studentsHtml.replace(saveTarget, saveReplacement);
}

const cleanTarget = `// Clean inputs
    document.getElementById('stuName').value = '';
    document.getElementById('stuParent').value = '';
    document.getElementById('stuPhone').value = '';`;
const cleanReplacement = `// Clean inputs
    document.getElementById('stuName').value = '';
    document.getElementById('stuParent').value = '';
    document.getElementById('stuPhone').value = '';
    document.getElementById('stuCustomId').value = '';
    document.getElementById('stuPassword').value = 'stud123';`;
if (studentsHtml.includes(cleanTarget)) {
  studentsHtml = studentsHtml.replace(cleanTarget, cleanReplacement);
}

writeFile('pages/admin/students.html', studentsHtml);

// ==========================================
// 5. UPDATE pages/admin/teachers.html
// ==========================================
let teachersHtml = fs.readFileSync('pages/admin/teachers.html', 'utf8');

const tchModalTarget = `<div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-control" id="tchPhone" required></div>`;
const tchModalReplacement = `<div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-control" id="tchPhone" required></div>
        <div class="form-group">
          <label class="form-label">Class Assigned</label>
          <select class="form-control" id="tchClassAssigned"></select>
        </div>
        <div class="form-group"><label class="form-label">Custom Teacher ID (Optional)</label><input type="text" class="form-control" id="tchCustomId" placeholder="e.g. TCH001"></div>
        <div class="form-group"><label class="form-label">Login Password</label><input type="password" class="form-control" id="tchPassword" value="teach123" required></div>`;
if (teachersHtml.includes(tchModalTarget) && !teachersHtml.includes('tchCustomId')) {
  teachersHtml = teachersHtml.replace(tchModalTarget, tchModalReplacement);
}

const tchOnLoadTarget = `window.addEventListener('load', loadTeachers);`;
const tchOnLoadReplacement = `window.addEventListener('load', () => {
    loadTeachers();
    loadClassesDropdown();
  });

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('tchClassAssigned');
    select.innerHTML = '<option value="None">None</option>';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }`;
if (teachersHtml.includes(tchOnLoadTarget)) {
  teachersHtml = teachersHtml.replace(tchOnLoadTarget, tchOnLoadReplacement);
}

const tchHeaderTarget = `<tr><th>ID</th><th>Name</th><th>Department</th><th>Subjects</th><th>Phone</th><th>Status</th><th>Actions</th></tr>`;
const tchHeaderReplacement = `<tr><th>ID</th><th>Name</th><th>Assigned Class</th><th>Department</th><th>Subjects</th><th>Phone</th><th>Login Credentials</th><th>Actions</th></tr>`;
if (teachersHtml.includes(tchHeaderTarget)) {
  teachersHtml = teachersHtml.replace(tchHeaderTarget, tchHeaderReplacement);
}

const tchRenderBodyTarget = `body.innerHTML += \`<tr>
        <td>\${t.id}</td>
        <td><b>\${t.name}</b></td>
        <td>\${t.dept}</td>
        <td>\${t.subjects}</td>
        <td>\${t.phone}</td>
        <td><span class="badge badge-success">\${t.status}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:4px 8px; color:var(--danger);" onclick="deleteTeacher('\${t.id}')">🗑️</button>
        </td>
      </tr>\`;`;
const tchRenderBodyReplacement = `body.innerHTML += \`<tr>
        <td>\${t.id}</td>
        <td><b>\${t.name}</b></td>
        <td><span class="badge badge-primary">\${t.classAssigned || 'None'}</span></td>
        <td>\${t.dept}</td>
        <td>\${t.subjects}</td>
        <td>\${t.phone}</td>
        <td>
          <code>User: \${t.id}</code><br>
          <small style="color:var(--text-muted);">Pass: \${t.password || 'teach123'}</small>
        </td>
        <td>
          <button class="btn btn-outline" style="padding:4px 8px; color:var(--danger);" onclick="deleteTeacher('\${t.id}')">🗑️</button>
        </td>
      </tr>\`;`;
if (teachersHtml.includes(tchRenderBodyTarget)) {
  teachersHtml = teachersHtml.replace(tchRenderBodyTarget, tchRenderBodyReplacement);
}

const tchSaveTarget = `const list = AppState.getData('lms_teachers');
    const id = 'TCH' + Math.floor(100 + Math.random() * 900);
    const newT = { id, name, dept, subjects, phone, status };`;
const tchSaveReplacement = `const list = AppState.getData('lms_teachers');
    const customId = document.getElementById('tchCustomId').value.trim();
    const id = customId || ('TCH' + String(list.length + 1).padStart(3, '0'));
    const password = document.getElementById('tchPassword').value.trim() || 'teach123';
    const classAssigned = document.getElementById('tchClassAssigned').value;

    const newT = { id, name, dept, subjects, phone, status, password, classAssigned };`;
if (teachersHtml.includes(tchSaveTarget)) {
  teachersHtml = teachersHtml.replace(tchSaveTarget, tchSaveReplacement);
}

const tchCleanTarget = `document.getElementById('tchName').value = '';
    document.getElementById('tchDept').value = '';
    document.getElementById('tchSub').value = '';
    document.getElementById('tchPhone').value = '';`;
const tchCleanReplacement = `document.getElementById('tchName').value = '';
    document.getElementById('tchDept').value = '';
    document.getElementById('tchSub').value = '';
    document.getElementById('tchPhone').value = '';
    document.getElementById('tchCustomId').value = '';
    document.getElementById('tchPassword').value = 'teach123';
    document.getElementById('tchClassAssigned').value = 'None';`;
if (teachersHtml.includes(tchCleanTarget)) {
  teachersHtml = teachersHtml.replace(tchCleanTarget, tchCleanReplacement);
}

writeFile('pages/admin/teachers.html', teachersHtml);

// ==========================================
// 6. UPDATE pages/admin/parents.html
// ==========================================
let parentsHtml = fs.readFileSync('pages/admin/parents.html', 'utf8');
const parentsScriptReplacement = `<script>
    window.addEventListener('load', loadParents);

    function loadParents() {
      const students = AppState.getData('lms_students');
      const body = document.querySelector('.data-table tbody');
      body.innerHTML = '';
      
      const seenParents = new Set();
      students.forEach(s => {
        if (!s.parent || seenParents.has(s.parent)) return;
        seenParents.add(s.parent);

        body.innerHTML += \`<tr>
          <td><b>\${s.parent}</b></td>
          <td>Rita \${s.parent.split(' ').pop()}</td>
          <td>\${s.phone}</td>
          <td>\${s.parentEmail || (s.parent.toLowerCase().replace(' ', '') + '@example.com')}</td>
          <td>\${s.name} (\${s.class} - \${s.section})</td>
          <td>
            <code>User: \${s.parentUsername || ''}</code><br>
            <small style="color:var(--text-muted);">Pass: \${s.parentPassword || 'par123'}</small>
          </td>
          <td>Business / Guardian</td>
        </tr>\`;
      });
    }
  </script>`;
if (parentsHtml.includes('<script>\n    // Local script code injected per page\n  </script>')) {
  parentsHtml = parentsHtml.replace('<script>\n    // Local script code injected per page\n  </script>', parentsScriptReplacement);
  parentsHtml = parentsHtml.replace('<th>Associated Child</th><th>Occupation</th>', '<th>Associated Child</th><th>Credentials</th><th>Occupation</th>');
  writeFile('pages/admin/parents.html', parentsHtml);
}

// ==========================================
// 7. UPDATE pages/admin/timetable.html
// ==========================================
let timetableHtml = fs.readFileSync('pages/admin/timetable.html', 'utf8');
const ttDropdownTarget = `<div>
        <select class="form-control" style="display:inline-block; width:150px; margin-right:10px;" id="ttClassSelect" onchange="loadTimetable()">
          <option>10th Standard</option>
          <option>12th Science</option>
        </select>
        <select class="form-control" style="display:inline-block; width:100px; margin-right:10px;" id="ttSectionSelect" onchange="loadTimetable()">
          <option>A</option>
          <option>B</option>
        </select>
      </div>`;
const ttDropdownReplacement = `<div>
        <select class="form-control" style="display:inline-block; width:220px; margin-right:10px;" id="ttClassSelect" onchange="loadTimetable()"></select>
        <select class="form-control" style="display:inline-block; width:100px; margin-right:10px;" id="ttSectionSelect" onchange="loadTimetable()">
          <option>A</option>
          <option>B</option>
          <option>C</option>
          <option>D</option>
        </select>
      </div>`;
if (timetableHtml.includes(ttDropdownTarget)) {
  timetableHtml = timetableHtml.replace(ttDropdownTarget, ttDropdownReplacement);
}

const ttLoadOnLoad = `window.addEventListener('load', () => {
    loadTimetable();
    loadSlotDropdowns();
  });`;
const ttLoadOnLoadReplacement = `window.addEventListener('load', () => {
    loadClassesDropdown(() => {
      loadTimetable();
      loadSlotDropdowns();
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
  }`;
if (timetableHtml.includes(ttLoadOnLoad)) {
  timetableHtml = timetableHtml.replace(ttLoadOnLoad, ttLoadOnLoadReplacement);
}
writeFile('pages/admin/timetable.html', timetableHtml);

// ==========================================
// 8. UPDATE pages/admin/classes.html
// ==========================================
let classesHtml = fs.readFileSync('pages/admin/classes.html', 'utf8');

const classesRenderReplacement = `function loadClasses() {
    const list = AppState.getData('lms_classes');
    const grid = document.getElementById('class-cards-grid');
    if (!grid) return;
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
        <p><b>Sections:</b> \${c.sections ? c.sections.join(', ') : 'None'}</p>
        <p><b>Total Wards:</b> \${c.studentsCount || c.students || 0}</p>
        <p><b>Head Teacher:</b> \${c.teacherName || c.teacher || 'Not Assigned'}</p>
        <div style="margin-top:15px; display:flex; gap:10px;">
          <button class="btn btn-primary" style="padding:4px 8px; flex:1;" onclick="openManageSections(\${index})">⚙️ Configure</button>
          <button class="btn btn-outline" style="padding:4px 8px; color:var(--danger);" onclick="deleteClass('\${c.name}')">🗑️ Delete</button>
        </div>
      </div>\`;
    });
  }

  function deleteClass(className) {
    if (!confirm('Are you sure you want to delete class ' + className + '?')) return;
    let classesList = AppState.getData('lms_classes');
    classesList = classesList.filter(c => c.name !== className);
    AppState.saveData('lms_classes', classesList);
    loadClasses();
    App.showToast('Class deleted successfully!', 'success');
  }`;

classesHtml = classesHtml.replace(/function deleteClass\([\s\S]*?\n  \}/g, '');

if (classesHtml.includes('function loadClasses() {')) {
  classesHtml = classesHtml.replace(/function loadClasses\(\) \{[\s\S]*?\n  \}/, classesRenderReplacement);
}

writeFile('pages/admin/classes.html', classesHtml);

// ==========================================
// 9. UPDATE pages/admin/subjects.html
// ==========================================
let subjectsHtml = fs.readFileSync('pages/admin/subjects.html', 'utf8');

// Clean up duplicate helper/enhancement functions
subjectsHtml = subjectsHtml.replace(/function filterSubjects\([\s\S]*?\n  \}/g, '');
subjectsHtml = subjectsHtml.replace(/function loadTeacherDropdown\([\s\S]*?\n  \}/g, '');

subjectsHtml = subjectsHtml.replace('<h3 class="card-title">Subject Registry</h3>', 
  `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3 class="card-title" style="margin-bottom:0;">Subject Registry</h3>
        <select class="form-control" id="classFilter" onchange="filterSubjects()" style="width: 180px;"></select>
      </div>`);

subjectsHtml = subjectsHtml.replace('<tr><th>Code</th><th>Name</th><th>Class</th><th>Weekly Periods</th><th>Type</th></tr>',
  '<tr><th>Code</th><th>Name</th><th>Class</th><th>Weekly Periods</th><th>Type</th><th>Teacher</th></tr>');

subjectsHtml = subjectsHtml.replace(
  `<div class="form-group">
          <label class="form-label">Subject Type</label>
          <select class="form-control" id="subType"><option>Core</option><option>Elective</option><option>Language</option></select>
        </div>`,
  `<div class="form-group">
          <label class="form-label">Subject Type</label>
          <select class="form-control" id="subType"><option>Core</option><option>Elective</option><option>Language</option></select>
        </div>
        <div class="form-group">
          <label class="form-label">Assign Teacher</label>
          <select class="form-control" id="subTeacher"></select>
        </div>`
);

const subjectsOnLoadReplacement = `window.addEventListener('load', () => {
    loadSubjects();
    loadClassesDropdown();
    loadTeacherDropdown();
  });

  function loadTeacherDropdown() {
    const tchs = AppState.getData('lms_teachers');
    const select = document.getElementById('subTeacher');
    if (!select) return;
    select.innerHTML = '<option value="Not Assigned">Not Assigned</option>';
    tchs.forEach(t => {
      select.innerHTML += \`<option value="\${t.name}">\${t.name}</option>\`;
    });
  }`;

subjectsHtml = subjectsHtml.replace(/window\.addEventListener\('load', \(\) => \{[\s\S]*?loadClassesDropdown\(\);\s*\}\);/, subjectsOnLoadReplacement);

const subjectsRenderReplacement = `function loadSubjects() {
    filterSubjects();
  }

  function filterSubjects() {
    const filterVal = document.getElementById('classFilter').value;
    const list = AppState.getData('lms_subjects');
    const body = document.getElementById('subjectTableBody');
    body.innerHTML = '';
    list.forEach(s => {
      if (filterVal !== 'All' && s.class !== filterVal) return;
      body.innerHTML += \`<tr>
        <td>\${s.code}</td>
        <td><b>\${s.name}</b></td>
        <td>\${s.class}</td>
        <td>\${s.periods}</td>
        <td>\${s.type}</td>
        <td>\${s.teacher || 'Not Assigned'}</td>
      </tr>\`;
    });
  }`;

subjectsHtml = subjectsHtml.replace(/function loadSubjects\(\) \{[\s\S]*?\n  \}/, subjectsRenderReplacement);

const subjectsDropdownReplacement = `function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    
    const filterSelect = document.getElementById('classFilter');
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="All">All Classes</option>';
      classes.forEach(c => {
        filterSelect.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
    }

    const select = document.getElementById('subClass');
    if (select) {
      select.innerHTML = '';
      classes.forEach(c => {
        select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
      });
    }
  }`;

subjectsHtml = subjectsHtml.replace(/function loadClassesDropdown\(\) \{[\s\S]*?\n  \}/, subjectsDropdownReplacement);

const subjectsSaveReplacement = `function saveSubject(e) {
    e.preventDefault();
    const code = document.getElementById('subCode').value.trim();
    const name = document.getElementById('subName').value.trim();
    const className = document.getElementById('subClass').value;
    const periods = document.getElementById('subPeriods').value;
    const type = document.getElementById('subType').value;
    const teacherSelect = document.getElementById('subTeacher');
    const teacher = teacherSelect ? teacherSelect.value : 'Not Assigned';

    const list = AppState.getData('lms_subjects');
    list.push({ code, name, class: className, periods, type, teacher });
    AppState.saveData('lms_subjects', list);
    
    document.getElementById('subCode').value = '';
    document.getElementById('subName').value = '';
    
    loadSubjects();
    App.showToast('Subject Registered successfully!');
  }`;

subjectsHtml = subjectsHtml.replace(/function saveSubject\(e\) \{[\s\S]*?\n  \}/, subjectsSaveReplacement);

writeFile('pages/admin/subjects.html', subjectsHtml);

// ==========================================
// 10. UPDATE pages/admin/attendance.html
// ==========================================
let attendanceHtml = fs.readFileSync('pages/admin/attendance.html', 'utf8');
const attClassSelectTarget = `<select class="form-control" id="classFilter" onchange="loadAttendanceSheet()">
        <option>10th Standard</option>
        <option>12th Science</option>
      </select>`;
const attClassSelectReplacement = `<select class="form-control" id="classFilter" onchange="loadAttendanceSheet()"></select>`;
if (attendanceHtml.includes(attClassSelectTarget)) {
  attendanceHtml = attendanceHtml.replace(attClassSelectTarget, attClassSelectReplacement);
}

const attScriptReplacement = `window.addEventListener('load', () => {
    loadClassesDropdown(() => {
      loadAttendanceSheet();
    });
  });

  function loadClassesDropdown(callback) {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('classFilter');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
    if(callback) callback();
  }`;
if (attendanceHtml.includes('window.addEventListener(\'load\', loadAttendanceSheet);')) {
  attendanceHtml = attendanceHtml.replace('window.addEventListener(\'load\', loadAttendanceSheet);', attScriptReplacement);
}
writeFile('pages/admin/attendance.html', attendanceHtml);

// ==========================================
// 11. UPDATE pages/admin/exams.html
// ==========================================
let examsHtml = fs.readFileSync('pages/admin/exams.html', 'utf8');
const exClassSelectTarget = `<select class="form-control" id="examClass" required>
            <option>10th Standard</option>
            <option>12th Science</option>
          </select>`;
const exClassSelectReplacement = `<select class="form-control" id="examClass" required></select>`;
if (examsHtml.includes(exClassSelectTarget)) {
  examsHtml = examsHtml.replace(exClassSelectTarget, exClassSelectReplacement);
}

const exScriptReplacement = `window.addEventListener('load', () => {
    loadExams();
    loadClassesDropdown();
  });

  function loadClassesDropdown() {
    const classes = AppState.getData('lms_classes');
    const select = document.getElementById('examClass');
    select.innerHTML = '';
    classes.forEach(c => {
      select.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
    });
  }`;
if (examsHtml.includes('window.addEventListener(\'load\', loadExams);')) {
  examsHtml = examsHtml.replace('window.addEventListener(\'load\', loadExams);', exScriptReplacement);
}
writeFile('pages/admin/exams.html', examsHtml);


// ==========================================
// 12. UPDATE pages/teacher/dashboard.html
// ==========================================
let tchDashboard = fs.readFileSync('pages/teacher/dashboard.html', 'utf8');

const tchUserChipTarget = `<div class="user-chip">
            <div class="avatar-circle">MRK</div>
            <div style="font-weight: 600;">Mr. Rajesh Kumar</div>
          </div>`;
const tchUserChipReplacement = `<div class="user-chip">
            <div class="avatar-circle" id="userAvatar">T</div>
            <div style="font-weight: 600;" id="userDisplayName">Teacher Name</div>
          </div>`;
if (tchDashboard.includes(tchUserChipTarget)) {
  tchDashboard = tchDashboard.replace(tchUserChipTarget, tchUserChipReplacement);
}

const tchDashboardScriptTarget = `window.addEventListener('load', () => {
    const students = AppState.getData('lms_students');
    const classes = AppState.getData('lms_classes');
    const asns = AppState.getData('lms_assignments');
    const notices = AppState.getData('lms_notices');

    document.getElementById('students-count').innerText = students.length;
    document.getElementById('classes-count').innerText = classes.length;
    document.getElementById('pending-count').innerText = asns.length;
    document.getElementById('notices-count').innerText = notices.length;
  });`;

const tchDashboardScriptReplacement = `window.addEventListener('load', () => {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];

    document.getElementById('userDisplayName').innerText = currentT.name;
    const nameParts = currentT.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');

    const assignedClass = currentT.classAssigned || 'LKG';

    const students = AppState.getData('lms_students').filter(s => s.class === assignedClass);
    const asns = AppState.getData('lms_assignments').filter(a => a.class === assignedClass);
    const notices = AppState.getData('lms_notices');

    document.getElementById('students-count').innerText = students.length;
    document.getElementById('classes-count').innerText = '1';
    document.getElementById('pending-count').innerText = asns.length;
    document.getElementById('notices-count').innerText = notices.length;

    // Load schedule dynamically for the teacher's class
    const ttKey = 'tt_' + assignedClass.replace(/ /g, '_') + '_A';
    const tt = AppState.getData(ttKey) || {};
    const scheduleList = document.getElementById('today-schedule');
    scheduleList.innerHTML = '';
    
    const timeSlots = [
      '08:00 - 08:45 AM',
      '08:45 - 09:30 AM',
      '09:30 - 10:15 AM',
      '10:15 - 11:00 AM',
      '11:00 - 11:45 AM',
      '11:45 - 12:30 PM',
      '12:30 - 01:15 PM'
    ];
    let slotsFound = 0;
    timeSlots.forEach((slot, pIdx) => {
      const item = tt[\`\${pIdx}_0\`]; // Monday (index 0)
      if (item && item.sub !== '--') {
        slotsFound++;
        scheduleList.innerHTML += \`<li style="padding:10px 0; border-bottom:1px solid var(--border-color)">⏱️ <b>\${slot}</b> | \${assignedClass} | \${item.sub}</li>\`;
      }
    });

    if (slotsFound === 0) {
      scheduleList.innerHTML = \`<li style="padding:10px 0; color:var(--text-muted)">No classes scheduled for today.</li>\`;
    }
  });`;

if (tchDashboard.includes(tchDashboardScriptTarget)) {
  tchDashboard = tchDashboard.replace(tchDashboardScriptTarget, tchDashboardScriptReplacement);
}
writeFile('pages/teacher/dashboard.html', tchDashboard);


// ==========================================
// 13. UPDATE pages/teacher/my-classes.html
// ==========================================
let myClassesHtml = fs.readFileSync('pages/teacher/my-classes.html', 'utf8');
if (myClassesHtml.includes(tchUserChipTarget)) {
  myClassesHtml = myClassesHtml.replace(tchUserChipTarget, tchUserChipReplacement);
}

const myClassesScriptTarget = `window.addEventListener('load', loadMyClasses);

  function loadMyClasses() {
    const classes = AppState.getData('lms_classes');
    const body = document.getElementById('myClassesBody');
    body.innerHTML = '';

    classes.slice(0, 3).forEach(c => {
      body.innerHTML += \`<tr>
        <td><b>\${c.name}</b></td>
        <td>Section A, B</td>
        <td>\${c.students} Students</td>
        <td>
          <button class="btn btn-outline" style="padding:4px 8px;" onclick="viewClass('\${c.name}')">👁️ View Students</button>
        </td>
      </tr>\`;
    });
  }`;

const myClassesScriptReplacement = `window.addEventListener('load', loadMyClasses);

  function loadMyClasses() {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];

    document.getElementById('userDisplayName').innerText = currentT.name;
    const nameParts = currentT.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');

    const assignedClass = currentT.classAssigned || 'LKG';
    const classes = AppState.getData('lms_classes').filter(c => c.name === assignedClass);
    const body = document.getElementById('myClassesBody');
    body.innerHTML = '';

    classes.forEach(c => {
      body.innerHTML += \`<tr>
        <td><b>\${c.name}</b></td>
        <td>\${c.sections ? c.sections.join(', ') : 'A, B'}</td>
        <td>\${c.studentsCount || 40} Students</td>
        <td>
          <button class="btn btn-outline" style="padding:4px 8px;" onclick="viewClass('\${c.name}')">👁️ View Students</button>
        </td>
      </tr>\`;
    });
    });
  }

  function viewClass(className) {
    localStorage.setItem('admin_selected_class', className);
    window.location.href = '../admin/students.html';
  }`;

if (myClassesHtml.includes(myClassesScriptTarget)) {
  myClassesHtml = myClassesHtml.replace(myClassesScriptTarget, myClassesScriptReplacement);
}
writeFile('pages/teacher/my-classes.html', myClassesHtml);

// ==========================================
// 14. UPDATE pages/teacher/attendance.html
// ==========================================
let tchAttendanceHtml = fs.readFileSync('pages/teacher/attendance.html', 'utf8');
if (tchAttendanceHtml.includes(tchUserChipTarget)) {
  tchAttendanceHtml = tchAttendanceHtml.replace(tchUserChipTarget, tchUserChipReplacement);
}

const tchAttScriptTarget = `window.addEventListener('load', loadStudentsForAttendance);`;
const tchAttScriptReplacement = `window.addEventListener('load', () => {
    loadMyProfile();
    loadStudentsForAttendance();
  });

  function loadMyProfile() {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];

    document.getElementById('userDisplayName').innerText = currentT.name;
    const nameParts = currentT.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`;

if (tchAttendanceHtml.includes(tchAttScriptTarget)) {
  tchAttendanceHtml = tchAttendanceHtml.replace(tchAttScriptTarget, tchAttScriptReplacement);
}

const tchAttLoadReplacement = `function loadStudentsForAttendance() {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];
    const assignedClass = currentT.classAssigned || 'LKG';

    const students = AppState.getData('lms_students').filter(s => s.class === assignedClass);
    const body = document.getElementById('attTableBody');
    body.innerHTML = '';

    students.forEach(s => {
      body.innerHTML += \`<tr>
        <td>\${s.id}</td>
        <td><b>\${s.name}</b></td>
        <td>\${s.class}</td>
        <td>\${s.section}</td>
        <td>
          <input type="radio" name="att_\${s.id}" value="Present" checked> Present
          <input type="radio" name="att_\${s.id}" value="Absent" style="margin-left: 15px;"> Absent
        </td>
      </tr>\`;
    });
  }`;
if (tchAttendanceHtml.includes('function loadStudentsForAttendance() {')) {
  tchAttendanceHtml = tchAttendanceHtml.replace(/function loadStudentsForAttendance\(\) \{[\s\S]*?\n  \}/, tchAttLoadReplacement);
}
writeFile('pages/teacher/attendance.html', tchAttendanceHtml);

// ==========================================
// 15. UPDATE pages/teacher/exams.html
// ==========================================
let tchExamsHtml = fs.readFileSync('pages/teacher/exams.html', 'utf8');
if (tchExamsHtml.includes(tchUserChipTarget)) {
  tchExamsHtml = tchExamsHtml.replace(tchUserChipTarget, tchUserChipReplacement);
}

const tchExamsScriptTarget = `window.addEventListener('load', () => {
    loadExams();
    loadExamDropdown();
    loadStudentDropdown();
  });`;

const tchExamsScriptReplacement = `window.addEventListener('load', () => {
    loadMyProfile();
    loadExams();
    loadExamDropdown();
    loadStudentDropdown();
  });

  function loadMyProfile() {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];

    document.getElementById('userDisplayName').innerText = currentT.name;
    const nameParts = currentT.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`;

if (tchExamsHtml.includes(tchExamsScriptTarget)) {
  tchExamsHtml = tchExamsHtml.replace(tchExamsScriptTarget, tchExamsScriptReplacement);
}

const tchExamsDropReplacement = `function loadStudentDropdown() {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];
    const assignedClass = currentT.classAssigned || 'LKG';

    const students = AppState.getData('lms_students').filter(s => s.class === assignedClass);
    const select = document.getElementById('resStudent');
    select.innerHTML = '';
    students.forEach(s => {
      select.innerHTML += \`<option value="\${s.id}">\${s.name} (\${s.id})</option>\`;
    });
  }`;
if (tchExamsHtml.includes('function loadStudentDropdown() {')) {
  tchExamsHtml = tchExamsHtml.replace(/function loadStudentDropdown\(\) \{[\s\S]*?\n  \}/, tchExamsDropReplacement);
}
writeFile('pages/teacher/exams.html', tchExamsHtml);

// ==========================================
// 16. UPDATE pages/teacher/assignments.html
// ==========================================
let tchAssignmentsHtml = fs.readFileSync('pages/teacher/assignments.html', 'utf8');
if (tchAssignmentsHtml.includes(tchUserChipTarget)) {
  tchAssignmentsHtml = tchAssignmentsHtml.replace(tchUserChipTarget, tchUserChipReplacement);
}
if (tchAssignmentsHtml.includes('window.addEventListener(\'load\', loadAssignments);')) {
  tchAssignmentsHtml = tchAssignmentsHtml.replace('window.addEventListener(\'load\', loadAssignments);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadAssignments();
  });

  function loadMyProfile() {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];

    document.getElementById('userDisplayName').innerText = currentT.name;
    const nameParts = currentT.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/teacher/assignments.html', tchAssignmentsHtml);
}

// ==========================================
// 17. UPDATE pages/teacher/study-materials.html
// ==========================================
let tchMaterialsHtml = fs.readFileSync('pages/teacher/study-materials.html', 'utf8');
if (tchMaterialsHtml.includes(tchUserChipTarget)) {
  tchMaterialsHtml = tchMaterialsHtml.replace(tchUserChipTarget, tchUserChipReplacement);
}
if (tchMaterialsHtml.includes('window.addEventListener(\'load\', loadMaterials);')) {
  tchMaterialsHtml = tchMaterialsHtml.replace('window.addEventListener(\'load\', loadMaterials);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadMaterials();
  });

  function loadMyProfile() {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];

    document.getElementById('userDisplayName').innerText = currentT.name;
    const nameParts = currentT.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/teacher/study-materials.html', tchMaterialsHtml);
}

// ==========================================
// 18. UPDATE pages/teacher/profile.html
// ==========================================
let tchProfileHtml = fs.readFileSync('pages/teacher/profile.html', 'utf8');
if (tchProfileHtml.includes(tchUserChipTarget)) {
  tchProfileHtml = tchProfileHtml.replace(tchUserChipTarget, tchUserChipReplacement);
}
if (tchProfileHtml.includes('<script>\n    // Local script code injected per page\n  </script>')) {
  const tchProfileScript = `<script>
      window.addEventListener('load', () => {
        const tId = localStorage.getItem('userId') || 'TCH001';
        const teachers = AppState.getData('lms_teachers');
        const currentT = teachers.find(t => t.id === tId) || teachers[0];

        document.getElementById('userDisplayName').innerText = currentT.name;
        const nameParts = currentT.name.split(' ');
        document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');

        // Render profile fields
        document.getElementById('profName').innerText = currentT.name;
        document.getElementById('profId').innerText = currentT.id;
        document.getElementById('profDept').innerText = currentT.dept;
        document.getElementById('profClass').innerText = currentT.classAssigned || 'None';
        document.getElementById('profPhone').innerText = currentT.phone;
        document.getElementById('profSubjects').innerText = currentT.subjects;
      });
    </script>`;
  tchProfileHtml = tchProfileHtml.replace('<script>\n    // Local script code injected per page\n  </script>', tchProfileScript);
  const profCard = `<div class="card">
      <h3 class="card-title">My Profile Details</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:14px; line-height:2.0;">
        <div>👤 <b>Full Name:</b> <span id="profName"></span></div>
        <div>🔑 <b>Staff ID:</b> <span id="profId"></span></div>
        <div>🏫 <b>Department:</b> <span id="profDept"></span></div>
        <div>🎒 <b>Class Assigned:</b> <span id="profClass"></span></div>
        <div>📞 <b>Phone:</b> <span id="profPhone"></span></div>
        <div>📚 <b>Subjects Taught:</b> <span id="profSubjects"></span></div>
      </div>
    </div>`;
  tchProfileHtml = tchProfileHtml.replace('<div class="content-area">', '<div class="content-area">\n  ' + profCard);
  writeFile('pages/teacher/profile.html', tchProfileHtml);
}

// ==========================================
// 19. UPDATE pages/teacher/messages.html
// ==========================================
let tchMessagesHtml = fs.readFileSync('pages/teacher/messages.html', 'utf8');
if (tchMessagesHtml.includes(tchUserChipTarget)) {
  tchMessagesHtml = tchMessagesHtml.replace(tchUserChipTarget, tchUserChipReplacement);
}
if (tchMessagesHtml.includes('window.addEventListener(\'load\', loadChat);')) {
  tchMessagesHtml = tchMessagesHtml.replace('window.addEventListener(\'load\', loadChat);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadChat();
  });

  function loadMyProfile() {
    const tId = localStorage.getItem('userId') || 'TCH001';
    const teachers = AppState.getData('lms_teachers');
    const currentT = teachers.find(t => t.id === tId) || teachers[0];

    document.getElementById('userDisplayName').innerText = currentT.name;
    const nameParts = currentT.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/teacher/messages.html', tchMessagesHtml);
}


// ==========================================
// 20. UPDATE pages/student/dashboard.html
// ==========================================
let stuDashboard = fs.readFileSync('pages/student/dashboard.html', 'utf8');
const stuUserChipTarget = `<div class="user-chip">
            <div class="avatar-circle">ST</div>
            <div style="font-weight: 600;">Aditya Patel</div>
          </div>`;
const stuUserChipReplacement = `<div class="user-chip">
            <div class="avatar-circle" id="userAvatar">S</div>
            <div style="font-weight: 600;" id="userDisplayName">Student Name</div>
          </div>`;
if (stuDashboard.includes(stuUserChipTarget)) {
  stuDashboard = stuDashboard.replace(stuUserChipTarget, stuUserChipReplacement);
}

const stuDashboardScriptTarget = `window.addEventListener('load', () => {
    const results = AppState.getData('lms_results');
    const asns = AppState.getData('lms_assignments');
    const notices = AppState.getData('lms_notices');

    document.getElementById('results-count').innerText = results.length;
    document.getElementById('assignments-count').innerText = asns.length;
    document.getElementById('notices-count').innerText = notices.length;
  });`;

const stuDashboardScriptReplacement = `window.addEventListener('load', () => {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');

    const results = AppState.getData('lms_results').filter(r => r.stuId === currentS.id);
    const asns = AppState.getData('lms_assignments').filter(a => a.class === currentS.class);
    const notices = AppState.getData('lms_notices');

    document.getElementById('results-count').innerText = results.length;
    document.getElementById('assignments-count').innerText = asns.length;
    document.getElementById('notices-count').innerText = notices.length;
    
    const attCard = document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-value');
    if (attCard) attCard.innerText = (currentS.attendance || 85) + '%';
  });`;

if (stuDashboard.includes(stuDashboardScriptTarget)) {
  stuDashboard = stuDashboard.replace(stuDashboardScriptTarget, stuDashboardScriptReplacement);
}
writeFile('pages/student/dashboard.html', stuDashboard);

// ==========================================
// 21. UPDATE pages/student/profile.html
// ==========================================
let stuProfileHtml = fs.readFileSync('pages/student/profile.html', 'utf8');
if (stuProfileHtml.includes(stuUserChipTarget)) {
  stuProfileHtml = stuProfileHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuProfileHtml.includes('<script>\n    // Local script code injected per page\n  </script>')) {
  const stuProfileScript = `<script>
      window.addEventListener('load', () => {
        const stuId = localStorage.getItem('userId') || 'STU001';
        const students = AppState.getData('lms_students');
        const currentS = students.find(s => s.id === stuId) || students[0];

        document.getElementById('userDisplayName').innerText = currentS.name;
        const nameParts = currentS.name.split(' ');
        document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');

        // Profile details
        document.getElementById('profName').innerText = currentS.name;
        document.getElementById('profId').innerText = currentS.id;
        document.getElementById('profClass').innerText = currentS.class + ' (' + currentS.section + ')';
        document.getElementById('profPhone').innerText = currentS.phone;
        document.getElementById('profParent').innerText = currentS.parent;
        document.getElementById('profAtt').innerText = (currentS.attendance || 85) + '%';
      });
    </script>`;
  stuProfileHtml = stuProfileHtml.replace('<script>\n    // Local script code injected per page\n  </script>', stuProfileScript);
  const stuProfCard = `<div class="card">
      <h3 class="card-title">Academic Profile</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:14px; line-height:2.0;">
        <div>👤 <b>Student Name:</b> <span id="profName"></span></div>
        <div>🔑 <b>Admission ID:</b> <span id="profId"></span></div>
        <div>🏫 <b>Class & Section:</b> <span id="profClass"></span></div>
        <div>📞 <b>Phone Number:</b> <span id="profPhone"></span></div>
        <div>👪 <b>Parent / Guardian:</b> <span id="profParent"></span></div>
        <div>📝 <b>Overall Attendance:</b> <span id="profAtt"></span></div>
      </div>
    </div>`;
  stuProfileHtml = stuProfileHtml.replace('<div class="content-area">', '<div class="content-area">\n  ' + stuProfCard);
  writeFile('pages/student/profile.html', stuProfileHtml);
}

// ==========================================
// 22. UPDATE pages/student/report-card.html
// ==========================================
let reportCardHtml = fs.readFileSync('pages/student/report-card.html', 'utf8');
if (reportCardHtml.includes('<script>\n    // Local script code injected per page\n  </script>')) {
  const repScript = `<script>
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
    </script>`;
  reportCardHtml = reportCardHtml.replace('<script>\n    // Local script code injected per page\n  </script>', repScript);
  writeFile('pages/student/report-card.html', reportCardHtml);
}

// ==========================================
// 23. UPDATE pages/student/results.html
// ==========================================
let stuResultsHtml = fs.readFileSync('pages/student/results.html', 'utf8');
if (stuResultsHtml.includes(stuUserChipTarget)) {
  stuResultsHtml = stuResultsHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuResultsHtml.includes('window.addEventListener(\'load\', loadResults);')) {
  stuResultsHtml = stuResultsHtml.replace('window.addEventListener(\'load\', loadResults);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadResults();
  });

  function loadMyProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
}

const stuResRenderTarget2 = `function loadResults() {
    const list = AppState.getData('lms_results');
    const body = document.getElementById('resultsTableBody');
    body.innerHTML = '';
    list.forEach(r => {
      body.innerHTML += \`<tr>
        <td><b>\${r.exam}</b></td>
        <td>\${r.subject}</td>
        <td>\${r.obtained} / \${r.max}</td>
        <td><b>\${r.grade}</b></td>
      </tr>\`;
    });
  }`;
const stuResRenderReplacement2 = `function loadResults() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const list = AppState.getData('lms_results').filter(r => r.stuId === stuId);
    const body = document.getElementById('resultsTableBody');
    body.innerHTML = '';
    if (list.length === 0) {
      body.innerHTML = '<tr><td colspan="4" style="text-align:center;">No results published yet.</td></tr>';
      return;
    }
    list.forEach(r => {
      body.innerHTML += \`<tr>
        <td><b>\${r.exam}</b></td>
        <td>\${r.subject}</td>
        <td>\${r.obtained} / \${r.max}</td>
        <td><b>\${r.grade}</b></td>
      </tr>\`;
    });
  }`;
if (stuResultsHtml.includes(stuResRenderTarget2)) {
  stuResultsHtml = stuResultsHtml.replace(stuResRenderTarget2, stuResRenderReplacement2);
}
writeFile('pages/student/results.html', stuResultsHtml);

// ==========================================
// 24. UPDATE pages/student/timetable.html
// ==========================================
let stuTimetableHtml = fs.readFileSync('pages/student/timetable.html', 'utf8');
if (stuTimetableHtml.includes(stuUserChipTarget)) {
  stuTimetableHtml = stuTimetableHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuTimetableHtml.includes('window.addEventListener(\'load\', loadTimetable);')) {
  stuTimetableHtml = stuTimetableHtml.replace('window.addEventListener(\'load\', loadTimetable);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadTimetable();
  });

  function loadMyProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
}

const stuTtLoadReplacement2 = `function loadTimetable() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];
    const assignedClass = currentS.class;

    const key = 'tt_' + assignedClass.replace(/ /g, '_') + '_' + currentS.section;
    const tt = AppState.getData(key) || {};
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

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

    timeSlots.forEach((slot, pIdx) => {
      let rowHtml = \`<tr><td><b>\${slot}</b></td>\`;
      days.forEach((day, dIdx) => {
        const item = tt[\`\${pIdx}_\${dIdx}\`] || { sub: '--', tch: '--' };
        rowHtml += \`<td>
          <div><b>\${item.sub}</b></div>
          <div style="font-size:10px; color:var(--text-muted);">\${item.tch}</div>
        </td>\`;
      });
      rowHtml += \`</tr>\`;
      tbody.innerHTML += rowHtml;
    });
  }`;
if (stuTimetableHtml.includes('function loadTimetable() {')) {
  stuTimetableHtml = stuTimetableHtml.replace(/function loadTimetable\(\) \{[\s\S]*?\n  \}/, stuTtLoadReplacement2);
}
writeFile('pages/student/timetable.html', stuTimetableHtml);

// ==========================================
// 25. UPDATE pages/student/attendance.html
// ==========================================
let stuAttendanceHtml = fs.readFileSync('pages/student/attendance.html', 'utf8');
if (stuAttendanceHtml.includes(stuUserChipTarget)) {
  stuAttendanceHtml = stuAttendanceHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuAttendanceHtml.includes('window.addEventListener(\'load\', loadAttendance);')) {
  stuAttendanceHtml = stuAttendanceHtml.replace('window.addEventListener(\'load\', loadAttendance);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadAttendance();
  });

  function loadMyProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  
  stuAttendanceHtml = stuAttendanceHtml.replace('92%', '\${currentS.attendance || 85}%');
  writeFile('pages/student/attendance.html', stuAttendanceHtml);
}

// ==========================================
// 26. UPDATE pages/student/subjects.html
// ==========================================
let stuSubjectsHtml = fs.readFileSync('pages/student/subjects.html', 'utf8');
if (stuSubjectsHtml.includes(stuUserChipTarget)) {
  stuSubjectsHtml = stuSubjectsHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuSubjectsHtml.includes('window.addEventListener(\'load\', loadSubjects);')) {
  stuSubjectsHtml = stuSubjectsHtml.replace('window.addEventListener(\'load\', loadSubjects);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadSubjects();
  });

  function loadMyProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
}

const stuSubLoadReplacement2 = `function loadSubjects() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    const list = AppState.getData('lms_subjects').filter(s => s.class === currentS.class);
    const body = document.getElementById('subjectsBody');
    body.innerHTML = '';

    if (list.length === 0) {
      body.innerHTML = '<tr><td colspan="4" style="text-align:center;">No subjects mapped to this class.</td></tr>';
      return;
    }

    list.forEach(s => {
      body.innerHTML += \`<tr>
        <td><code>\${s.code}</code></td>
        <td><b>\${s.name}</b></td>
        <td>\${s.periods} Periods / Week</td>
        <td>\${s.teacher || 'Assigned Staff'}</td>
      </tr>\`;
    });
  }`;
if (stuSubjectsHtml.includes('function loadSubjects() {')) {
  stuSubjectsHtml = stuSubjectsHtml.replace(/function loadSubjects\(\) \{[\s\S]*?\n  \}/, stuSubLoadReplacement2);
}
writeFile('pages/student/subjects.html', stuSubjectsHtml);

// ==========================================
// 27. UPDATE pages/student/assignments.html
// ==========================================
let stuAssignmentsHtml = fs.readFileSync('pages/student/assignments.html', 'utf8');
if (stuAssignmentsHtml.includes(stuUserChipTarget)) {
  stuAssignmentsHtml = stuAssignmentsHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuAssignmentsHtml.includes('window.addEventListener(\'load\', loadAssignments);')) {
  stuAssignmentsHtml = stuAssignmentsHtml.replace('window.addEventListener(\'load\', loadAssignments);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadAssignments();
  });

  function loadMyProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/student/assignments.html', stuAssignmentsHtml);
}

// ==========================================
// 28. UPDATE pages/student/study-materials.html
// ==========================================
let stuMaterialsHtml = fs.readFileSync('pages/student/study-materials.html', 'utf8');
if (stuMaterialsHtml.includes(stuUserChipTarget)) {
  stuMaterialsHtml = stuMaterialsHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuMaterialsHtml.includes('window.addEventListener(\'load\', loadMaterials);')) {
  stuMaterialsHtml = stuMaterialsHtml.replace('window.addEventListener(\'load\', loadMaterials);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadMaterials();
  });

  function loadMyProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/student/study-materials.html', stuMaterialsHtml);
}

// ==========================================
// 29. UPDATE pages/student/chat.html
// ==========================================
let stuChatHtml = fs.readFileSync('pages/student/chat.html', 'utf8');
if (stuChatHtml.includes(stuUserChipTarget)) {
  stuChatHtml = stuChatHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuChatHtml.includes('window.addEventListener(\'load\', loadChat);')) {
  stuChatHtml = stuChatHtml.replace('window.addEventListener(\'load\', loadChat);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadChat();
  });

  function loadMyProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/student/chat.html', stuChatHtml);
}

// ==========================================
// 30. UPDATE pages/student/online-tests.html
// ==========================================
let stuTestsHtml = fs.readFileSync('pages/student/online-tests.html', 'utf8');
if (stuTestsHtml.includes(stuUserChipTarget)) {
  stuTestsHtml = stuTestsHtml.replace(stuUserChipTarget, stuUserChipReplacement);
}
if (stuTestsHtml.includes('window.addEventListener(\'load\', () => {')) {
  stuTestsHtml = stuTestsHtml.replace('window.addEventListener(\'load\', () => {', `window.addEventListener('load', () => {
    loadMyProfile();`);
}
if (!stuTestsHtml.includes('function loadMyProfile()')) {
  stuTestsHtml = stuTestsHtml.replace('// Dynamic handlers', `function loadMyProfile() {
    const stuId = localStorage.getItem('userId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === stuId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.name;
    const nameParts = currentS.name.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }
  // Dynamic handlers`);
  writeFile('pages/student/online-tests.html', stuTestsHtml);
}


// ==========================================
// 31. UPDATE pages/parent/dashboard.html
// ==========================================
let parentDashboard = fs.readFileSync('pages/parent/dashboard.html', 'utf8');
const parentUserChipTarget = `<div class="user-chip">
            <div class="avatar-circle">P</div>
            <div style="font-weight: 600;">Suresh Patel</div>
          </div>`;
const parentUserChipReplacement = `<div class="user-chip">
            <div class="avatar-circle" id="userAvatar">P</div>
            <div style="font-weight: 600;" id="userDisplayName">Parent Name</div>
          </div>`;
if (parentDashboard.includes(parentUserChipTarget)) {
  parentDashboard = parentDashboard.replace(parentUserChipTarget, parentUserChipReplacement);
}

const parentDashboardScriptTarget = `window.addEventListener('load', () => {
    const notices = AppState.getData('lms_notices');
    document.getElementById('notices-count').innerText = notices.length;
  });`;

const parentDashboardScriptReplacement = `window.addEventListener('load', () => {
    const pId = localStorage.getItem('userId') || 'PAR001';
    const cId = localStorage.getItem('childId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === cId) || students.find(s => s.parentUsername === pId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.parent;
    const nameParts = currentS.parent.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');

    const notices = AppState.getData('lms_notices');
    document.getElementById('notices-count').innerText = notices.length;

    document.getElementById('childName').innerText = currentS.name;
    document.getElementById('childClass').innerText = currentS.class + ' (' + currentS.section + ')';
    document.getElementById('childAttendance').innerText = (currentS.attendance || 85) + '%';
  });`;

if (parentDashboard.includes(parentDashboardScriptTarget)) {
  parentDashboard = parentDashboard.replace(parentDashboardScriptTarget, parentDashboardScriptReplacement);
  parentDashboard = parentDashboard.replace('<h3>Total Notices</h3>', '<h3>Child Name</h3><div class="stat-value" id="childName" style="font-size:18px;">--</div>');
  parentDashboard = parentDashboard.replace('<h3>Outstanding Fees</h3>', '<h3>Child Class</h3><div class="stat-value" id="childClass" style="font-size:18px;">--</div>');
  parentDashboard = parentDashboard.replace('<h3>Child Attendance</h3>', '<h3>Child Attendance</h3><div class="stat-value" id="childAttendance" style="font-size:18px;">--</div>');
  writeFile('pages/parent/dashboard.html', parentDashboard);
}

// ==========================================
// 32. UPDATE pages/parent/profile.html
// ==========================================
let parentProfileHtml = fs.readFileSync('pages/parent/profile.html', 'utf8');
if (parentProfileHtml.includes(parentUserChipTarget)) {
  parentProfileHtml = parentProfileHtml.replace(parentUserChipTarget, parentUserChipReplacement);
}
if (parentProfileHtml.includes('<script>\n    // Local script code injected per page\n  </script>')) {
  const parentProfileScript = `<script>
      window.addEventListener('load', () => {
        const pId = localStorage.getItem('userId') || 'PAR001';
        const cId = localStorage.getItem('childId') || 'STU001';
        const students = AppState.getData('lms_students');
        const currentS = students.find(s => s.id === cId) || students[0];

        document.getElementById('userDisplayName').innerText = currentS.parent;
        const nameParts = currentS.parent.split(' ');
        document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');

        document.getElementById('profParentName').innerText = currentS.parent;
        document.getElementById('profParentUser').innerText = currentS.parentUsername;
        document.getElementById('profChildName').innerText = currentS.name;
        document.getElementById('profChildId').innerText = currentS.id;
        document.getElementById('profChildClass').innerText = currentS.class + ' (' + currentS.section + ')';
        document.getElementById('profPhone').innerText = currentS.phone;
      });
    </script>`;
  parentProfileHtml = parentProfileHtml.replace('<script>\n    // Local script code injected per page\n  </script>', parentProfileScript);
  const parentProfCard = `<div class="card">
      <h3 class="card-title">Parental Profile Details</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:14px; line-height:2.0;">
        <div>👪 <b>Guardian Name:</b> <span id="profParentName"></span></div>
        <div>🔑 <b>Username ID:</b> <span id="profParentUser"></span></div>
        <div>🎓 <b>Associated Child:</b> <span id="profChildName"></span></div>
        <div>🔑 <b>Child Admission ID:</b> <span id="profChildId"></span></div>
        <div>🏫 <b>Child Class:</b> <span id="profChildClass"></span></div>
        <div>📞 <b>Emergency Phone:</b> <span id="profPhone"></span></div>
      </div>
    </div>`;
  parentProfileHtml = parentProfileHtml.replace('<div class="content-area">', '<div class="content-area">\n  ' + parentProfCard);
  writeFile('pages/parent/profile.html', parentProfileHtml);
}

// ==========================================
// 33. UPDATE pages/parent/attendance.html
// ==========================================
let parentAttHtml = fs.readFileSync('pages/parent/attendance.html', 'utf8');
if (parentAttHtml.includes(parentUserChipTarget)) {
  parentAttHtml = parentAttHtml.replace(parentUserChipTarget, parentUserChipReplacement);
}
if (parentAttHtml.includes('window.addEventListener(\'load\', loadAttendance);')) {
  parentAttHtml = parentAttHtml.replace('window.addEventListener(\'load\', loadAttendance);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadAttendance();
  });

  function loadMyProfile() {
    const pId = localStorage.getItem('userId') || 'PAR001';
    const cId = localStorage.getItem('childId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === cId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.parent;
    const nameParts = currentS.parent.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/parent/attendance.html', parentAttHtml);
}

// ==========================================
// 34. UPDATE pages/parent/results.html
// ==========================================
let parentResultsHtml = fs.readFileSync('pages/parent/results.html', 'utf8');
if (parentResultsHtml.includes(parentUserChipTarget)) {
  parentResultsHtml = parentResultsHtml.replace(parentUserChipTarget, parentUserChipReplacement);
}
if (parentResultsHtml.includes('window.addEventListener(\'load\', loadResults);')) {
  parentResultsHtml = parentResultsHtml.replace('window.addEventListener(\'load\', loadResults);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadResults();
  });

  function loadMyProfile() {
    const pId = localStorage.getItem('userId') || 'PAR001';
    const cId = localStorage.getItem('childId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === cId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.parent;
    const nameParts = currentS.parent.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
}

const parentResLoadReplacement2 = `function loadResults() {
    const cId = localStorage.getItem('childId') || 'STU001';
    const list = AppState.getData('lms_results').filter(r => r.stuId === cId);
    const body = document.getElementById('resultsTableBody');
    body.innerHTML = '';
    if (list.length === 0) {
      body.innerHTML = '<tr><td colspan="4" style="text-align:center;">No results published yet.</td></tr>';
      return;
    }
    list.forEach(r => {
      body.innerHTML += \`<tr>
        <td><b>\${r.exam}</b></td>
        <td>\${r.subject}</td>
        <td>\${r.obtained} / \${r.max}</td>
        <td><b>\${r.grade}</b></td>
      </tr>\`;
    });
  }`;
const parentResRenderReplacement2 = `function loadResults() {
    const cId = localStorage.getItem('childId') || 'STU001';
    const list = AppState.getData('lms_results').filter(r => r.stuId === cId);
    const body = document.getElementById('resultsTableBody');
    body.innerHTML = '';
    if (list.length === 0) {
      body.innerHTML = '<tr><td colspan="4" style="text-align:center;">No results published yet.</td></tr>';
      return;
    }
    list.forEach(r => {
      body.innerHTML += \`<tr>
        <td><b>\${r.exam}</b></td>
        <td>\${r.subject}</td>
        <td>\${r.obtained} / \${r.max}</td>
        <td><b>\${r.grade}</b></td>
      </tr>\`;
    });
  }`;
if (parentResultsHtml.includes(parentResLoadReplacement2)) {
  parentResultsHtml = parentResultsHtml.replace(parentResLoadReplacement2, parentResRenderReplacement2);
}
writeFile('pages/parent/results.html', parentResultsHtml);

// ==========================================
// 35. UPDATE pages/parent/homework.html
// ==========================================
let parentHomeworkHtml = fs.readFileSync('pages/parent/homework.html', 'utf8');
if (parentHomeworkHtml.includes(parentUserChipTarget)) {
  parentHomeworkHtml = parentHomeworkHtml.replace(parentUserChipTarget, parentUserChipReplacement);
}
if (parentHomeworkHtml.includes('window.addEventListener(\'load\', loadHomework);')) {
  parentHomeworkHtml = parentHomeworkHtml.replace('window.addEventListener(\'load\', loadHomework);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadHomework();
  });

  function loadMyProfile() {
    const pId = localStorage.getItem('userId') || 'PAR001';
    const cId = localStorage.getItem('childId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === cId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.parent;
    const nameParts = currentS.parent.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/parent/homework.html', parentHomeworkHtml);
}

// ==========================================
// 36. UPDATE pages/parent/messages.html
// ==========================================
let parentMessagesHtml = fs.readFileSync('pages/parent/messages.html', 'utf8');
if (parentMessagesHtml.includes(parentUserChipTarget)) {
  parentMessagesHtml = parentMessagesHtml.replace(parentUserChipTarget, parentUserChipReplacement);
}
if (parentMessagesHtml.includes('window.addEventListener(\'load\', loadChat);')) {
  parentMessagesHtml = parentMessagesHtml.replace('window.addEventListener(\'load\', loadChat);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadChat();
  });

  function loadMyProfile() {
    const pId = localStorage.getItem('userId') || 'PAR001';
    const cId = localStorage.getItem('childId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === cId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.parent;
    const nameParts = currentS.parent.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
  }`);
  writeFile('pages/parent/messages.html', parentMessagesHtml);
}

// ==========================================
// 37. UPDATE pages/parent/fees.html
// ==========================================
let parentFeesHtml = fs.readFileSync('pages/parent/fees.html', 'utf8');
if (parentFeesHtml.includes(parentUserChipTarget)) {
  parentFeesHtml = parentFeesHtml.replace(parentUserChipTarget, parentUserChipReplacement);
}
if (parentFeesHtml.includes('window.addEventListener(\'load\', loadFees);')) {
  parentFeesHtml = parentFeesHtml.replace('window.addEventListener(\'load\', loadFees);', `window.addEventListener('load', () => {
    loadMyProfile();
    loadFees();
  });

  function loadMyProfile() {
    const pId = localStorage.getItem('userId') || 'PAR001';
    const cId = localStorage.getItem('childId') || 'STU001';
    const students = AppState.getData('lms_students');
    const currentS = students.find(s => s.id === cId) || students[0];

    document.getElementById('userDisplayName').innerText = currentS.parent;
    const nameParts = currentS.parent.split(' ');
    document.getElementById('userAvatar').innerText = nameParts.map(p => p[0]).join('');
    
    const feeBadge = document.querySelector('.card .badge');
    if (feeBadge) {
      feeBadge.innerText = currentS.fee;
      feeBadge.className = 'badge ' + (currentS.fee === 'Paid' ? 'badge-success' : (currentS.fee === 'Partial' ? 'badge-warning' : 'badge-danger'));
    }
  }`);
  writeFile('pages/parent/fees.html', parentFeesHtml);
}

console.log('--- ALL FILES WRITTEN SUCCESSFULLY ---');
