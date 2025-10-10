# Build Instructions for Photo-Reader

This document provides detailed instructions for building the Photo-Reader application on different platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Build](#development-build)
- [Production Build](#production-build)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Rust** (latest stable)
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Verify installation
   rustc --version
   cargo --version
   ```

2. **Node.js** (v16 or later)
   ```bash
   # Verify installation
   node --version
   npm --version
   ```

3. **Platform-Specific Dependencies**

   #### Windows
   - Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - WebView2 (pre-installed on Windows 10/11)

   #### macOS
   ```bash
   xcode-select --install
   ```

   #### Linux (Ubuntu/Debian)
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libxdo-dev \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

   #### Linux (Fedora/RHEL)
   ```bash
   sudo dnf install webkit2gtk4.1-devel \
     openssl-devel \
     curl \
     wget \
     file \
     libappindicator-gtk3-devel \
     librsvg2-devel
   ```

## Initial Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd photo-reader
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Verify Tauri CLI installation:**
   ```bash
   npm run tauri --version
   ```

## Development Build

### Quick Start (Windows)
```bash
quick-dev.bat
```

### Manual Start
```bash
npm run dev
```

This will:
- Start the Tauri development server
- Open the application window
- Enable hot-reload for frontend changes
- Show console output for debugging

### Development Features
- Hot reload for HTML/CSS/JS changes
- Rust changes require restart
- Console logging enabled
- Debug symbols included

## Production Build

### Quick Build (Windows)
```bash
quick-build.bat
```

### Manual Build

#### Build for Current Platform
```bash
npm run build
```

#### Build for Specific Platform
```bash
# Windows
npm run build:windows

# macOS
npm run build:macos

# Linux
npm run build:linux
```

### Build Output Locations

After building, installers will be in `src-tauri/target/release/bundle/`:

**Windows:**
- `msi/Photo-Reader_1.0.0_x64_en-US.msi` - Windows Installer
- `nsis/Photo-Reader_1.0.0_x64-setup.exe` - NSIS Installer

**macOS:**
- `dmg/Photo-Reader_1.0.0_x64.dmg` - Disk Image
- `macos/Photo-Reader.app` - Application Bundle

**Linux:**
- `deb/photo-reader_1.0.0_amd64.deb` - Debian Package
- `rpm/photo-reader-1.0.0-1.x86_64.rpm` - RPM Package
- `appimage/photo-reader_1.0.0_amd64.AppImage` - AppImage

## Platform-Specific Instructions

### Windows

1. **Install Prerequisites:**
   - Visual Studio Build Tools
   - Rust (via rustup)
   - Node.js

2. **Build:**
   ```bash
   npm run build:windows
   ```

3. **Test Installer:**
   - Navigate to `src-tauri/target/release/bundle/msi/`
   - Run the .msi installer
   - Application installs to `C:\Program Files\Photo-Reader\`

### macOS

1. **Install Prerequisites:**
   ```bash
   xcode-select --install
   ```

2. **Build:**
   ```bash
   npm run build:macos
   ```

3. **Code Signing (Optional):**
   - For distribution, you'll need an Apple Developer account
   - Configure signing in `tauri.conf.json`

4. **Test Application:**
   - Open `src-tauri/target/release/bundle/dmg/Photo-Reader_1.0.0_x64.dmg`
   - Drag to Applications folder

### Linux

1. **Install Prerequisites:**
   ```bash
   # Ubuntu/Debian
   sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
   ```

2. **Build:**
   ```bash
   npm run build:linux
   ```

3. **Install Package:**
   ```bash
   # Debian/Ubuntu
   sudo dpkg -i src-tauri/target/release/bundle/deb/photo-reader_1.0.0_amd64.deb
   
   # Fedora/RHEL
   sudo rpm -i src-tauri/target/release/bundle/rpm/photo-reader-1.0.0-1.x86_64.rpm
   
   # AppImage (no installation needed)
   chmod +x src-tauri/target/release/bundle/appimage/photo-reader_1.0.0_amd64.AppImage
   ./src-tauri/target/release/bundle/appimage/photo-reader_1.0.0_amd64.AppImage
   ```

## Cross-Platform Building

### Building for Windows from Linux/macOS

1. **Install Windows target:**
   ```bash
   rustup target add x86_64-pc-windows-msvc
   ```

2. **Install additional tools:**
   ```bash
   # Linux
   sudo apt install mingw-w64
   
   # macOS
   brew install mingw-w64
   ```

3. **Build:**
   ```bash
   npm run build:windows
   ```

### Building for Linux from Windows/macOS

1. **Install Linux target:**
   ```bash
   rustup target add x86_64-unknown-linux-gnu
   ```

2. **Build:**
   ```bash
   npm run build:linux
   ```

Note: Cross-compilation may have limitations. For best results, build on the target platform.

## Build Optimization

### Release Build Settings

The `Cargo.toml` includes optimizations:
```toml
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

These settings:
- Reduce binary size
- Improve performance
- Remove debug symbols
- Enable link-time optimization

### Bundle Size Reduction

To further reduce bundle size:
1. Remove unused dependencies
2. Optimize assets (compress images, minify JS/CSS)
3. Use production builds of libraries

## Troubleshooting

### Common Issues

#### 1. Rust Not Found
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### 2. WebKit2GTK Not Found (Linux)
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

#### 3. Build Fails with "linker not found"
```bash
# Update Rust
rustup update

# Install build tools
# Windows: Install Visual Studio Build Tools
# Linux: sudo apt install build-essential
# macOS: xcode-select --install
```

#### 4. Icon Errors
Ensure all icon files exist in `src-tauri/icons/`:
- 32x32.png
- 128x128.png
- 128x128@2x.png
- icon.icns (macOS)
- icon.ico (Windows)

#### 5. Permission Denied (Linux)
```bash
chmod +x src-tauri/target/release/photo-reader
```

#### 6. Clean Build
If you encounter persistent issues:
```bash
# Clean Rust build
cd src-tauri
cargo clean
cd ..

# Clean Node modules
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Getting Help

If you encounter issues:
1. Check the error message carefully
2. Search for the error in Tauri documentation
3. Check GitHub issues
4. Ensure all prerequisites are installed
5. Try a clean build

## Build Verification

After building, verify the application:

1. **Check file exists:**
   ```bash
   ls -la src-tauri/target/release/bundle/
   ```

2. **Test the installer:**
   - Install the application
   - Launch it
   - Test core functionality
   - Check for errors in console

3. **Verify bundle contents:**
   - Application launches correctly
   - All assets are included
   - File operations work
   - UI renders properly

## Next Steps

After successful build:
1. Test the application thoroughly
2. Create release notes
3. Prepare distribution packages
4. Set up auto-updates (optional)
5. Submit to app stores (optional)

## Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [Rust Documentation](https://doc.rust-lang.org/)
- [Node.js Documentation](https://nodejs.org/docs/)
