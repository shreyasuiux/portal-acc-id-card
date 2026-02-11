#!/bin/bash

################################################################################
# Sample Employee Image Downloader
# Downloads 10 professional headshot images and creates a ZIP file
# with filenames matching the sample CSV Employee IDs
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Employee data
declare -A EMPLOYEES=(
    ["24EMP001"]="John Smith|https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=800&fit=crop&q=80"
    ["24EMP002"]="Sarah Johnson|https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&q=80"
    ["24EMP003"]="Michael Brown|https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop&q=80"
    ["24EMP004"]="Emily Davis|https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop&q=80"
    ["15EMP005"]="David Wilson|https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&q=80"
    ["15EMP006"]="Lisa Anderson|https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&h=800&fit=crop&q=80"
    ["22EMP007"]="James Martinez|https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&q=80"
    ["22EMP008"]="Jennifer Taylor|https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop&q=80"
    ["23EMP009"]="Robert Lee|https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&q=80"
    ["23EMP010"]="Mary White|https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop&q=80"
)

TEMP_DIR="temp_employee_photos"
ZIP_FILE="employee_photos.zip"

# Check for required commands
check_dependencies() {
    local missing=0
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is not installed${NC}"
        missing=1
    fi
    
    if ! command -v zip &> /dev/null; then
        echo -e "${RED}❌ zip is not installed${NC}"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        echo ""
        echo -e "${YELLOW}Please install missing dependencies:${NC}"
        echo "  - Ubuntu/Debian: sudo apt-get install curl zip"
        echo "  - macOS: brew install curl zip (or use built-in)"
        echo "  - CentOS/RHEL: sudo yum install curl zip"
        exit 1
    fi
}

# Print header
print_header() {
    echo ""
    echo "============================================================"
    echo "🎯 HR ID Card Generator - Sample Image Downloader"
    echo "============================================================"
    echo ""
}

# Create temp directory
create_temp_dir() {
    if [ -d "$TEMP_DIR" ]; then
        echo -e "${YELLOW}⚠️  Cleaning up old temp directory...${NC}"
        rm -rf "$TEMP_DIR"
    fi
    
    mkdir -p "$TEMP_DIR"
    echo -e "${GREEN}✅ Created temp directory${NC}"
}

# Download images
download_images() {
    echo ""
    echo "📸 Downloading Sample Employee Images..."
    echo ""
    
    local count=0
    local total=${#EMPLOYEES[@]}
    local failed=0
    
    for emp_id in "${!EMPLOYEES[@]}"; do
        IFS='|' read -r emp_name emp_url <<< "${EMPLOYEES[$emp_id]}"
        
        count=$((count + 1))
        echo -e "${BLUE}[$count/$total]${NC} Downloading ${emp_name} (${emp_id})..."
        
        if curl -s -L -o "$TEMP_DIR/${emp_id}.jpg" \
            -H "User-Agent: Mozilla/5.0" \
            "$emp_url"; then
            echo -e "   ${GREEN}✅ Saved as ${emp_id}.jpg${NC}"
        else
            echo -e "   ${RED}❌ Failed to download${NC}"
            failed=$((failed + 1))
        fi
    done
    
    echo ""
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✅ All images downloaded successfully!${NC}"
        return 0
    elif [ $failed -eq $total ]; then
        echo -e "${RED}❌ All downloads failed. Check your internet connection.${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠️  $failed downloads failed, but proceeding with others...${NC}"
        return 0
    fi
}

# Create ZIP file
create_zip() {
    echo ""
    echo "📦 Creating ZIP file: $ZIP_FILE..."
    echo ""
    
    if [ -f "$ZIP_FILE" ]; then
        echo -e "${YELLOW}⚠️  Removing old ZIP file...${NC}"
        rm "$ZIP_FILE"
    fi
    
    cd "$TEMP_DIR"
    
    local file_count=$(ls -1 *.jpg 2>/dev/null | wc -l)
    
    if [ "$file_count" -eq 0 ]; then
        echo -e "${RED}❌ No images to zip!${NC}"
        cd ..
        return 1
    fi
    
    zip -q -9 "../$ZIP_FILE" *.jpg
    cd ..
    
    if [ -f "$ZIP_FILE" ]; then
        local zip_size=$(du -h "$ZIP_FILE" | cut -f1)
        echo -e "${GREEN}✅ ZIP file created successfully!${NC}"
        echo -e "📍 Location: $(pwd)/$ZIP_FILE"
        echo -e "📊 Size: $zip_size"
        echo -e "📦 Files: $file_count/10 images"
        return 0
    else
        echo -e "${RED}❌ Failed to create ZIP file${NC}"
        return 1
    fi
}

# Cleanup
cleanup() {
    echo ""
    echo "🧹 Cleaning up temporary files..."
    
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        echo -e "   ${GREEN}✅ Cleanup complete${NC}"
    fi
}

# Print instructions
print_instructions() {
    echo ""
    echo "============================================================"
    echo "✨ SUCCESS! Your sample photo ZIP is ready!"
    echo "============================================================"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Download the sample CSV from the app"
    echo "   2. Upload the CSV file"
    echo "   3. Upload the employee_photos.zip file"
    echo "   4. Generate bulk ID cards!"
    echo ""
    echo "💡 Tip: The ZIP contains images named by Employee ID"
    echo "   (24EMP001.jpg, 24EMP002.jpg, etc.)"
    echo ""
}

# Main function
main() {
    print_header
    
    # Check dependencies
    check_dependencies
    
    # Create temp directory
    create_temp_dir
    
    # Download images
    if ! download_images; then
        cleanup
        exit 1
    fi
    
    # Create ZIP file
    if ! create_zip; then
        cleanup
        exit 1
    fi
    
    # Cleanup
    cleanup
    
    # Print instructions
    print_instructions
}

# Handle Ctrl+C
trap 'echo -e "\n\n${YELLOW}⚠️  Download cancelled by user${NC}"; cleanup; exit 130' INT

# Run main function
main
