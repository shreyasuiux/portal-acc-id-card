#!/bin/bash

# Replace all Arial and Helvetica font references with Roboto

# Find all TypeScript and TSX files and replace
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/fontFamily: 'Arial, sans-serif'/fontFamily: 'Roboto, sans-serif'/g" {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/fontFamily: 'Helvetica, sans-serif'/fontFamily: 'Roboto, sans-serif'/g" {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/'Arial:Bold',sans-serif/'Roboto',sans-serif/g" {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/'Arial:Regular',sans-serif/'Roboto',sans-serif/g" {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/font = `bold \${fontSize}px Arial, sans-serif`/font = `bold ${fontSize}px Roboto, sans-serif`/g' {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/bold \${fontSize}px Arial/bold \${fontSize}px Roboto/g" {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/bold 24px Arial/bold 24px Roboto/g" {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/16px Arial/16px Roboto/g" {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/bold 14px Arial/bold 14px Roboto/g" {} \;
find /src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/context.font = \`bold \${fontSize}px Arial, sans-serif\`/context.font = \`bold \${fontSize}px Roboto, sans-serif\`/g" {} \;

echo "Font replacement complete!"
