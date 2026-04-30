import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles('src');
const fileSet = new Set(allFiles.map(f => f.replace(/\\/g, '/')));

let hasError = false;

allFiles.forEach(file => {
  if (!file.endsWith('.js') && !file.endsWith('.jsx') && !file.endsWith('.ts')) return;
  
  const content = fs.readFileSync(file, 'utf8');
  // Match import statements
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[1];
    
    // Ignore external modules
    if (!importPath.startsWith('.')) continue;
    
    const dir = path.dirname(file);
    let absoluteImportPath = path.join(dir, importPath).replace(/\\/g, '/');
    
    // Check if the exact path exists
    // We need to try adding extensions .js, .jsx, .ts, etc. or /index.js
    
    let found = false;
    const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
    
    for (const ext of extensions) {
      if (fileSet.has(absoluteImportPath + ext)) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Check if it exists case-insensitively
      const lowerFileSet = new Map([...fileSet].map(f => [f.toLowerCase(), f]));
      
      for (const ext of extensions) {
        const lowerPath = (absoluteImportPath + ext).toLowerCase();
        if (lowerFileSet.has(lowerPath)) {
          console.error(`CASE SENSITIVITY ERROR in ${file}:`);
          console.error(`  Import: '${importPath}'`);
          console.error(`  Expected exact file: ${lowerFileSet.get(lowerPath)}`);
          hasError = true;
          break;
        }
      }
      
      // If still not found, it might be a CSS file or something else, let's not warn to reduce noise unless we know
    }
  }
});

if (!hasError) {
  console.log('No case sensitivity issues found in imports.');
}
