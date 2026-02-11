#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 REMOVING ALL SANS-SERIF FALLBACKS\n');

const files = [
  './src/app/components/IDCardExportRenderer.tsx',
  './src/app/components/IDCardPreview.tsx',
  './src/app/components/UnifiedIDCardRenderer.tsx',
  './src/imports/Container-12-1090.tsx',
  './src/imports/Container-12-1123.tsx',
  './src/imports/Container.tsx',
];

let totalCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let count = 0;
    
    // Replace all variations
    const replacements = [
      // Style object: 'Roboto, sans-serif' → 'Roboto'
      { from: /'Roboto, sans-serif'/g, to: "'Roboto'", name: "fontFamily: 'Roboto, sans-serif'" },
      { from: /"Roboto, sans-serif"/g, to: '"Roboto"', name: 'fontFamily: "Roboto, sans-serif"' },
      
      // Canvas: Roboto, sans-serif → Roboto
      { from: /Roboto, sans-serif/g, to: 'Roboto', name: 'canvas: Roboto, sans-serif' },
      
      // Tailwind: font-['Roboto',sans-serif] → font-['Roboto']
      { from: /font-\['Roboto',sans-serif\]/g, to: "font-['Roboto']", name: "font-['Roboto',sans-serif]" },
      { from: /font-\["Roboto",sans-serif\]/g, to: 'font-["Roboto"]', name: 'font-["Roboto",sans-serif]' },
    ];
    
    replacements.forEach(({ from, to, name }) => {
      const matches = content.match(from);
      if (matches) {
        count += matches.length;
        content = content.replace(from, to);
      }
    });
    
    if (count > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath.split('/').pop()}: ${count} replacements`);
      totalCount += count;
    } else {
      console.log(`   ${filePath.split('/').pop()}: Already clean`);
    }
  } catch (err) {
    console.log(`⚠️  SKIP: ${filePath} (${err.message})`);
  }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✨ DONE: ${totalCount} sans-serif fallbacks removed`);
console.log(`🎯 Result: ONLY 'Roboto' (no fallbacks)\n`);
