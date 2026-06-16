const fs = require('fs');

const content = fs.readFileSync('d:\\amala\\update-lms-complete.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('parents.html') || line.includes('seenParents') || line.includes('loadParents')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
