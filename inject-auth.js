/**
 * Inject auth-check.js into all portal pages (teacher/student/parent/admin)
 * Run: node inject-auth.js
 */
const fs = require('fs');
const path = require('path');

const portalDirs = [
  path.join(__dirname, 'pages', 'admin'),
  path.join(__dirname, 'pages', 'teacher'),
  path.join(__dirname, 'pages', 'student'),
  path.join(__dirname, 'pages', 'parent'),
];

let updated = 0;
let skipped = 0;

portalDirs.forEach(dir => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    let html = fs.readFileSync(fullPath, 'utf8');

    // Already has auth-check?
    if (html.includes('auth-check.js')) {
      console.log(`  SKIP (already has): ${dir.split(path.sep).pop()}/${file}`);
      skipped++;
      return;
    }

    // Ensure App.logout() path is correct for pages/role/file.html
    // (depth=2 so ../../index.html is correct)
    
    // Insert auth-check.js AFTER app.js, before closing </body>
    if (html.includes('../../js/app.js')) {
      html = html.replace(
        '<script src="../../js/app.js"></script>',
        '<script src="../../js/app.js"></script>\n  <script src="../../js/auth-check.js"></script>'
      );
      fs.writeFileSync(fullPath, html, 'utf8');
      console.log(`  UPDATED: ${dir.split(path.sep).pop()}/${file}`);
      updated++;
    } else {
      // Inject before </body>
      html = html.replace('</body>', '  <script src="../../js/app.js"></script>\n  <script src="../../js/auth-check.js"></script>\n</body>');
      fs.writeFileSync(fullPath, html, 'utf8');
      console.log(`  ADDED: ${dir.split(path.sep).pop()}/${file}`);
      updated++;
    }
  });
});

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
