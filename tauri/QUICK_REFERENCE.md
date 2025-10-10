# Photo-Reader - Quick Reference Guide

Fast command reference for building Photo-Reader on all platforms.

## Quick Start Commands

### Windows
```batch
# Development
quick-dev.bat
# or
npm run dev:windows

# Build
quick-build.bat
# or
npm run build:windows
```

### macOS
```bash
# Development
./quick-dev.sh
# or
npm run dev:mac

# Build
./quick-build.sh
# or
npm run build:mac
```

### Ubuntu/Debian
```bash
# Development
./quick-dev.sh
# or
npm run dev:linux

# Build (DEB + AppImage)
./quick-build.sh
# or
npm run build:linux-deb
```

### Fedora/RHEL
```bash
# Development
./quick-dev.sh
# or
npm run dev:linux

# Build (RPM)
./quick-build.sh
# or
npm run build:linux-rpm
```

---

## NPM Scripts Reference

### Development Scripts
```bash
npm run dev              # Generic dev (auto-detect platform)
npm run dev:windows      # Windows development
npm run dev:mac          # macOS development
npm run dev:linux        # Linux development
```

### Build Scripts
```bash
npm run build            # Generic build (all formats for platform)
npm run build:windows    # Windows (MSI + NSIS)
npm run build:mac        # macOS (DMG + APP)
npm run build:macos      # Alias for build:mac
npm run build:linux      # Linux (DEB + AppImage)
npm run build:linux-deb  # Linux DEB + AppImage
npm run build:linux-rpm  # Linux RPM
npm run build:fedora     # Alias for build:linux-rpm
```

### Utility Scripts
```bash
npm run tauri            # Run Tauri CLI directly
npm run platform:info    # Display platform information
```

---

## Tauri CLI Commands

### Direct Tauri Commands
```bash
# Development
npm run tauri dev

# Build with specific bundles
npm run tauri build --bundles msi
npm run tauri build --bundles dmg
npm run tauri build --bundles deb
npm run tauri build --bundles rpm
npm run tauri build --bundles appimage

# Build multiple bundles
npm run tauri build --bundles msi nsis
npm run tauri build --bundles deb appimage

# Get help
npm run tauri --help
npm run tauri build --help
```

---

## File Locations

### Source Files
```
photo-reader/tauri/
├── src/                    # Frontend source
│   ├── index.html
│   ├── script.js
│   └── style.css
├── src-tauri/              # Rust backend
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
└── scripts/                # Build scripts
    └── platform-utils.js
```

### Build Output

**Windows:**
```
src-tauri\target\release\bundle\
├── msi\Photo-Reader_1.0.0_x64_en-US.msi
└── nsis\Photo-Reader_1.0.0_x64-setup.exe
```

**macOS:**
```
src-tauri/target/release/bundle/
├── dmg/Photo-Reader_1.0.0_x64.dmg
└── macos/Photo-Reader.app
```

**Linux:**
```
src-tauri/target/release/bundle/
├── deb/photo-reader_1.0.0_amd64.deb
├── appimage/photo-reader_1.0.0_amd64.AppImage
└── rpm/photo-reader-1.0.0-1.x86_64.rpm
```

---

## Installation Commands

### Windows
```batch
# Run MSI installer
start src-tauri\target\release\bundle\msi\Photo-Reader_1.0.0_x64_en-US.msi

# Or NSIS installer
start src-tauri\target\release\bundle\nsis\Photo-Reader_1.0.0_x64-setup.exe
```

### macOS
```bash
# Open DMG
open src-tauri/target/release/bundle/dmg/Photo-Reader_1.0.0_x64.dmg

# Or run APP directly
open src-tauri/target/release/bundle/macos/Photo-Reader.app
```

### Ubuntu/Debian
```bash
# Install DEB
sudo dpkg -i src-tauri/target/release/bundle/deb/photo-reader_1.0.0_amd64.deb

# Fix dependencies if needed
sudo apt install -f

# Or run AppImage
chmod +x src-tauri/target/release/bundle/appimage/photo-reader_1.0.0_amd64.AppImage
./src-tauri/target/release/bundle/appimage/photo-reader_1.0.0_amd64.AppImage
```

### Fedora/RHEL
```bash
# Install RPM
sudo rpm -i src-tauri/target/release/bundle/rpm/photo-reader-1.0.0-1.x86_64.rpm

# Or using dnf
sudo dnf install src-tauri/target/release/bundle/rpm/photo-reader-1.0.0-1.x86_64.rpm
```

---

## Common Tasks

### Clean Build
```bash
# Clean Rust artifacts
cd src-tauri
cargo clean
cd ..

# Clean Node modules (if needed)
rm -rf node_modules
npm install
```

### Update Dependencies
```bash
# Update npm packages
npm update

# Update Rust dependencies
cd src-tauri
cargo update
cd ..
```

### Check Versions
```bash
# Node.js and npm
node --version
npm --version

# Rust and Cargo
rustc --version
cargo --version

# Tauri CLI
npm run tauri --version
```

### Make Scripts Executable (Unix)
```bash
chmod +x quick-dev.sh
chmod +x quick-build.sh
```

---

## Troubleshooting Commands

### Verify Prerequisites

**All Platforms:**
```bash
node --version    # Should be v16+
npm --version     # Should be 8+
rustc --version   # Should be 1.70+
cargo --version   # Should be 1.70+
```

**Windows:**
```powershell
# Check Visual Studio Build Tools
where cl.exe

# Check WebView2
Get-AppxPackage -Name Microsoft.WebView2
```

