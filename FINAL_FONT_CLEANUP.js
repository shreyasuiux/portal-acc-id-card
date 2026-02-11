const fs = require('fs');
const path = require('path');

console.log('🚀 FINAL FONT CLEANUP: Removing ALL sans-serif fallbacks');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const replacements = [
  // Style object: fontFamily: 'Roboto, sans-serif' → fontFamily: 'Roboto'
  {
    pattern: /fontFamily: 'Roboto, sans-serif'/g,
    replacement: "fontFamily: 'Roboto'",
    description: "Style object fontFamily (single quotes)"
  },
  {
    pattern: /fontFamily: "Roboto, sans-serif"/g,
    replacement: 'fontFamily: "Roboto"',
    description: "Style object fontFamily (double quotes)"
  },
  
  // Canvas font: context.font = `bold ${fontSize}px Roboto, sans-serif`
  {
    pattern: /context\.font = `bold \$\{fontSize\}px Roboto, sans-serif`/g,
    replacement: 'context.font = `bold ${fontSize}px Roboto`',
    description: "Canvas font declaration"
  },
  {
    pattern: /context\.font = `(\w+) \$\{(\w+)\}px Roboto, sans-serif`/g,
    replacement: 'context.font = `$1 ${$2}px Roboto`',
    description: "Canvas font with variable weight"
  },
  
  // Tailwind classes: font-['Roboto',sans-serif]
  {
    pattern: /font-\['Roboto',sans-serif\]/g,
    replacement: "font-['Roboto']",
    description: "Tailwind font-['Roboto',sans-serif]"
  },
  {
    pattern: /font-\["Roboto",sans-serif\]/g,
    replacement: 'font-["Roboto"]',
    description: 'Tailwind font-["Roboto",sans-serif]'
  },
];

const filesToProcess = [
  './src/app/components/IDCardExportRenderer.tsx',
  './src/app/components/IDCardPreview.tsx',
  './src/app/components/UnifiedIDCardRenderer.tsx',
  './src/imports/Container-12-1090.tsx',
  './src/imports/Container-12-1123.tsx',
  './src/imports/Container.tsx',
];

let totalReplacements = 0;
let filesModified = 0;

filesToProcess.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  SKIP: ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileReplacements = 0;

  replacements.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      content = content.replace(pattern, replacement);
      fileReplacements += matches.length;
      console.log(`   ✓ ${description}: ${matches.length} instances`);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += fileReplacements;
    console.log(`✅ ${path.basename(filePath)}: ${fileReplacements} replacements\n`);
  } else {
    console.log(`   ${path.basename(filePath)}: Already clean\n`);
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n🎉 CLEANUP COMPLETE!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`\n✅ Result: ONLY "Roboto" (no fallbacks)\n`);
