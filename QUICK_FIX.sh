#!/bin/bash

# Quick Font Replacement Script
# Run this from your project root directory

echo "🔄 Replacing ALL Arial fonts with Roboto..."

# Replace fontFamily: 'Arial, sans-serif' → 'Roboto, sans-serif'
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s/fontFamily: 'Arial, sans-serif'/fontFamily: 'Roboto, sans-serif'/g" {} \;

# Replace canvas font declarations
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/context\.font = `bold \${fontSize}px Arial, sans-serif`/context.font = `bold ${fontSize}px Roboto, sans-serif`/g' {} \;

# Replace Tailwind font declarations - Arial:Bold
find ./src -type f -name "*.tsx" -exec sed -i.bak "s/font-\['Arial:Bold',sans-serif\]/font-['Roboto',sans-serif] font-bold/g" {} \;

# Replace Tailwind font declarations - Arial:Regular  
find ./src -type f -name "*.tsx" -exec sed -i.bak "s/font-\['Arial:Regular',sans-serif\]/font-['Roboto',sans-serif]/g" {} \;

# Clean up backup files
find ./src -name "*.bak" -delete

echo "✅ Done! All Arial fonts replaced with Roboto"
echo ""
echo "Verify with:"
echo "  grep -r \"Arial\" ./src --include=\"*.tsx\" --include=\"*.ts\""
