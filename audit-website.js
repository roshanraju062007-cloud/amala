/**
 * Full Website Audit Script for EduSphere LMS
 * Checks every HTML file for common errors and reports them
 * Run: node audit-website.js
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const issues = [];

function check(file, html, label) {
  // 1. Check app.js is loaded
  if (!html.includes('app.js')) {
    issues.push(`[MISSING app.js] ${label}`);
  }
  // 2. Check auth-check.js is loaded (for portal pages only)
  if (label.startsWith('pages/') && !html.includes('auth-check.js')) {
    issues.push(`[MISSING auth-check.js] ${label}`);
  }
  // 3. Check for unclosed script tags
  const openScripts = (html.match(/<script/g) || []).length;
  const closeScripts = (html.match(/<\/script>/g) || []).length;
  if (openScripts !== closeScripts) {
    issues.push(`[SCRIPT TAG MISMATCH] ${label} open=${openScripts} close=${closeScripts}`);
  }
  // 4. Check for broken template literal artifacts
  if (html.includes('\\${') || html.includes('\\sub ') || html.includes('\\class ')) {
    issues.push(`[BAD TEMPLATE LITERAL] ${label}`);
  }
  // 5. Check for broken innerHTML patterns
  if (html.includes('undefined') && html.includes('innerHTML')) {
    issues.push(`[POTENTIAL UNDEFINED] ${label}`);
  }
  // 6. Check for correct CSS path
  if (label.startsWith('pages/') && !html.includes('../../css/main.css')) {
    issues.push(`[WRONG CSS PATH] ${label}`);
  }
  if (label === 'index.html' && !html.includes('css/main.css')) {
    issues.push(`[MISSING CSS] ${label}`);
  }
  // 7. Check for missing DOMContentLoaded protection
  const hasInlineScript = html.includes('<script>') && !html.includes('DOMContentLoaded');
  // Not an error per se, but flag it
  // 8. Check App.logout exists on portal pages (skip print pages like report-card)
  const isPrintPage = label.includes('report-card');
  if (label.startsWith('pages/') && !html.includes('App.logout') && !isPrintPage) {
    issues.push(`[MISSING LOGOUT] ${label}`);
  }
}

// Audit index.html
const indexPath = path.join(root, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
check(indexPath, indexHtml, 'index.html');

// Audit all portal pages
const portals = ['admin', 'teacher', 'student', 'parent'];
portals.forEach(portal => {
  const dir = path.join(root, 'pages', portal);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const html = fs.readFileSync(fullPath, 'utf8');
    check(fullPath, html, `pages/${portal}/${file}`);
  });
});

// Report
console.log('\n====== WEBSITE AUDIT REPORT ======\n');
if (issues.length === 0) {
  console.log('✅ No issues found! Website is clean.');
} else {
  console.log(`⚠️  Found ${issues.length} issue(s):\n`);
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}
console.log('\n==================================\n');
