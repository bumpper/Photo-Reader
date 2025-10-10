# Photo-Reader - Cross-Platform Summary

Quick overview of Photo-Reader's cross-platform capabilities and build process.

## Executive Summary

Photo-Reader is a **fully cross-platform** Tauri desktop application that can be built and run on:
- ✅ **Windows** (10/11)
- ✅ **macOS** (10.13+)
- ✅ **Ubuntu/Debian** Linux
- ✅ **Fedora/RHEL** Linux

**Key Point:** You must build on the target platform. Cross-compilation from Windows to macOS/Linux (or vice versa) is **not supported**.

---

## Platform Comparison

| Feature | Windows | macOS | Ubuntu/Debian | Fedora/RHEL |
|---------|---------|-------|---------------|-------------|
| **Bundle Formats** | MSI, NSIS | DMG, APP | DEB, AppImage | RPM |
| **Quick Scripts** | ✅ .bat | ✅ .sh | ✅ .sh | ✅ .sh |
| **Auto-detect** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Code Signing** | Optional | Optional | Not needed | Not needed |
| **Native Build** | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **Cross-compile** | ❌ No | ❌ No | ❌ No | ❌ No |

---

## Quick Start by Platform

### Windows
```batch
# Development
quick-dev.bat

# Build
quick-build.bat

# Output
src-tauri\target\release\bundle\msi\
src-tauri\target\release\bundle\nsis\
```

### macOS
```bash
# Development
chmod +x quick-dev.sh && ./quick-dev.sh

# Build
chmod +x quick-build.sh && ./quick-build.sh

# Output
src-tauri/target/release/bundle/dmg/
src-tauri/target/release/bundle/macos/
```

### Ubuntu/Debian
```bash
# Development
chmod +x quick-dev.sh && ./quick-dev.sh

# Build
chmod +x quick-build.sh && ./quick-build.sh

# Output
src-tauri/target/release/bundle/deb/
src-tauri/target/release/bundle/appimage/
```

### Fedora/RHEL
```bash
# Development
chmod +x quick-dev.sh && ./quick-dev.sh

# Build
chmod +x quick-build.sh && ./quick-build.sh

# Output
src-tauri/target/release/bundle/rpm/
```

---

## Build Targets

### Windows
- **MSI** - Windows Installer (recommended for enterprise)
- **NSIS** - Nullsoft installer (smaller, more customizable)

### macOS
- **DMG** - Disk image (standard distribution format)
- **APP** - Application bundle (can be run directly)

### Linux
- **DEB** - Debian package (Ubuntu, Debian, Mint, etc.)
- **AppImage** - Universal Linux format (runs anywhere)
- **RPM** - Red Hat package (Fedora, RHEL, CentOS)

---

## Prerequisites Summary

### All Platforms
- **Rust** (latest stable)
- **Node.js** (v16+)
- **npm** (comes with Node.js)

### Platform-Specific

**Windows:**
- Visual Studio Build Tools
- WebView2 (pre-installed on Win10/11)

**macOS:**
- Xcode Command Line Tools

**Ubuntu/Debian:**
- libwebkit2gtk-4.1-dev
- build-essential
- Additional system libraries

**Fedora/RHEL:**
- webkit2gtk4.1-devel
- gcc/gcc-c++
- Additional system libraries

---

## Key Limitations

### ❌ No Cross-Compilation
You **cannot**:
- Build macOS apps on Windows
- Build Windows apps on Linux
- Build Linux apps on macOS

You **must** build on the target platform.

### ✅ What You Can Do
- Copy project files between platforms
- Build natively on each platform
- Use same source code everywhere
- Share configuration files

---

## Workflow for Multi-Platform Release

1. **Develop on your primary platform** (e.g., Windows)
2. **Test locally** using quick-dev scripts
3. **Commit code to Git repository**
4. **On each target platform:**
   - Pull latest code
   - Run `npm install`
   - Run quick-build script
   - Test the generated installer
5. **Collect all installers** for distribution

### Example Multi-Platform Build Process

```bash
# On Windows machine
git clone <repo>
cd photo-reader/tauri
npm install
quick-build.bat
# Collect: MSI and NSIS installers

# On macOS machine
git clone <repo>
cd photo-reader/tauri
npm install
./quick-build.sh
# Collect: DMG and APP bundle

# On Ubuntu machine
git clone <repo>
cd photo-reader/tauri
npm install
./quick-build.sh
# Collect: DEB and AppImage

# On Fedora machine
git clone <repo>
cd photo-reader/tauri
npm install
./quick-build.sh
# Collect: RPM package
```

---

## Architecture Support

### Current Support
- **x64** (Intel/AMD 64-bit) - All platforms
- **ARM64** (Apple Silicon) - macOS only (requires specific build command)

### Building for Apple Silicon (M1/M2)
```bash
npm run build:mac -- --target aarch64-apple-darwin
```

### Universal Binary (Intel + Apple Silicon)
```bash
npm run build:mac -- --target universal-apple-darwin
```

---

## File Size Comparison

Approximate installer sizes:

| Platform | Format | Size |
|----------|--------|------|
| Windows | MSI | ~8-12 MB |
| Windows | NSIS | ~6-10 MB |
| macOS | DMG | ~10-15 MB |
| macOS | APP | ~8-12 MB |
| Linux | DEB | ~8-12 MB |
| Linux | AppImage | ~12-18 MB |
| Linux | RPM | ~8-12 MB |

*Sizes vary based on dependencies and optimizations*

---

