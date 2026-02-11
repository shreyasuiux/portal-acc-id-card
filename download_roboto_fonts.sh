#!/bin/bash
# Download Roboto Fonts Script
# This script downloads Roboto font files from Google Fonts CDN

echo "🔄 Downloading Roboto fonts..."
echo ""

# Create fonts directory
mkdir -p public/fonts

# Download Roboto Regular (400)
echo "📥 Downloading Roboto-Regular.woff2..."
curl -s -o public/fonts/Roboto-Regular.woff2 "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2"

# Download Roboto Medium (500)
echo "📥 Downloading Roboto-Medium.woff2..."
curl -s -o public/fonts/Roboto-Medium.woff2 "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2"

# Download Roboto Bold (700)
echo "📥 Downloading Roboto-Bold.woff2..."
curl -s -o public/fonts/Roboto-Bold.woff2 "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2"

echo ""
echo "✅ Download complete!"
echo ""
echo "📂 Font files saved to: public/fonts/"
echo ""
ls -lh public/fonts/*.woff2
echo ""
echo "🎉 Roboto fonts ready to use!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run build"
echo "  2. Verify fonts in dist/fonts/"
echo "  3. Deploy and test"
