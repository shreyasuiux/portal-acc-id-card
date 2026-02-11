#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files to update
const filesToUpdate = [
  './src/app/components/IDCardDisplay.tsx',
  './src/app/components/IDCardExportRenderer.tsx',
  './src/app/components/IDCardPreview.tsx',
  './src/app/components/UnifiedIDCardRenderer.tsx',
  './src/imports/Container-12-1090.tsx',
  './src/imports/Container-12-1123.tsx',
  './src/imports/Container.tsx'
];

// Replacement patterns
const replacements = [
  {
    from: /fontFamily: 'Arial, sans-serif'/g,
    to: "fontFamily: 'Roboto, sans-serif'"
  },
  {
    from: /context\.font = `bold \${fontSize}px Arial, sans-serif`/g,
    to: 'context.font = `bold ${fontSize}px Roboto, sans-serif`'
  },
  {
    from: /font-\['Arial:Bold',sans-serif\]/g,
    to: "font-['Roboto',sans-serif] font-bold"
  },
  {
    from: /font-\['Arial:Regular',sans-serif\]/g,
    to: "font-['Roboto',sans-serif]"
  }
];

let totalReplacements = 0;

console.log('🔄 Starting font replacement: Arial → Roboto\n');

filesToUpdate.forEach((filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} (file not found)`);
      return;
    }

    // Read file
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;

    // Apply all replacements
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        fileReplacements += matches.length;
        content = content.replace(from, to);
      }
    });

    // Write back if changes were made
    if (fileReplacements > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath} - ${fileReplacements} replacements`);
      totalReplacements += fileReplacements;
    } else {
      console.log(`✓  ${filePath} - already converted`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`✨ COMPLETED: ${totalReplacements} font instances converted`);
console.log(`   Arial → Roboto`);
console.log(`${'='.repeat(50)}\n`);

if (totalReplacements > 0) {
  console.log('🎉 Success! All fonts have been updated to Roboto.');
} else {
  console.log('ℹ️  No changes needed - all fonts already use Roboto.');
}