## Development vs Production

### Development Mode
- Hot reload enabled
- Debug symbols included
- Larger binary size
- Console logging active
- Faster compilation

### Production Mode
- Optimized for size
- Debug symbols stripped
- Smaller binary size
- Minimal logging
- Slower compilation (more optimization)

---

## Platform-Specific Features

### Windows
- System tray integration
- Windows notifications
- File associations
- Start menu integration
- Uninstaller included

### macOS
- Dock integration
- macOS notifications
- Spotlight integration
- Gatekeeper compatible
- Retina display support

### Linux
- Desktop entry file
- System tray (if supported)
- FreeDesktop notifications
- MIME type associations
- Package manager integration

---

## Testing Checklist

Before releasing on each platform:

- [ ] Application launches successfully
- [ ] All core features work
- [ ] File operations function correctly
- [ ] UI renders properly
- [ ] No console errors
- [ ] Installer works correctly
- [ ] Uninstaller works (if applicable)
- [ ] Application updates work (if implemented)
- [ ] Performance is acceptable
- [ ] Memory usage is reasonable

---

## Distribution Recommendations

### Windows
- **Primary:** MSI (better for enterprise)
- **Alternative:** NSIS (smaller download)
- **Hosting:** Direct download from website
- **Optional:** Microsoft Store submission

### macOS
- **Primary:** DMG (standard format)
- **Alternative:** APP bundle (for advanced users)
- **Hosting:** Direct download from website
- **Optional:** Mac App Store submission (requires Apple Developer account)

### Linux
- **Ubuntu/Debian:** DEB package
- **Fedora/RHEL:** RPM package
- **Universal:** AppImage (works on all distributions)
- **Hosting:** Direct download + package repositories (optional)

---

## Continuous Integration (CI/CD)

For automated builds, consider:

### GitHub Actions Example
```yaml
# Build on multiple platforms
jobs:
  build-windows:
    runs-on: windows-latest
  build-macos:
    runs-on: macos-latest
  build-linux:
    runs-on: ubuntu-latest
```

Each job builds for its respective platform and uploads artifacts.

---

## Security Considerations

### Code Signing

**Windows:**
- Optional but recommended
- Requires code signing certificate
- Prevents SmartScreen warnings

**macOS:**
- Optional for direct distribution
- Required for App Store
- Notarization recommended for Gatekeeper

**Linux:**
- Not required
- Package repositories may have their own signing

---

## Update Strategy

### Manual Updates
- Users download new version
- Install over existing version
- Settings preserved (if stored in user directory)

### Automatic Updates (Optional)
- Implement using Tauri updater
- Requires update server
- Can check for updates on launch
- Download and install in background

---

## Performance Characteristics

### Startup Time
- **Windows:** ~1-2 seconds
- **macOS:** ~1-2 seconds
- **Linux:** ~1-3 seconds (varies by distribution)

### Memory Usage
- **Idle:** ~50-100 MB
- **Active:** ~100-200 MB
- **With large files:** ~200-500 MB

### Binary Size
- **Uncompressed:** ~15-25 MB
- **Compressed (installer):** ~6-18 MB

---

## Best Practices

1. **Test on all target platforms** before release
2. **Use version control** (Git) for code management
3. **Document platform-specific issues** as you find them
4. **Keep dependencies updated** regularly
5. **Provide clear installation instructions** for each platform
6. **Include checksums** with downloads for security
7. **Maintain changelog** for version tracking
8. **Consider CI/CD** for automated builds

---

## Common Questions

### Q: Can I build for all platforms from one machine?
**A:** No, you must build natively on each target platform.

### Q: Can I copy the built app to another machine?
**A:** Yes, the installers are portable and can be distributed.

### Q: Do I need separate codebases for each platform?
**A:** No, the same codebase works on all platforms.

### Q: How do I handle platform-specific code?
**A:** Use Rust's `cfg!` macros or JavaScript platform detection.

### Q: Can I build for ARM Linux?
**A:** Yes, but requires ARM Linux machine or cross-compilation setup.

### Q: How often should I update dependencies?
**A:** Check monthly, update quarterly, or when security issues arise.

---

## Resources

- **Full Build Guide:** `BUILD_INSTRUCTIONS_CROSS_PLATFORM.md`
- **Setup Guide:** `PLATFORM_SETUP.md`
- **Quick Reference:** `QUICK_REFERENCE.md`
- **Tauri Docs:** https://tauri.app/
- **Rust Docs:** https://doc.rust-lang.org/

---

## Support Matrix

| OS Version | Support Status | Notes |
|------------|----------------|-------|
| Windows 10 | ✅ Fully Supported | Requires WebView2 |
| Windows 11 | ✅ Fully Supported | WebView2 pre-installed |
| macOS 10.13+ | ✅ Fully Supported | High Sierra and later |
| macOS M1/M2 | ✅ Fully Supported | Native ARM64 support |
| Ubuntu 20.04+ | ✅ Fully Supported | LTS releases |
| Debian 11+ | ✅ Fully Supported | Stable releases |
| Fedora 36+ | ✅ Fully Supported | Recent releases |
| RHEL 8+ | ✅ Fully Supported | Enterprise Linux |

---

## Conclusion

Photo-Reader is designed for true cross-platform compatibility. While you must build on each target platform, the process is streamlined with:
- ✅ Automated platform detection
- ✅ Quick-start scripts
- ✅ Comprehensive documentation
- ✅ Consistent build process

Follow the guides in this directory to build for your target platforms successfully!
