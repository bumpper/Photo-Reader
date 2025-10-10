# Photo-Reader - Platform Setup Guide

Detailed setup instructions for building Photo-Reader on Windows, macOS, Ubuntu, and Fedora.

## Table of Contents
- [Windows Setup](#windows-setup)
- [macOS Setup](#macos-setup)
- [Ubuntu/Debian Setup](#ubuntudebian-setup)
- [Fedora/RHEL Setup](#fedorarhel-setup)
- [Verification](#verification)
- [Common Issues](#common-issues)

---

## Windows Setup

### System Requirements
- Windows 10 or later (64-bit)
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space
- Internet connection for downloads

### Step 1: Install Rust

**Option A: Using rustup-init.exe (Recommended)**
1. Download from https://rustup.rs/
2. Run `rustup-init.exe`
3. Follow the installation wizard
4. Choose default installation options
5. Restart terminal after installation

**Option B: Using winget**
```powershell
winget install Rustlang.Rustup
```

**Verify Installation:**
```powershell
rustc --version
cargo --version
```

### Step 2: Install Node.js

**Option A: Download Installer**
1. Visit https://nodejs.org/
2. Download LTS version (v18 or later)
3. Run installer
4. Check "Add to PATH" option
5. Complete installation

**Option B: Using winget**
```powershell
winget install OpenJS.NodeJS.LTS
```

**Verify Installation:**
```powershell
node --version
npm --version
```

### Step 3: Install Visual Studio Build Tools

**Option A: Download Installer**
1. Visit https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Download Build Tools installer
3. Run installer
4. Select "Desktop development with C++"
5. Install (requires ~6GB)

**Option B: Using winget**
```powershell
winget install Microsoft.VisualStudio.2022.BuildTools --silent --override "--wait --quiet --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

**Required Components:**
- MSVC v143 - VS 2022 C++ x64/x86 build tools
- Windows 10/11 SDK
- C++ CMake tools for Windows

### Step 4: Verify WebView2

WebView2 is pre-installed on Windows 10/11. To verify:

```powershell
# Check if WebView2 is installed
Get-AppxPackage -Name Microsoft.WebView2
```

If not installed, download from:
https://developer.microsoft.com/microsoft-edge/webview2/

### Step 5: Clone/Setup Project

```powershell
cd "F:\Daniel\My Web Sites\radius.center\photo-reader\tauri"
npm install
```

### Step 6: Test Setup

```powershell
# Quick test
quick-dev.bat

# Or manual test
npm run dev:windows
```

---

## macOS Setup

### System Requirements
- macOS 10.13 (High Sierra) or later
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space
- Xcode Command Line Tools

### Step 1: Install Xcode Command Line Tools

```bash
xcode-select --install
```

Click "Install" in the dialog that appears. This includes:
- Clang compiler
- Git
- Make and other build tools

**Verify Installation:**
```bash
xcode-select -p
# Should output: /Library/Developer/CommandLineTools
```

**Accept License:**
```bash
sudo xcodebuild -license accept
```

### Step 2: Install Homebrew (Optional but Recommended)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen instructions to add Homebrew to PATH.

### Step 3: Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Choose default installation (option 1).

**Add to PATH:**
```bash
source $HOME/.cargo/env
```

**Add to shell profile:**
```bash
echo 'source $HOME/.cargo/env' >> ~/.zshrc  # For zsh
# or
echo 'source $HOME/.cargo/env' >> ~/.bash_profile  # For bash
```

**Verify Installation:**
```bash
rustc --version
cargo --version
```

### Step 4: Install Node.js

**Option A: Using Homebrew (Recommended)**
```bash
brew install node
```

**Option B: Download Installer**
1. Visit https://nodejs.org/
2. Download macOS installer
3. Run installer
4. Follow installation wizard

**Verify Installation:**
```bash
node --version
npm --version
```

### Step 5: Setup Project

```bash
cd ~/path/to/photo-reader/tauri
npm install
```

### Step 6: Test Setup

```bash
# Make scripts executable
chmod +x quick-dev.sh
chmod +x quick-build.sh

# Quick test
./quick-dev.sh

# Or manual test
npm run dev:mac
```

### Optional: Code Signing Setup

For distribution, you'll need:

1. **Apple Developer Account** ($99/year)
2. **Developer ID Certificate:**
   - Log in to Apple Developer portal
   - Create Developer ID Application certificate
   - Download and install in Keychain

3. **Configure in tauri.conf.json:**
   ```json
   "macOS": {
     "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
   }
   ```

---

## Ubuntu/Debian Setup

### System Requirements
- Ubuntu 20.04 LTS or later (or Debian 11+)
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

### Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install System Dependencies

```bash
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf
```

**Package Breakdown:**
- `libwebkit2gtk-4.1-dev` - WebView rendering engine
- `build-essential` - GCC, G++, Make
- `libssl-dev` - SSL/TLS support
- `libayatana-appindicator3-dev` - System tray support
- `librsvg2-dev` - SVG rendering
- `patchelf` - Binary patching for AppImage

### Step 3: Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Choose default installation (option 1).

**Add to PATH:**
```bash
source $HOME/.cargo/env
```

**Add to shell profile:**
```bash
echo 'source $HOME/.cargo/env' >> ~/.bashrc
```

**Verify Installation:**
```bash
rustc --version
cargo --version
```

### Step 4: Install Node.js

**Option A: Using NodeSource (Recommended)**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Option B: Using Snap**
```bash
sudo snap install node --classic
```

**Verify Installation:**
```bash
node --version
npm --version
```

### Step 5: Setup Project

```bash
cd ~/path/to/photo-reader/tauri
npm install
```

### Step 6: Test Setup

```bash
# Make scripts executable
chmod +x quick-dev.sh
chmod +x quick-build.sh

# Quick test
./quick-dev.sh

# Or manual test
npm run dev:linux
```

---

## Fedora/RHEL Setup

### System Requirements
- Fedora 36+ or RHEL 8+
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

### Step 1: Update System

```bash
sudo dnf update -y
```

### Step 2: Install System Dependencies

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
  make \
  patchelf
```

**For RHEL, enable EPEL repository first:**
```bash
sudo dnf install -y epel-release
```

**Package Breakdown:**
- `webkit2gtk4.1-devel` - WebView rendering engine
- `openssl-devel` - SSL/TLS support
- `gcc`, `gcc-c++`, `make` - Build tools
- `libappindicator-gtk3-devel` - System tray support
- `librsvg2-devel` - SVG rendering
- `patchelf` - Binary patching

### Step 3: Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Choose default installation (option 1).

**Add to PATH:**
```bash
source $HOME/.cargo/env
```

**Add to shell profile:**
```bash
echo 'source $HOME/.cargo/env' >> ~/.bashrc
```

**Verify Installation:**
```bash
rustc --version
cargo --version
```

### Step 4: Install Node.js

**Option A: Using dnf (Recommended)**
```bash
sudo dnf install -y nodejs npm
```

**Option B: Using NodeSource**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
```

**Verify Installation:**
```bash
node --version
npm --version
```

### Step 5: Setup Project

```bash
cd ~/path/to/photo-reader/tauri
npm install
```

### Step 6: Test Setup

```bash
# Make scripts executable
chmod +x quick-dev.sh
chmod +x quick-build.sh

# Quick test
./quick-dev.sh

# Or manual test
npm run dev:linux
```

---

## Verification

After completing setup on any platform, verify everything is working:

### 1. Check Rust Installation

```bash
rustc --version
# Expected: rustc 1.70.0 or later

cargo --version
# Expected: cargo 1.70.0 or later
```

### 2. Check Node.js Installation

```bash
node --version
# Expected: v16.0.0 or later

npm --version
# Expected: 8.0.0 or later
```

### 3. Check Tauri CLI

```bash
cd photo-reader/tauri
npm run tauri --version
# Expected: tauri-cli 2.0.0 or later
```

### 4. Test Development Build

```bash
# Windows
quick-dev.bat

# macOS/Linux
./quick-dev.sh
```

The application should launch successfully.

### 5. Test Production Build

```bash
# Windows
quick-build.bat

# macOS/Linux
./quick-build.sh
```

Check for build artifacts in `src-tauri/target/release/bundle/`.

---

## Common Issues

### Issue: "Rust not found" after installation

**Solution:**
```bash
# Reload shell environment
source $HOME/.cargo/env

# Or restart terminal
```

### Issue: "Permission denied" on scripts (Unix)

**Solution:**
```bash
chmod +x quick-dev.sh
chmod +x quick-build.sh
```

### Issue: "WebKit2GTK not found" (Linux)

**Solution:**
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel
```

### Issue: "MSVC not found" (Windows)

**Solution:**
- Install Visual Studio Build Tools
- Ensure "Desktop development with C++" is selected
- Restart terminal after installation

### Issue: "xcrun: error" (macOS)

**Solution:**
```bash
xcode-select --install
sudo xcodebuild -license accept
```

### Issue: Build fails with "out of memory"

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clean and reinstall dependencies
rm -rf node_modules
npm install
```

---

## Environment Variables

### Optional Configuration

**Custom Rust toolchain:**
```bash
export RUSTUP_TOOLCHAIN=stable
```

**Custom Node.js memory:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

**Tauri debug mode:**
```bash
export TAURI_DEBUG=1
```

---

## Next Steps

After successful setup:
1. ✅ Read `BUILD_INSTRUCTIONS_CROSS_PLATFORM.md` for build instructions
2. ✅ Review `QUICK_REFERENCE.md` for command reference
3. ✅ Check `CROSS_PLATFORM_SUMMARY.md` for overview
4. ✅ Start developing or building!

---

## Platform-Specific Notes

### Windows
- Builds take longer on first run (compiling dependencies)
- Antivirus may slow down builds - add exclusion for project folder
- WebView2 updates automatically via Windows Update

### macOS
- First build may prompt for keychain access - allow it
- Gatekeeper may block unsigned apps - right-click → Open
- For M1/M2 Macs, builds are native ARM64

### Linux
- Different distributions may have slightly different package names
- AppImage is the most portable format
- Desktop integration happens automatically with DEB/RPM

---

## Support

If you encounter issues:
1. Check error messages carefully
2. Verify all prerequisites are installed
3. Try a clean build
4. Search Tauri documentation
5. Check GitHub issues

For project-specific help, refer to other documentation files in this directory.
