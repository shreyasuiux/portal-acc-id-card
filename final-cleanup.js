const fs = require('fs');
const path = require('path');

console.log('🚀 FINAL FONT CLEANUP - Removing ALL sans-serif fallbacks\n');

const files = [
  './src/app/components/IDCardPreview.tsx',
  './src/app/components/UnifiedIDCardRenderer.tsx',
  './src/imports/Container-12-1090.tsx',
  './src/imports/Container-12-1123.tsx',
  './src/imports/Container.tsx',
];

let totalReplacements = 0;

files.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  SKIP: ${filePath} (not found)`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let count = 0;

    // Pattern 1: fontFamily: 'Roboto, sans-serif' → fontFamily: 'Roboto'
    const pattern1Matches = content.match(/'Roboto, sans-serif'/g);
    if (pattern1Matches) {
      count += pattern1Matches.length;
      content = content.replace(/'Roboto, sans-serif'/g, "'Roboto'");
    }

    // Pattern 2: fontFamily: "Roboto, sans-serif" → fontFamily: "Roboto"
    const pattern2Matches = content.match(/"Roboto, sans-serif"/g);
    if (pattern2Matches) {
      count += pattern2Matches.length;
      content = content.replace(/"Roboto, sans-serif"/g, '"Roboto"');
    }

    // Pattern 3: context.font = `...Roboto, sans-serif` → context.font = `...Roboto`
    const pattern3Matches = content.match(/Roboto, sans-serif`/g);
    if (pattern3Matches) {
      count += pattern3Matches.length;
      content = content.replace(/Roboto, sans-serif`/g, 'Roboto`');
    }

    // Pattern 4: font-['Roboto',sans-serif] → font-['Roboto']
    const pattern4Matches = content.match(/font-\['Roboto',sans-serif\]/g);
    if (pattern4Matches) {
      count += pattern4Matches.length;
      content = content.replace(/font-\['Roboto',sans-serif\]/g, "font-['Roboto']");
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.basename(filePath)}: ${count} replacements`);
      totalReplacements += count;
    } else {
      console.log(`   ${path.basename(filePath)}: Already clean`);
    }
  } catch (err) {
    console.log(`❌ ERROR: ${filePath} - ${err.message}`);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`✨ COMPLETE! ${totalReplacements} sans-serif fallbacks removed`);
console.log(`🎯 Result: ONLY 'Roboto' - NO FALLBACKS\n`);
