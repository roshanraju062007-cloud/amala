const fs = require('fs');

// Path to app.js
const appJsPath = 'js/app.js';

// Read existing app.js
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Replacement chunk for AppState initial data
const targetStateCode = `    if (!localStorage.getItem('lms_students')) {
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
    }`;

const expandedStateCode = `    if (!localStorage.getItem('lms_students')) {
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
        { id: 'TCH001', name: 'Rajesh Kumar', dept: 'Mathematics', subjects: 'Algebra, Calculus', phone: '+91 9441234567', status: 'Full-Time' },
        { id: 'TCH002', name: 'Priya Sharma', dept: 'Science', subjects: 'Physics', phone: '+91 9441112223', status: 'Full-Time' },
        { id: 'TCH003', name: 'Alok Dixit', dept: 'Science', subjects: 'Chemistry', phone: '+91 9445556667', status: 'Full-Time' },
        { id: 'TCH004', name: 'Sumita Roy', dept: 'English', subjects: 'Literature, Grammar', phone: '+91 9447778889', status: 'Full-Time' },
        { id: 'TCH005', name: 'Anita Vyas', dept: 'Science', subjects: 'Biology', phone: '+91 9448889990', status: 'Full-Time' },
        { id: 'TCH006', name: 'Pavan Gupta', dept: 'Social Science', subjects: 'History, Civics', phone: '+91 9449990001', status: 'Full-Time' },
        { id: 'TCH007', name: 'Mary L.', dept: 'Pre-Primary', subjects: 'Alphabets, EVS', phone: '+91 9442223334', status: 'Full-Time' },
        { id: 'TCH008', name: 'Gopal Varma', dept: 'Languages', subjects: 'Hindi', phone: '+91 9443334445', status: 'Full-Time' },
        { id: 'TCH009', name: 'Shanthi R.', dept: 'Languages', subjects: 'Tamil', phone: '+91 9444445556', status: 'Full-Time' },
        { id: 'TCH010', name: 'Wilson Joseph', dept: 'Computers', subjects: 'Computer Science, Python', phone: '+91 9446667778', status: 'Full-Time' },
        { id: 'TCH011', name: 'Kavitha M.', dept: 'Arts & Music', subjects: 'Drawing, Rhymes', phone: '+91 9447773331', status: 'Full-Time' },
        { id: 'TCH012', name: 'Devendra Shah', dept: 'Commerce', subjects: 'Accountancy, Business', phone: '+91 9448884442', status: 'Full-Time' },
        { id: 'TCH013', name: 'Meera Nair', dept: 'Commerce', subjects: 'Economics', phone: '+91 9449995553', status: 'Full-Time' },
        { id: 'TCH014', name: 'Rahul Sen', dept: 'Social Science', subjects: 'History, Geography', phone: '+91 9441113332', status: 'Full-Time' },
        { id: 'TCH015', name: 'Neha Patil', dept: 'Social Science', subjects: 'Sociology, Political Sc.', phone: '+91 9442224443', status: 'Full-Time' }
      ]));
    }
    if (!localStorage.getItem('lms_classes')) {
      localStorage.setItem('lms_classes', JSON.stringify([
        { name: 'LKG', sections: ['A', 'B'], teacher: 'Mrs. Mary L.', students: 68 },
        { name: 'UKG', sections: ['A', 'B', 'C'], teacher: 'Mrs. Jane D.', students: 95 },
        { name: '10th Standard', sections: ['A', 'B', 'C', 'D'], teacher: 'Mr. Rajesh Kumar', students: 152 },
        { name: '11th Science', sections: ['A', 'B'], teacher: 'Mrs. Priya Sharma', students: 82 },
        { name: '11th Commerce', sections: ['A', 'B'], teacher: 'Mr. Devendra Shah', students: 74 },
        { name: '11th Arts', sections: ['A'], teacher: 'Mrs. Neha Patil', students: 40 },
        { name: '12th Science', sections: ['A', 'B'], teacher: 'Mrs. Priya Sharma', students: 82 },
        { name: '12th Commerce', sections: ['A', 'B'], teacher: 'Mr. Devendra Shah', students: 72 },
        { name: '12th Arts', sections: ['A'], teacher: 'Mrs. Neha Patil', students: 38 }
      ]));
    }
    if (!localStorage.getItem('lms_subjects')) {
      localStorage.setItem('lms_subjects', JSON.stringify([
        // 10th Standard Subjects (6 Subjects assigned to 6 distinct teachers)
        { code: 'MAT101', name: 'Mathematics', class: '10th Standard', periods: 6, type: 'Core', teacher: 'Rajesh Kumar' },
        { code: 'SCI101', name: 'Science', class: '10th Standard', periods: 5, type: 'Core', teacher: 'Priya Sharma' },
        { code: 'ENG102', name: 'English Language', class: '10th Standard', periods: 4, type: 'Language', teacher: 'Sumita Roy' },
        { code: 'SOC101', name: 'Social Science', class: '10th Standard', periods: 5, type: 'Core', teacher: 'Pavan Gupta' },
        { code: 'HIN101', name: 'Hindi Language', class: '10th Standard', periods: 4, type: 'Language', teacher: 'Gopal Varma' },
        { code: 'CSC101', name: 'Computer Science', class: '10th Standard', periods: 4, type: 'Core', teacher: 'Wilson Joseph' },

        // 12th Science Subjects (6 Subjects assigned to 6 distinct teachers)
        { code: 'MAT121', name: 'Mathematics', class: '12th Science', periods: 6, type: 'Core', teacher: 'Rajesh Kumar' },
        { code: 'PHY121', name: 'Physics', class: '12th Science', periods: 5, type: 'Core', teacher: 'Priya Sharma' },
        { code: 'CHE121', name: 'Chemistry', class: '12th Science', periods: 5, type: 'Core', teacher: 'Alok Dixit' },
        { code: 'BIO121', name: 'Biology', class: '12th Science', periods: 5, type: 'Core', teacher: 'Anita Vyas' },
        { code: 'ENG122', name: 'English Literature', class: '12th Science', periods: 4, type: 'Language', teacher: 'Sumita Roy' },
        { code: 'CSC121', name: 'Computer Science', class: '12th Science', periods: 4, type: 'Core', teacher: 'Wilson Joseph' },

        // 12th Commerce Subjects (6 Subjects assigned to 5-6 distinct teachers)
        { code: 'ACC121', name: 'Accountancy', class: '12th Commerce', periods: 6, type: 'Core', teacher: 'Devendra Shah' },
        { code: 'BST121', name: 'Business Studies', class: '12th Commerce', periods: 5, type: 'Core', teacher: 'Devendra Shah' },
        { code: 'ECO121', name: 'Economics', class: '12th Commerce', periods: 5, type: 'Core', teacher: 'Meera Nair' },
        { code: 'MAT122', name: 'Mathematics', class: '12th Commerce', periods: 5, type: 'Core', teacher: 'Rajesh Kumar' },
        { code: 'ENG123', name: 'English Language', class: '12th Commerce', periods: 4, type: 'Language', teacher: 'Sumita Roy' },
        { code: 'HIN122', name: 'Hindi Language', class: '12th Commerce', periods: 4, type: 'Language', teacher: 'Gopal Varma' },

        // 12th Arts Subjects (6 Subjects assigned to 5-6 distinct teachers)
        { code: 'HIS121', name: 'History', class: '12th Arts', periods: 5, type: 'Core', teacher: 'Rahul Sen' },
        { code: 'GEO121', name: 'Geography', class: '12th Arts', periods: 5, type: 'Core', teacher: 'Neha Patil' },
        { code: 'POL121', name: 'Political Science', class: '12th Arts', periods: 5, type: 'Core', teacher: 'Pavan Gupta' },
        { code: 'SOC121', name: 'Sociology', class: '12th Arts', periods: 5, type: 'Core', teacher: 'Neha Patil' },
        { code: 'ECO122', name: 'Economics', class: '12th Arts', periods: 5, type: 'Core', teacher: 'Meera Nair' },
        { code: 'ENG124', name: 'English Literature', class: '12th Arts', periods: 4, type: 'Language', teacher: 'Sumita Roy' },

        // LKG Subjects (5 Subjects assigned to 4 distinct teachers)
        { code: 'LKG_RHY', name: 'Rhymes & Singing', class: 'LKG', periods: 4, type: 'Core', teacher: 'Kavitha M.' },
        { code: 'LKG_ALP', name: 'Alphabet Writing', class: 'LKG', periods: 5, type: 'Core', teacher: 'Mary L.' },
        { code: 'LKG_DRW', name: 'Drawing & Coloring', class: 'LKG', periods: 4, type: 'Core', teacher: 'Mary L.' },
        { code: 'LKG_ARI', name: 'Numbers & Arithmetic', class: 'LKG', periods: 5, type: 'Core', teacher: 'Kavitha M.' },
        { code: 'LKG_STY', name: 'Storytelling', class: 'LKG', periods: 4, type: 'Core', teacher: 'Sumita Roy' }
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
        { stuId: 'ADM2026001', exam: 'Quarterly Examination', subject: 'Physics', max: 100, obtained: 88, grade: 'A', remarks: 'Good progress' },
        { stuId: 'ADM2026001', exam: 'Quarterly Examination', subject: 'English Language', max: 100, obtained: 91, grade: 'A+', remarks: 'Excellent communication' },
        { stuId: 'ADM2026001', exam: 'Quarterly Examination', subject: 'Science', max: 100, obtained: 85, grade: 'A', remarks: 'Strong core concept knowledge' },
        { stuId: 'ADM2026001', exam: 'Quarterly Examination', subject: 'Social Science', max: 100, obtained: 92, grade: 'A+', remarks: 'Excellent representation' },
        { stuId: 'ADM2026001', exam: 'Quarterly Examination', subject: 'Computer Science', max: 100, obtained: 96, grade: 'A+', remarks: 'Top performer in programming' }
      ]));
    }`;

