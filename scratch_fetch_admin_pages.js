const http = require('http');

const adminPages = [
  'dashboard.html',
  'students.html',
  'teachers.html',
  'parents.html',
  'classes.html',
  'subjects.html',
  'timetable.html',
  'attendance.html',
  'exams.html',
  'assignments.html',
  'results.html',
  'fees.html',
  'library.html',
  'transport.html',
  'notifications.html',
  'analytics.html',
  'ai-tools.html',
  'settings.html'
];

let checked = 0;
adminPages.forEach(page => {
  const url = `http://localhost:3000/pages/admin/${page}`;
  http.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`❌ Page failed to load [${page}]: Status Code = ${res.statusCode}`);
    } else {
      console.log(`✔ Page loaded successfully [${page}]`);
    }
    checked++;
    if (checked === adminPages.length) {
      console.log('All checks finished.');
    }
  }).on('error', (err) => {
    console.error(`❌ Connection failed for [${page}]: ${err.message}`);
    checked++;
    if (checked === adminPages.length) {
      console.log('All checks finished.');
    }
  });
});