**macOS:**
```bash
# Check Xcode tools
xcode-select -p

# Check Homebrew (optional)
brew --version
```

**Linux:**
```bash
# Check WebKit2GTK
pkg-config --modversion webkit2gtk-4.1

# Check build tools
gcc --version
g++ --version
make --version
```

### Debug Build Issues

```bash
# Verbose build output
npm run tauri build -- --verbose

# Check Rust compilation
cd src-tauri
cargo build --release
cd ..

# Test without bundling
npm run tauri build --bundles none
```

### Clean Everything
```bash
# Nuclear option - clean everything
rm -rf node_modules
rm -rf src-tauri/target
npm install
npm run build
```

---

## Environment Variables

### Useful Variables
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Tauri debug mode
export TAURI_DEBUG=1

# Rust backtrace
export RUST_BACKTRACE=1

# Custom Rust toolchain
export RUSTUP_TOOLCHAIN=stable
```

---

## Git Commands (for Multi-Platform)

### Workflow for Building on Multiple Platforms

```bash
# On development machine (e.g., Windows)
git add .
git commit -m "Update for cross-platform build"
git push origin main

# On macOS machine
git pull origin main
npm install
./quick-build.sh

# On Linux machine
git pull origin main
npm install
./quick-build.sh
```

---

## Platform Detection

### Check Current Platform
```bash
# Using Node.js
node -e "console.log(process.platform)"
# Output: win32, darwin, or linux

# Using platform-utils
npm run platform:info
```

---

## Bundle Size Optimization

### Check Bundle Size
```bash
# Windows
dir src-tauri\target\release\bundle\msi\*.msi
dir src-tauri\target\release\bundle\nsis\*.exe

# Unix
ls -lh src-tauri/target/release/bundle/dmg/*.dmg
ls -lh src-tauri/target/release/bundle/deb/*.deb
ls -lh src-tauri/target/release/bundle/rpm/*.rpm
ls -lh src-tauri/target/release/bundle/appimage/*.AppImage
```

### Optimize Build
```bash
# Already optimized in Cargo.toml
# But you can strip further:
cd src-tauri/target/release
strip photo-reader  # Unix
strip photo-reader.exe  # Windows (if strip.exe available)
```

---

## Testing Commands

### Run Built Application

**Windows:**
```batch
src-tauri\target\release\photo-reader.exe
```

**macOS:**
```bash
./src-tauri/target/release/photo-reader
# Or
open src-tauri/target/release/bundle/macos/Photo-Reader.app
```

**Linux:**
```bash
./src-tauri/target/release/photo-reader
```

---

## Documentation Files

Quick access to documentation:

```bash
# View in terminal (Unix)
cat BUILD_INSTRUCTIONS_CROSS_PLATFORM.md
cat PLATFORM_SETUP.md
cat CROSS_PLATFORM_SUMMARY.md
cat QUICK_REFERENCE.md

# Open in default editor
code BUILD_INSTRUCTIONS_CROSS_PLATFORM.md  # VS Code
nano PLATFORM_SETUP.md                      # Nano
vim CROSS_PLATFORM_SUMMARY.md               # Vim
```

---

## Keyboard Shortcuts (in Dev Mode)

When running `npm run dev`:

- **Ctrl+R** / **Cmd+R** - Reload application
- **Ctrl+Shift+I** / **Cmd+Option+I** - Open DevTools (if enabled)
- **Ctrl+Q** / **Cmd+Q** - Quit application

---

## Quick Fixes

### "Permission denied" (Unix)
```bash
chmod +x quick-dev.sh quick-build.sh
```

### "Command not found: tauri"
```bash
npm install
```

### "Rust not found"
```bash
source $HOME/.cargo/env
```

### "WebKit2GTK not found" (Linux)
```bash
sudo apt install libwebkit2gtk-4.1-dev  # Ubuntu/Debian
sudo dnf install webkit2gtk4.1-devel     # Fedora
```

### "MSVC not found" (Windows)
- Install Visual Studio Build Tools
- Restart terminal

### Build hangs or crashes
```bash
# Increase memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## One-Liners

### Complete Setup (Unix)
```bash
npm install && chmod +x quick-dev.sh quick-build.sh && ./quick-dev.sh
```

### Complete Setup (Windows)
```batch
npm install && quick-dev.bat
```

### Build All Formats (Platform-Specific)
```bash
# Windows
npm run build:windows

# macOS
npm run build:mac

# Linux (DEB + AppImage)
npm run build:linux-deb

# Linux (RPM)
npm run build:linux-rpm
```

### Quick Test
```bash
npm install && npm run dev
```

---

## Cheat Sheet

| Task | Windows | macOS/Linux |
|------|---------|-------------|
| **Dev** | `quick-dev.bat` | `./quick-dev.sh` |
| **Build** | `quick-build.bat` | `./quick-build.sh` |
| **Clean** | `cd src-tauri && cargo clean` | `cd src-tauri && cargo clean` |
| **Update** | `npm update` | `npm update` |
| **Test** | `src-tauri\target\release\photo-reader.exe` | `./src-tauri/target/release/photo-reader` |

---

## Support

For detailed information, see:
- **BUILD_INSTRUCTIONS_CROSS_PLATFORM.md** - Complete build guide
- **PLATFORM_SETUP.md** - Platform-specific setup
- **CROSS_PLATFORM_SUMMARY.md** - Overview and comparison

For issues:
1. Check error message
2. Verify prerequisites
3. Try clean build
4. Search Tauri docs
5. Check GitHub issues
