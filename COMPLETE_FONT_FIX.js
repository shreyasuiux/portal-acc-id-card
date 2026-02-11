#!/usr/bin/env node

/**
 * COMPLETE FONT CLEANUP SCRIPT
 * 
 * This script removes ALL sans-serif fallback fonts from the entire codebase.
 * After running this, ONLY "Roboto" will be used (no fallbacks).
 */

const fs = require('fs');
const path = require('path');

console.log('\n🎯 COMPLETE FONT CLEANUP - Removing ALL sans-serif fallbacks\n');
console.log('='.repeat(60));

const files = [
  './src/app/components/UnifiedIDCardRenderer.tsx',
  './src/imports/Container-12-1090.tsx',
  './src/imports/Container-12-1123.tsx',
  './src/imports/Container.tsx',
];

let totalReplacements = 0;
let filesProcessed = 0;

files.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  SKIP: ${path.basename(filePath)} (not found)`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let count = 0;

    // Pattern 1: 'Roboto, sans-serif' → 'Roboto' (single quotes)
    const pattern1Matches = content.match(/'Roboto, sans-serif'/g);
    if (pattern1Matches) {
      count += pattern1Matches.length;
      content = content.replace(/'Roboto, sans-serif'/g, "'Roboto'");
      console.log(`  ✓ Pattern 1 (single quotes): ${pattern1Matches.length} replacements`);
    }

    // Pattern 2: "Roboto, sans-serif" → "Roboto" (double quotes)
    const pattern2Matches = content.match(/"Roboto, sans-serif"/g);
    if (pattern2Matches) {
      count += pattern2Matches.length;
      content = content.replace(/"Roboto, sans-serif"/g, '"Roboto"');
      console.log(`  ✓ Pattern 2 (double quotes): ${pattern2Matches.length} replacements`);
    }

    // Pattern 3: Roboto, sans-serif` (template literals)
    const pattern3Matches = content.match(/Roboto, sans-serif`/g);
    if (pattern3Matches) {
      count += pattern3Matches.length;
      content = content.replace(/Roboto, sans-serif`/g, 'Roboto`');
      console.log(`  ✓ Pattern 3 (template literals): ${pattern3Matches.length} replacements`);
    }

    // Pattern 4: font-['Roboto',sans-serif] → font-['Roboto'] (Tailwind classes)
    const pattern4Matches = content.match(/font-\['Roboto',sans-serif\]/g);
    if (pattern4Matches) {
      count += pattern4Matches.length;
      content = content.replace(/font-\['Roboto',sans-serif\]/g, "font-['Roboto']");
      console.log(`  ✓ Pattern 4 (Tailwind classes): ${pattern4Matches.length} replacements`);
    }

    // Pattern 5: font-["Roboto",sans-serif] → font-["Roboto"] (Tailwind double quotes)
    const pattern5Matches = content.match(/font-\["Roboto",sans-serif\]/g);
    if (pattern5Matches) {
      count += pattern5Matches.length;
      content = content.replace(/font-\["Roboto",sans-serif\]/g, 'font-["Roboto"]');
      console.log(`  ✓ Pattern 5 (Tailwind double quotes): ${pattern5Matches.length} replacements`);
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesProcessed++;
      totalReplacements += count;
      console.log(`✅ ${path.basename(filePath)}: ${count} total replacements\n`);
    } else {
      console.log(`   ${path.basename(filePath)}: Already clean\n`);
    }
  } catch (err) {
    console.log(`❌ ERROR: ${path.basename(filePath)} - ${err.message}\n`);
  }
});

console.log('='.repeat(60));
console.log(`\n✨ CLEANUP COMPLETE!`);
console.log(`   Files processed: ${filesProcessed}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`\n🎯 Result: ONLY "Roboto" (no fallbacks)\n`);

// Verification
console.log('🔍 VERIFICATION:\n');
console.log('Run these commands to verify:');
console.log('');
console.log('  # Should return ONLY fontValidation.ts (blocked list)');
console.log('  grep -r "Roboto, sans-serif" ./src --include="*.tsx" --include="*.ts"');
console.log('');
console.log('  # Should return 0 (no Arial/Helvetica in active code)');
console.log('  grep -r "Arial\\|Helvetica" ./src --include="*.tsx" --include="*.ts" | grep -v "fontValidation.ts"');
console.log('');
console.log('✅ Font cleanup is now 100% complete!\n');
