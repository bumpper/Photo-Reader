#!/usr/bin/env node

/**
 * Image Directory Index Generator
 * Cross-platform script to generate _index.txt for the current directory
 * Works on Windows, macOS, and Linux with Node.js
 * 
 * Usage:
 * - Node.js: node _generate-index.js
 * - Direct: ./_generate-index.js (on Unix systems with execute permission)
 */

const fs = require('fs');
const path = require('path');

// Configuration - using current directory since script is now in /img/
const IMG_DIR = __dirname; // Current directory (img folder)
const INDEX_FILE = path.join(IMG_DIR, '_index.txt');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico'];

function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
}

function isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
}

function getFileStats(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return {
            size: stats.size,
            modified: stats.mtime.toLocaleDateString('en-US')
        };
    } catch (error) {
        return { size: 0, modified: 'Unknown' };
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateIndex() {
    console.log('🔍 Scanning image directory...');
    
    // Check if current directory exists (should always be true)
    if (!fs.existsSync(IMG_DIR)) {
        console.error(`❌ Error: Image directory not found: ${IMG_DIR}`);
        process.exit(1);
    }

    try {
        // Read directory contents
        const files = fs.readdirSync(IMG_DIR);
        
        // Filter for image files only (exclude script files and _index.txt)
        const imageFiles = files.filter(file => {
            const filePath = path.join(IMG_DIR, file);
            const isFile = fs.statSync(filePath).isFile();
            const isScript = file.startsWith('_generate-') || file === '_index.txt';
            return isFile && isImageFile(file) && !isScript;
        });

        // Sort files alphabetically (case-insensitive)
        imageFiles.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Count by file type
        const typeCounts = {};
        const fileDetails = [];
        let totalSize = 0;

        imageFiles.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            const extUpper = ext.substring(1).toUpperCase();
            typeCounts[extUpper] = (typeCounts[extUpper] || 0) + 1;
            
            const filePath = path.join(IMG_DIR, file);
            const stats = getFileStats(filePath);
            totalSize += stats.size;
            
            fileDetails.push({
                name: file,
                size: stats.size,
                sizeFormatted: formatFileSize(stats.size),
                modified: stats.modified
            });
        });

        // Generate index content
        const indexContent = `Image Directory Contents
========================

This directory contains vision board images for the Photo-Reader application.

Generated: ${getCurrentTimestamp()}

Directory Summary:
-----------------
📁 Location: ./img/
📊 Total files: ${imageFiles.length}
💾 Total size: ${formatFileSize(totalSize)}
🔄 Last updated: ${getCurrentTimestamp()}

File Types Summary:
------------------
${Object.entries(typeCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => `${type} files: ${count}`)
    .join('\n')}

Image Files:
-----------
${imageFiles.map((file, index) => {
    const detail = fileDetails[index];
    return `${(index + 1).toString().padStart(2, '0')}. ${file} (${detail.sizeFormatted})`;
}).join('\n')}

Detailed File Information:
-------------------------
${fileDetails.map(file => 
    `📄 ${file.name}\n   💾 Size: ${file.sizeFormatted}\n   📅 Modified: ${file.modified}`
).join('\n\n')}

Supported Formats:
-----------------
The Photo-Reader Vision Board supports the following image formats:
• JPG/JPEG - Standard photo format
• PNG - Portable Network Graphics (supports transparency)
• GIF - Graphics Interchange Format (supports animation)
• WebP - Modern web image format (smaller file sizes)
• SVG - Scalable Vector Graphics (infinite resolution)
• BMP - Bitmap image format
• TIFF - Tagged Image File Format
• ICO - Icon format

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
• Supported file extensions: ${SUPPORTED_EXTENSIONS.join(', ')}
• For best results, use descriptive filenames

Maintenance Scripts:
-------------------
This directory contains several maintenance scripts (prefixed with _):
• _generate-index.js - Cross-platform Node.js script (recommended)
• _generate-index.bat - Windows batch script
• _generate-index.sh - Unix/Linux/macOS shell script

Script Information:
------------------
Generator: _generate-index.js
Version: 1.0.0
Platform: Cross-platform (Node.js)
Repository: Photo-Reader by bumpper
`;

        // Write index file
        fs.writeFileSync(INDEX_FILE, indexContent, 'utf8');
        
        console.log('✅ Index file generated successfully!');
        console.log(`📁 Location: ${INDEX_FILE}`);
        console.log(`📊 Found ${imageFiles.length} image files`);
        console.log(`💾 Total size: ${formatFileSize(totalSize)}`);
        
        if (imageFiles.length === 0) {
            console.log('⚠️  Warning: No image files found in the directory');
        } else {
            console.log('\n📋 Image files found:');
            imageFiles.slice(0, 5).forEach((file, index) => {
                console.log(`   ${index + 1}. ${file}`);
            });
            if (imageFiles.length > 5) {
                console.log(`   ... and ${imageFiles.length - 5} more files`);
            }
        }

    } catch (error) {
        console.error(`❌ Error generating index: ${error.message}`);
        process.exit(1);
    }
}

// Run the generator
if (require.main === module) {
    console.log('🎨 Photo-Reader Image Index Generator');
    console.log('=====================================\n');
    generateIndex();
}

module.exports = { generateIndex };