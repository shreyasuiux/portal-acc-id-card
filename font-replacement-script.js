/**
 * Comprehensive Font Replacement Script
 * Replaces ALL Arial and Helvetica fonts with Roboto
 * 
 * Run this script with: node font-replacement-script.js
 */

const fs = require('fs');
const path = require('path');

// Define replacement patterns
const replacements = [
  // Style object font families
  { from: /fontFamily: 'Arial, sans-serif'/g, to: "fontFamily: 'Roboto, sans-serif'" },
  { from: /fontFamily: 'Helvetica, sans-serif'/g, to: "fontFamily: 'Roboto, sans-serif'" },
  { from: /fontFamily: "Arial, sans-serif"/g, to: 'fontFamily: "Roboto, sans-serif"' },
  { from: /fontFamily: "Helvetica, sans-serif"/g, to: 'fontFamily: "Roboto, sans-serif"' },
  
  // Font declarations in canvas/context
  { from: /context\.font = `bold \$\{fontSize\}px Arial, sans-serif`/g, to: 'context.font = `bold ${fontSize}px Roboto, sans-serif`' },
  { from: /context\.font = `bold \$\{fontSize\}px Helvetica, sans-serif`/g, to: 'context.font = `bold ${fontSize}px Roboto, sans-serif`' },
  { from: /font = `bold \$\{fontSize\}px Arial, sans-serif`/g, to: 'font = `bold ${fontSize}px Roboto, sans-serif`' },
  
  // Direct font declarations
  { from: /bold 24px Arial/g, to: 'bold 24px Roboto' },
  { from: /16px Arial/g, to: '16px Roboto' },
  { from: /bold 14px Arial/g, to: 'bold 14px Roboto' },
  
  // Tailwind-style font declarations
  { from: /font-\['Arial:Bold',sans-serif\]/g, to: "font-['Roboto',sans-serif] font-bold" },
  { from: /font-\['Arial:Regular',sans-serif\]/g, to: "font-['Roboto',sans-serif]" },
  { from: /font-\["Arial:Bold",sans-serif\]/g, to: 'font-["Roboto",sans-serif] font-bold' },
  { from: /font-\["Arial:Regular",sans-serif\]/g, to: 'font-["Roboto",sans-serif]' },
];

// Files to process
const filesToProcess = [
  '/src/app/components/IDCardBackPreview.tsx',
  '/src/app/components/IDCardDisplay.tsx',
  '/src/app/components/IDCardExportRenderer.tsx',
  '/src/app/components/IDCardPreview.tsx',
  '/src/app/components/UnifiedIDCardRenderer.tsx',
  '/src/app/utils/sampleZipGenerator.ts',
  '/src/imports/Container-12-1090.tsx',
  '/src/imports/Container-12-1123.tsx',
  '/src/imports/Container.tsx',
];

let totalReplacements = 0;

console.log('🔧 Starting font replacement...\n');

filesToProcess.forEach(filePath => {
  try {
    // Read file
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let fileReplacements = 0;
    
    // Apply all replacements
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        fileReplacements += matches.length;
        content = content.replace(from, to);
      }
    });
    
    // Write back to file
    if (fileReplacements > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${path.basename(filePath)}: ${fileReplacements} replacements`);
      totalReplacements += fileReplacements;
    } else {
      console.log(`ℹ️  ${path.basename(filePath)}: No changes needed`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Font replacement complete! Total replacements: ${totalReplacements}`);
console.log('✓ All Arial and Helvetica fonts have been replaced with Roboto');
