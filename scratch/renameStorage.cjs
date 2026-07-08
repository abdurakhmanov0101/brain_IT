const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/stores').filter(f => f.endsWith('.ts'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Regex to replace names inside name: '...' or name: "..."
  content = content.replace(/(name:\s*['"])([^'"]+)(['"])/g, (match, p1, p2, p3) => {
    if (p2.includes('brain') || p2.includes('classroom') || p2.includes('homework') || p2.includes('teacher') || p2.includes('staff')) {
      return `${p1}${p2}-prod-v1${p3}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Renamed storage key in:', f);
  }
});
