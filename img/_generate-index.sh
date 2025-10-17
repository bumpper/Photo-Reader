#!/bin/bash

# Photo-Reader Image Index Generator
# Cross-platform shell script for Unix/Linux/macOS
# Usage: ./_generate-index.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - using current directory since script is now in /img/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMG_DIR="$SCRIPT_DIR"
INDEX_FILE="$IMG_DIR/_index.txt"
TEMP_FILE="/tmp/img_index_temp.txt"

echo -e "${BLUE}🎨 Photo-Reader Image Index Generator${NC}"
echo "====================================="
echo

echo -e "${BLUE}🔍 Scanning image directory: $IMG_DIR${NC}"
echo

# Get current timestamp
TIMESTAMP=$(date "+%B %d, %Y at %I:%M:%S %p %Z")

# Initialize counters
FILE_COUNT=0
JPG_COUNT=0
PNG_COUNT=0
GIF_COUNT=0
WEBP_COUNT=0
SVG_COUNT=0
OTHER_COUNT=0

# Create temporary file for sorted list
> "$TEMP_FILE"

# Function to get file size in human readable format
get_file_size() {
    if command -v stat >/dev/null 2>&1; then
        # Try different stat command formats
        if stat -c%s "$1" 2>/dev/null; then
            return
        elif stat -f%z "$1" 2>/dev/null; then
            return
        fi
    fi
    # Fallback
    echo "0"
}

# Function to format bytes to human readable
format_size() {
    local bytes=$1
    if [ "$bytes" -eq 0 ]; then
        echo "0 B"
        return
    fi
    
    local units=("B" "KB" "MB" "GB")
    local unit=0
    local size=$bytes
    
    while [ "$size" -gt 1024 ] && [ "$unit" -lt 3 ]; do
        size=$((size / 1024))
        unit=$((unit + 1))
    done
    
    echo "${size} ${units[$unit]}"
}

# Scan for image files (exclude script files and _index.txt)
TOTAL_SIZE=0
for ext in jpg jpeg png gif webp svg bmp tiff ico JPG JPEG PNG GIF WEBP SVG BMP TIFF ICO; do
    for file in "$IMG_DIR"/*."$ext" 2>/dev/null; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            
            # Skip script files and _index.txt
            if [[ ! "$filename" =~ ^_generate- ]] && [ "$filename" != "_index.txt" ]; then
                echo "$filename" >> "$TEMP_FILE"
                FILE_COUNT=$((FILE_COUNT + 1))
                
                # Get file size
                file_size=$(get_file_size "$file")
                TOTAL_SIZE=$((TOTAL_SIZE + file_size))
                
                # Count by extension (case insensitive)
                case "${filename,,}" in
                    *.jpg|*.jpeg) JPG_COUNT=$((JPG_COUNT + 1)) ;;
                    *.png) PNG_COUNT=$((PNG_COUNT + 1)) ;;
                    *.gif) GIF_COUNT=$((GIF_COUNT + 1)) ;;
                    *.webp) WEBP_COUNT=$((WEBP_COUNT + 1)) ;;
                    *.svg) SVG_COUNT=$((SVG_COUNT + 1)) ;;
                    *) OTHER_COUNT=$((OTHER_COUNT + 1)) ;;
                esac
            fi
        fi
    done
done

# Sort the file list
if [ -f "$TEMP_FILE" ]; then
    sort "$TEMP_FILE" -o "$TEMP_FILE"
fi

# Generate index file
cat > "$INDEX_FILE" << EOF
Image Directory Contents
========================

This directory contains vision board images for the Photo-Reader application.

Generated: $TIMESTAMP

Directory Summary:
-----------------
📁 Location: ./img/
📊 Total files: $FILE_COUNT
💾 Total size: $(format_size $TOTAL_SIZE)
🔄 Last updated: $TIMESTAMP

File Types Summary:
------------------
EOF

# Add file type counts
[ $JPG_COUNT -gt 0 ] && echo "JPG/JPEG files: $JPG_COUNT" >> "$INDEX_FILE"
[ $PNG_COUNT -gt 0 ] && echo "PNG files: $PNG_COUNT" >> "$INDEX_FILE"
[ $GIF_COUNT -gt 0 ] && echo "GIF files: $GIF_COUNT" >> "$INDEX_FILE"
[ $WEBP_COUNT -gt 0 ] && echo "WEBP files: $WEBP_COUNT" >> "$INDEX_FILE"
[ $SVG_COUNT -gt 0 ] && echo "SVG files: $SVG_COUNT" >> "$INDEX_FILE"
[ $OTHER_COUNT -gt 0 ] && echo "Other formats: $OTHER_COUNT" >> "$INDEX_FILE"

cat >> "$INDEX_FILE" << EOF

Image Files:
-----------
EOF

# Add numbered file list
if [ -f "$TEMP_FILE" ]; then
    counter=1
    while IFS= read -r filename; do
        printf "%02d. %s\n" "$counter" "$filename" >> "$INDEX_FILE"
        counter=$((counter + 1))
    done < "$TEMP_FILE"
fi

cat >> "$INDEX_FILE" << EOF

Usage Instructions:
------------------
1. Select "Vision Board" from the Photo-Reader's Preloaded dropdown menu
2. The application will automatically discover and load all images from this directory
3. Use Previous/Next buttons to browse through images
4. Click "Play" to start a fullscreen slideshow presentation
5. Use keyboard controls (Space, Arrow keys) for navigation during slideshow

Adding New Images:
-----------------
• Simply copy image files to this directory
• Run this script again to update the index
• Supported formats: JPG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO
• For best results, use descriptive filenames

Maintenance Scripts:
-------------------
This directory contains several maintenance scripts (prefixed with _):
• _generate-index.js - Cross-platform Node.js script (recommended)
• _generate-index.bat - Windows batch script
• _generate-index.sh - Unix/Linux/macOS shell script

Script Information:
------------------
Generator: _generate-index.sh
Version: 1.0.0
Platform: Unix/Linux/macOS Shell
Repository: Photo-Reader by bumpper
EOF

# Clean up
rm -f "$TEMP_FILE"

# Display results
echo -e "${GREEN}✅ Index file generated successfully!${NC}"
echo -e "${BLUE}📁 Location:${NC} $INDEX_FILE"
echo -e "${BLUE}📊 Found:${NC} $FILE_COUNT image files"
echo -e "${BLUE}💾 Total size:${NC} $(format_size $TOTAL_SIZE)"
echo

if [ $FILE_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: No image files found in the directory${NC}"
else
    echo -e "${BLUE}📋 File type breakdown:${NC}"
    [ $JPG_COUNT -gt 0 ] && echo "   📸 JPG/JPEG: $JPG_COUNT"
    [ $PNG_COUNT -gt 0 ] && echo "   🖼️  PNG: $PNG_COUNT"
    [ $GIF_COUNT -gt 0 ] && echo "   🎞️  GIF: $GIF_COUNT"
    [ $WEBP_COUNT -gt 0 ] && echo "   🌐 WebP: $WEBP_COUNT"
    [ $SVG_COUNT -gt 0 ] && echo "   📐 SVG: $SVG_COUNT"
    [ $OTHER_COUNT -gt 0 ] && echo "   📄 Other: $OTHER_COUNT"
fi

echo
echo -e "${GREEN}✨ Index generation complete!${NC}"