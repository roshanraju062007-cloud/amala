/* EduSphere LMS Shared Utilities with LocalStorage State Management */
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
    toast.innerHTML = `<span>${msg}</span>`;
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
