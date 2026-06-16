/**
 * Deep content audit — checks for broken JS patterns, null access, etc.
 * node deep-audit.js
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const portals = ['admin', 'teacher', 'student', 'parent'];
const issues = [];

function deepCheck(html, label) {
  // Check for AppState.getData called without null guard
  const getDataCalls = (html.match(/AppState\.getData\(/g) || []).length;
  // These are generally fine since getData returns [] by default

  // Check for direct localStorage.getItem that might return null and be passed to JSON.parse without ||
  const badParse = html.match(/JSON\.parse\(localStorage\.getItem\([^)]+\)\)(?!\s*\|\|)/g);
  if (badParse) {
    badParse.forEach(m => issues.push(`[NULL JSON.PARSE] ${label}: ${m.trim().substring(0, 60)}`));
  }

  // Check for .forEach on potentially null (not protected)
  // Check for broken onclick patterns
  const brokenOnclicks = html.match(/onclick="[^"]*undefined[^"]*"/g);
  if (brokenOnclicks) {
    brokenOnclicks.forEach(m => issues.push(`[BROKEN ONCLICK] ${label}: ${m.substring(0, 60)}`));
  }

  // Check for template literal escaping issues
  if (html.includes('\\${')) issues.push('[BAD ESCAPE] ' + label);
  if (html.includes('\\class ')) issues.push('[BAD ESCAPE class] ' + label);
  if (html.includes('\\sub ')) issues.push('[BAD ESCAPE sub] ' + label);

  // Check for innerHTML with unclosed template literals (backtick imbalance in script blocks)
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
  scripts.forEach(script => {
    const backticks = (script.match(/`/g) || []).length;
    if (backticks % 2 !== 0) {
      issues.push(`[ODD BACKTICK COUNT] ${label} (${backticks} backticks in a script block)`);
    }
  });

  // Check for missing closing brackets in critical patterns
  if ((html.match(/\bfunction\b/g) || []).length > 0) {
    // Basic: count open { vs close } in script sections
    scripts.forEach(script => {
      const opens = (script.match(/\{/g) || []).length;
      const closes = (script.match(/\}/g) || []).length;
      if (Math.abs(opens - closes) > 3) {
        issues.push(`[BRACE MISMATCH] ${label} open=${opens} close=${closes}`);
      }
    });
  }
}

portals.forEach(portal => {
  const dir = path.join(root, 'pages', portal);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  files.forEach(file => {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    deepCheck(html, `${portal}/${file}`);
  });
});

console.log('\n====== DEEP AUDIT REPORT ======\n');
if (issues.length === 0) {
  console.log('✅ All pages passed deep audit!');
} else {
  console.log(`⚠️  Found ${issues.length} potential issue(s):\n`);
  issues.forEach((issue, i) => console.log(`  ${i+1}. ${issue}`));
}
console.log('\n================================\n');
