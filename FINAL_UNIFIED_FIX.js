#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Fixing UnifiedIDCardRenderer.tsx - Removing ALL sans-serif\n');

const file = './src/app/components/UnifiedIDCardRenderer.tsx';

if (!fs.existsSync(file)) {
  console.log('❌ File not found:', file);
  process.exit(1);
}

let content = fs.readFileSync(file, 'utf8');
const originalContent = content;

// Replace ALL instances of 'Roboto, sans-serif' with 'Roboto'
const matches = content.match(/'Roboto, sans-serif'/g);
if (matches) {
  console.log(`Found ${matches.length} instances of 'Roboto, sans-serif'`);
  content = content.replace(/'Roboto, sans-serif'/g, "'Roboto'");
}

if (content !== originalContent) {
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ Fixed ${matches?.length || 0} instances in UnifiedIDCardRenderer.tsx`);
} else {
  console.log('   File already clean');
}

console.log('\n🎉 Complete! Run verification:\n');
console.log('  grep -r "Roboto, sans-serif" ./src --include="*.tsx"');
console.log('  # Should return 0 results\n');