// Replace in appJsContent
appJsContent = appJsContent.replace(targetStateCode, expandedStateCode);
fs.writeFileSync(appJsPath, appJsContent, 'utf8');
console.log('js/app.js updated successfully with 15+ teachers and subjects assigned.');

// Also update report-card.html to list all 6 subjects
const reportCardPath = 'pages/student/report-card.html';
const reportCardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Amala HSS Report Card</title>
  <style>
    body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.5; }
    .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 25px; }
    .school-title { font-size: 26px; font-weight: 800; }
    .student-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
    .marks-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .marks-table th, .marks-table td { border: 1px solid #333; padding: 10px; text-align: center; }
    .signatures { display: flex; justify-content: space-between; margin-top: 80px; }
    .sig-line { width: 150px; border-top: 1px solid #000; text-align: center; font-size: 13px; padding-top: 5px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:20px;">
    <button onclick="window.print()" style="padding:10px 20px; background-color:#4F46E5; color:white; border:none; cursor:pointer;">Print / Save PDF</button>
    <button onclick="window.history.back()" style="padding:10px 20px; background:none; border:1px solid #ccc; cursor:pointer;">Back</button>
  </div>

  <div class="header">
    <div class="school-title">AMALA HIGHER SECONDARY SCHOOL</div>
    <div style="font-size:12px;">ESTD: 1977 | Affiliation Board No: 3701</div>
    <h2 style="margin-top:15px; text-transform:uppercase;">Student Progress Report</h2>
  </div>

  <div class="student-details">
    <div>
      <p><b>Name:</b> Aditya Patel</p>
      <p><b>Class / Section:</b> Class 10-A</p>
      <p><b>Roll Number:</b> 12</p>
    </div>
    <div>
      <p><b>Admission Number:</b> ADM2026001</p>
      <p><b>Father Name:</b> Suresh Patel</p>
      <p><b>Academic Year:</b> 2026 - 2027</p>
    </div>
  </div>

  <table class="marks-table">
    <thead>
      <tr><th>Subject</th><th>Assigned Teacher</th><th>Maximum Marks</th><th>Marks Obtained</th><th>Grade</th><th>Remarks</th></tr>
    </thead>
    <tbody>
      <tr><td>Mathematics</td><td>Mr. Rajesh Kumar</td><td>100</td><td>95</td><td>A+</td><td>Outstanding</td></tr>
      <tr><td>Science</td><td>Mrs. Priya Sharma</td><td>100</td><td>85</td><td>A</td><td>Strong core concepts</td></tr>
      <tr><td>English Language</td><td>Mrs. Sumita Roy</td><td>100</td><td>91</td><td>A+</td><td>Excellent</td></tr>
      <tr><td>Social Science</td><td>Mr. Pavan Gupta</td><td>100</td><td>92</td><td>A+</td><td>Excellent work</td></tr>
      <tr><td>Hindi Language</td><td>Mr. Gopal Varma</td><td>100</td><td>80</td><td>A</td><td>Good progress</td></tr>
      <tr><td>Computer Science</td><td>Mr. Wilson Joseph</td><td>100</td><td>96</td><td>A+</td><td>Top coder</td></tr>
      <tr style="font-weight:bold;"><td>GRAND TOTAL</td><td>--</td><td>600</td><td>539</td><td>89.8%</td><td>PASSED</td></tr>
    </tbody>
  </table>

  <div class="signatures">
    <div>
      <div class="sig-line">Class Teacher</div>
    </div>
    <div>
      <div class="sig-line">Principal Signature</div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(reportCardPath, reportCardHtml, 'utf8');
console.log('pages/student/report-card.html updated with all 6 subject teachers and scores.');
