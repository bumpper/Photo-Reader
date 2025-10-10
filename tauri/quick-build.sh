#!/bin/bash

# Photo-Reader Quick Build Script
# Cross-platform build launcher for macOS and Linux

echo "=================================="
echo "Photo-Reader - Quick Build"
echo "=================================="
echo ""

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macOS"
    BUILD_COMMAND="npm run build:mac"
    OUTPUT_DIR="src-tauri/target/release/bundle"
    BUNDLE_TYPES="DMG and APP"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="Linux"
    
    # Detect Linux distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$NAME
        
        # Determine build command based on distribution
        if [[ "$DISTRO" == *"Fedora"* ]] || [[ "$DISTRO" == *"Red Hat"* ]] || [[ "$DISTRO" == *"CentOS"* ]]; then
            BUILD_COMMAND="npm run build:linux-rpm"
            BUNDLE_TYPES="RPM"
        else
            # Default to DEB for Ubuntu, Debian, and others
            BUILD_COMMAND="npm run build:linux-deb"
            BUNDLE_TYPES="DEB and AppImage"
        fi
    else
        DISTRO="Unknown"
        BUILD_COMMAND="npm run build:linux"
        BUNDLE_TYPES="DEB, AppImage, and RPM"
    fi
    
    OUTPUT_DIR="src-tauri/target/release/bundle"
    echo "Detected Distribution: $DISTRO"
else
    PLATFORM="Unknown"
    echo "Warning: Unknown platform. Using default build command."
    BUILD_COMMAND="npm run build"
    OUTPUT_DIR="src-tauri/target/release/bundle"
    BUNDLE_TYPES="Default"
fi

echo "Platform: $PLATFORM"
echo "Bundle Types: $BUNDLE_TYPES"
echo "Command: $BUILD_COMMAND"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
    echo ""
fi

# Run build
echo "Building Photo-Reader..."
echo "This may take several minutes..."
echo ""
$BUILD_COMMAND

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "Build completed successfully!"
    echo "=================================="
    echo ""
    echo "Output location: $OUTPUT_DIR"
    echo ""
    
    # List generated bundles
    if [ -d "$OUTPUT_DIR" ]; then
        echo "Generated bundles:"
        if [[ "$PLATFORM" == "macOS" ]]; then
            [ -d "$OUTPUT_DIR/dmg" ] && echo "  - DMG: $OUTPUT_DIR/dmg/"
            [ -d "$OUTPUT_DIR/macos" ] && echo "  - APP: $OUTPUT_DIR/macos/Photo-Reader.app"
        elif [[ "$PLATFORM" == "Linux" ]]; then
            [ -d "$OUTPUT_DIR/deb" ] && echo "  - DEB: $OUTPUT_DIR/deb/"
            [ -d "$OUTPUT_DIR/appimage" ] && echo "  - AppImage: $OUTPUT_DIR/appimage/"
            [ -d "$OUTPUT_DIR/rpm" ] && echo "  - RPM: $OUTPUT_DIR/rpm/"
        fi
    fi
    echo ""
else
    echo ""
    echo "=================================="
    echo "Build failed!"
    echo "=================================="
    echo "Please check the error messages above."
    echo ""
    exit 1
fi
