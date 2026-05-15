const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const files = [
  path.join(DIR, 'src', 'Body.html'),
  path.join(DIR, 'src', 'Scripts.html')
];

// Mapping of hex colors to CSS variables
const colorMap = [
  { match: /#003[Ff]5[Cc]/g, replace: 'var(--pr)' },
  { match: /#005[Ff]7[Aa]/g, replace: 'var(--pl)' },
  { match: /#009[Bb]9[Bb]/g, replace: 'var(--ac)' },
  { match: /#[Ff]0[Ff]4[Ff]5/g, replace: 'var(--bg)' },
  { match: /#1[Aa]2[Ee]35/g, replace: 'var(--tx)' },
  { match: /#5[Aa]7280/g, replace: 'var(--t2)' },
  { match: /#[Cc][Dd][Dd]8[Dd]8/g, replace: 'var(--bd)' },
  { match: /#[Dd][Cc]2626/g, replace: 'var(--rd)' },
  { match: /#16[Aa]34[Aa]/g, replace: 'var(--gn)' },
  { match: /#[Ee]8622[Aa]/g, replace: 'var(--or)' },
  { match: /#0[Ff]7[Aa]3[Dd]/g, replace: 'var(--ok)' },
  { match: /#[Bb]42318/g, replace: 'var(--bad)' }
];

let totalReplaced = 0;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const cmap of colorMap) {
    content = content.replace(cmap.match, cmap.replace);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    const matches = original.length - content.length; // rough estimate if lengths differ, but regex replace doesn't change length easily if same
    console.log(`Updated ${path.basename(file)}`);
  }
}
console.log('Refactoring complete.');
