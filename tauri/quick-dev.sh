#!/bin/bash

# Photo-Reader Quick Development Script
# Cross-platform development launcher for macOS and Linux

echo "=================================="
echo "Photo-Reader - Quick Development"
echo "=================================="
echo ""

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macOS"
    DEV_COMMAND="npm run dev:mac"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="Linux"
    
    # Detect Linux distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$NAME
    else
        DISTRO="Unknown"
    fi
    
    echo "Detected Distribution: $DISTRO"
    DEV_COMMAND="npm run dev:linux"
else
    PLATFORM="Unknown"
    echo "Warning: Unknown platform. Using default dev command."
    DEV_COMMAND="npm run dev"
fi

echo "Platform: $PLATFORM"
echo "Command: $DEV_COMMAND"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
    echo ""
fi

# Run development server
echo "Starting Photo-Reader development server..."
echo ""
$DEV_COMMAND
