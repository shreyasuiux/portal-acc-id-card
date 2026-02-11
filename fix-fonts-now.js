const fs = require('fs');

// Read IDCardDisplay.tsx
let content = fs.readFileSync('./src/app/components/IDCardDisplay.tsx', 'utf8');

// Replace all Arial with Roboto
content = content.replace(/fontFamily: 'Arial, sans-serif'/g, "fontFamily: 'Roboto, sans-serif'");
content = content.replace(/context\.font = `bold \${fontSize}px Arial, sans-serif`/g, 'context.font = `bold ${fontSize}px Roboto, sans-serif`');

// Write back
fs.writeFileSync('./src/app/components/IDCardDisplay.tsx', content, 'utf8');

console.log('✅ IDCardDisplay.tsx updated');

// Read IDCardExportRenderer.tsx
content = fs.readFileSync('./src/app/components/IDCardExportRenderer.tsx', 'utf8');
content = content.replace(/fontFamily: 'Arial, sans-serif'/g, "fontFamily: 'Roboto, sans-serif'");
content = content.replace(/context\.font = `bold \${fontSize}px Arial, sans-serif`/g, 'context.font = `bold ${fontSize}px Roboto, sans-serif`');
fs.writeFileSync('./src/app/components/IDCardExportRenderer.tsx', content, 'utf8');
console.log('✅ IDCardExportRenderer.tsx updated');

// Read IDCardPreview.tsx
content = fs.readFileSync('./src/app/components/IDCardPreview.tsx', 'utf8');
content = content.replace(/fontFamily: 'Arial, sans-serif'/g, "fontFamily: 'Roboto, sans-serif'");
content = content.replace(/context\.font = `bold \${fontSize}px Arial, sans-serif`/g, 'context.font = `bold ${fontSize}px Roboto, sans-serif`');
fs.writeFileSync('./src/app/components/IDCardPreview.tsx', content, 'utf8');
console.log('✅ IDCardPreview.tsx updated');

// Read UnifiedIDCardRenderer.tsx  
content = fs.readFileSync('./src/app/components/UnifiedIDCardRenderer.tsx', 'utf8');
content = content.replace(/fontFamily: 'Arial, sans-serif'/g, "fontFamily: 'Roboto, sans-serif'");
content = content.replace(/context\.font = `bold \${fontSize}px Arial, sans-serif`/g, 'context.font = `bold ${fontSize}px Roboto, sans-serif`');
fs.writeFileSync('./src/app/components/UnifiedIDCardRenderer.tsx', content, 'utf8');
console.log('✅ UnifiedIDCardRenderer.tsx updated');

// Read Container-12-1090.tsx
content = fs.readFileSync('./src/imports/Container-12-1090.tsx', 'utf8');
content = content.replace(/font-\['Arial:Bold',sans-serif\]/g, "font-['Roboto',sans-serif] font-bold");
content = content.replace(/font-\['Arial:Regular',sans-serif\]/g, "font-['Roboto',sans-serif]");
fs.writeFileSync('./src/imports/Container-12-1090.tsx', content, 'utf8');
console.log('✅ Container-12-1090.tsx updated');

// Read Container-12-1123.tsx
content = fs.readFileSync('./src/imports/Container-12-1123.tsx', 'utf8');
content = content.replace(/font-\['Arial:Bold',sans-serif\]/g, "font-['Roboto',sans-serif] font-bold");
content = content.replace(/font-\['Arial:Regular',sans-serif\]/g, "font-['Roboto',sans-serif]");
fs.writeFileSync('./src/imports/Container-12-1123.tsx', content, 'utf8');
console.log('✅ Container-12-1123.tsx updated');

// Read Container.tsx
content = fs.readFileSync('./src/imports/Container.tsx', 'utf8');
content = content.replace(/font-\['Arial:Bold',sans-serif\]/g, "font-['Roboto',sans-serif] font-bold");
content = content.replace(/font-\['Arial:Regular',sans-serif\]/g, "font-['Roboto',sans-serif]");
fs.writeFileSync('./src/imports/Container.tsx', content, 'utf8');
console.log('✅ Container.tsx updated');

console.log('\n🎉 ALL FONTS UPDATED TO ROBOTO!');
