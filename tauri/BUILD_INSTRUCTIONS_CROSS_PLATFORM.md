# Photo-Reader - Cross-Platform Build Instructions

Complete guide for building Photo-Reader on Windows, macOS, Ubuntu, and Fedora.

## Table of Contents
- [Overview](#overview)
- [Prerequisites by Platform](#prerequisites-by-platform)
- [Quick Start](#quick-start)
- [Development](#development)
- [Building](#building)
- [Platform-Specific Details](#platform-specific-details)
- [Troubleshooting](#troubleshooting)

---

## Overview

Photo-Reader is a cross-platform Tauri application that can be built on:
- **Windows** → MSI and NSIS installers
- **macOS** → DMG and APP bundles
- **Ubuntu/Debian** → DEB packages and AppImage
- **Fedora/RHEL** → RPM packages

**Important:** You must build on the target platform. Cross-compilation from Windows to macOS/Linux (or vice versa) is not supported.

---

## Prerequisites by Platform

### Windows

1. **Install Rust:**
   ```powershell
   # Download and run rustup-init.exe from https://rustup.rs/
   # Or use winget:
   winget install Rustlang.Rustup
   ```

2. **Install Node.js:**
   ```powershell
   # Download from https://nodejs.org/ (v16 or later)
   # Or use winget:
   winget install OpenJS.NodeJS
   ```

3. **Install Visual Studio Build Tools:**
   ```powershell
   # Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   # Or use winget:
   winget install Microsoft.VisualStudio.2022.BuildTools
   ```

4. **WebView2** (pre-installed on Windows 10/11)

### macOS

1. **Install Xcode Command Line Tools:**
   ```bash
   xcode-select --install
   ```

2. **Install Rust:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

3. **Install Node.js:**
   ```bash
   # Using Homebrew:
   brew install node
   
   # Or download from https://nodejs.org/
   ```

### Ubuntu/Debian

1. **Install System Dependencies:**
   ```bash
   sudo apt update
   sudo apt install -y \
     libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libxdo-dev \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

2. **Install Rust:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

3. **Install Node.js:**
   ```bash
   # Using NodeSource:
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Or using snap:
   sudo snap install node --classic
   ```

### Fedora/RHEL

1. **Install System Dependencies:**
   ```bash
   sudo dnf install -y \
     webkit2gtk4.1-devel \
     openssl-devel \
     curl \
     wget \
     file \
     libappindicator-gtk3-devel \
     librsvg2-devel \
     gcc \
     gcc-c++ \
     make
   ```

2. **Install Rust:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

3. **Install Node.js:**
   ```bash
   # Using dnf:
   sudo dnf install -y nodejs npm
   
   # Or using NodeSource:
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo dnf install -y nodejs
   ```

---

## Quick Start

### Initial Setup (All Platforms)

1. **Navigate to project directory:**
   ```bash
   cd photo-reader/tauri
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm run tauri --version
   rustc --version
   node --version
   ```

---

## Development

### Windows

**Quick Start:**
```batch
quick-dev.bat
```

**Manual:**
```batch
npm run dev:windows
```

### macOS

**Quick Start:**
```bash
chmod +x quick-dev.sh
./quick-dev.sh
```

**Manual:**
```bash
npm run dev:mac
```

### Linux (Ubuntu/Debian/Fedora)

**Quick Start:**
```bash
chmod +x quick-dev.sh
./quick-dev.sh
```

**Manual:**
```bash
npm run dev:linux
```

### Development Features
- Hot reload for HTML/CSS/JS changes
- Rust changes require application restart
- Console logging enabled
- Debug symbols included

---

## Building

### Windows

**Quick Build:**
```batch
quick-build.bat
```

**Manual Build:**
```batch
npm run build:windows
```

**Output Location:**
```
src-tauri\target\release\bundle\
├── msi\Photo-Reader_1.0.0_x64_en-US.msi
└── nsis\Photo-Reader_1.0.0_x64-setup.exe
```

**Installation:**
- Double-click the MSI or NSIS installer
- Follow installation wizard
- Application installs to `C:\Program Files\Photo-Reader\`

### macOS

**Quick Build:**
```bash
chmod +x quick-build.sh
./quick-build.sh
```

**Manual Build:**
```bash
npm run build:mac
```

**Output Location:**
```
src-tauri/target/release/bundle/
├── dmg/Photo-Reader_1.0.0_x64.dmg
└── macos/Photo-Reader.app
```

**Installation:**
- Open the DMG file
- Drag Photo-Reader.app to Applications folder
- Or run directly from bundle/macos/

**Code Signing (Optional):**
For distribution outside the App Store, you'll need:
- Apple Developer account
- Developer ID certificate
- Configure in `tauri.conf.json`

### Ubuntu/Debian

**Quick Build:**
```bash
chmod +x quick-build.sh
./quick-build.sh
```

**Manual Build:**
```bash
npm run build:linux-deb
```

**Output Location:**
```
src-tauri/target/release/bundle/
├── deb/photo-reader_1.0.0_amd64.deb
└── appimage/photo-reader_1.0.0_amd64.AppImage
```

**Installation:**

**DEB Package:**
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/photo-reader_1.0.0_amd64.deb

# If dependencies are missing:
sudo apt install -f
```

**AppImage:**
```bash
chmod +x src-tauri/target/release/bundle/appimage/photo-reader_1.0.0_amd64.AppImage
./src-tauri/target/release/bundle/appimage/photo-reader_1.0.0_amd64.AppImage
```

### Fedora/RHEL

**Quick Build:**
```bash
chmod +x quick-build.sh
./quick-build.sh
```

**Manual Build:**
```bash
npm run build:linux-rpm
```

**Output Location:**
```
src-tauri/target/release/bundle/
└── rpm/photo-reader-1.0.0-1.x86_64.rpm
```

**Installation:**
```bash
sudo rpm -i src-tauri/target/release/bundle/rpm/photo-reader-1.0.0-1.x86_64.rpm

# Or using dnf:
sudo dnf install src-tauri/target/release/bundle/rpm/photo-reader-1.0.0-1.x86_64.rpm
```

---

## Platform-Specific Details

### Windows Specifics

**Bundle Types:**
- **MSI:** Windows Installer format, recommended for enterprise deployment
- **NSIS:** Nullsoft Scriptable Install System, smaller size, more customizable

**Build Optimization:**
The release build is optimized for size and performance:
```toml
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

**Antivirus:**
Some antivirus software may flag the installer. This is a false positive. You can:
- Add an exception for the build directory
- Sign the executable with a code signing certificate

### macOS Specifics

**Architecture:**
- Builds for x64 (Intel) by default
- For Apple Silicon (M1/M2), use: `npm run build:mac -- --target aarch64-apple-darwin`
- For universal binary: `npm run build:mac -- --target universal-apple-darwin`

**Gatekeeper:**
Unsigned apps will show a warning. Users can:
1. Right-click the app → Open
2. Or: System Preferences → Security & Privacy → Allow

**Distribution:**
- For App Store: Requires Apple Developer Program membership
- For direct distribution: Consider notarization

### Linux Specifics

**Package Formats:**
- **DEB:** For Debian-based distributions (Ubuntu, Mint, etc.)
- **RPM:** For Red Hat-based distributions (Fedora, RHEL, CentOS)
- **AppImage:** Universal format, runs on any Linux distribution

**Desktop Integration:**
All package formats include:
- Desktop entry file
- Application icon
- MIME type associations (if configured)

**Dependencies:**
The packages include dependency information, but you may need to install:
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-0

# Fedora
sudo dnf install webkit2gtk4.1
```

---

## Troubleshooting

### Common Issues

#### 1. "Rust not found" or "cargo not found"

**Solution:**
```bash
# Ensure Rust is in PATH
source $HOME/.cargo/env

# Or restart terminal/IDE

# Verify:
rustc --version
cargo --version
```

#### 2. "WebKit2GTK not found" (Linux)

**Solution:**
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel
```

#### 3. Build fails with "linker not found"

**Windows:**
- Install Visual Studio Build Tools
- Restart terminal after installation

**macOS:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt install build-essential  # Ubuntu/Debian
sudo dnf groupinstall "Development Tools"  # Fedora
```

#### 4. "Permission denied" when running scripts (Unix)

**Solution:**
```bash
chmod +x quick-dev.sh
chmod +x quick-build.sh
```

#### 5. Build succeeds but app won't launch

**Check:**
- All dependencies are installed
- No antivirus blocking (Windows)
- Gatekeeper settings (macOS)
- Execute permissions (Linux)

**Debug:**
```bash
# Run from terminal to see error messages
./src-tauri/target/release/photo-reader  # Linux/macOS
src-tauri\target\release\photo-reader.exe  # Windows
```

#### 6. Clean build needed

**Solution:**
```bash
# Clean Rust build artifacts
cd src-tauri
cargo clean
cd ..

# Clean Node modules (if needed)
rm -rf node_modules
npm install

# Rebuild
npm run build
```

#### 7. Icon errors during build

**Verify icons exist:**
```
src-tauri/icons/
├── 32x32.png
├── 128x128.png
├── 128x128@2x.png
├── icon.icns (macOS)
└── icon.ico (Windows)
```

#### 8. Out of memory during build

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Platform-Specific Issues

#### Windows: "MSVC not found"
- Install Visual Studio Build Tools
- Ensure "Desktop development with C++" workload is selected

#### macOS: "xcrun: error"
- Run: `xcode-select --install`
- Accept license: `sudo xcodebuild -license accept`

#### Linux: "error while loading shared libraries"
```bash
# Update library cache
sudo ldconfig

# Install missing libraries
sudo apt install --fix-missing  # Ubuntu/Debian
sudo dnf install --best --allowerasing  # Fedora
```

---

## Build Verification

After building, verify the application:

1. **Check build output:**
   ```bash
   ls -la src-tauri/target/release/bundle/
   ```

2. **Test the installer:**
   - Install the application
   - Launch it
   - Test core functionality:
     - Load a PDF file
     - Load a text file
     - Test slideshow controls
     - Test fullscreen mode
     - Test word-by-word display

3. **Check for errors:**
   - Open developer console (if available)
   - Check system logs
   - Verify file operations work

---

## Performance Optimization

### Build Size Reduction

The application is already optimized, but you can further reduce size:

1. **Strip debug symbols** (already enabled in release profile)
2. **Compress assets:**
   ```bash
   # Optimize images
   optipng src/icons/*.png
   
   # Minify CSS/JS (if not already done)
   ```

3. **Remove unused dependencies:**
   - Review `package.json`
   - Remove unused npm packages

### Runtime Performance

The application is optimized for:
- Fast startup time
- Low memory usage
- Smooth UI rendering
- Efficient file handling

---

## Distribution

### Windows
- Upload MSI/NSIS to website
- Consider code signing for trust
- Provide SHA256 checksums

### macOS
- Upload DMG to website
- Consider notarization for Gatekeeper
- Provide installation instructions

### Linux
- Upload DEB/RPM to website
- Consider hosting in package repositories
- AppImage works universally

---

## Next Steps

After successful build:
1. ✅ Test thoroughly on target platform
2. ✅ Create release notes
3. ✅ Generate checksums for downloads
4. ✅ Update documentation
5. ⏭️ Set up auto-updates (optional)
6. ⏭️ Submit to app stores (optional)

---

## Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [Tauri Building Guide](https://tauri.app/v1/guides/building/)
- [Rust Documentation](https://doc.rust-lang.org/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

## Support

If you encounter issues not covered here:
1. Check the error message carefully
2. Search Tauri GitHub issues
3. Review platform-specific documentation
4. Ensure all prerequisites are installed
5. Try a clean build

For project-specific issues, refer to:
- `PLATFORM_SETUP.md` - Detailed platform setup
- `CROSS_PLATFORM_SUMMARY.md` - Quick overview
- `QUICK_REFERENCE.md` - Command reference
