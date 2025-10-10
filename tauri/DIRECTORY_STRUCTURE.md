# Photo-Reader Directory Structure

This document provides a detailed overview of the project's file organization and structure.

## 📁 Root Directory

```
photo-reader/
├── src/                          # Frontend application files
├── src-tauri/                    # Tauri backend files
├── node_modules/                 # Node.js dependencies (generated)
├── package.json                  # Node.js configuration
├── package-lock.json            # Dependency lock file (generated)
├── .gitignore                   # Git ignore rules
├── README.md                    # Project overview
├── BUILD_INSTRUCTIONS.md        # Build guide
├── SETUP.md                     # Setup instructions
├── PROJECT_SUMMARY.md           # Project summary
├── START_HERE.md                # Quick start guide
├── CHECKLIST.md                 # Development checklist
├── DIRECTORY_STRUCTURE.md       # This file
├── BUILD_STATUS.md              # Build status tracking
├── quick-build.bat              # Quick build script (Windows)
└── quick-dev.bat                # Quick dev script (Windows)
```

## 🎨 Frontend Directory (`src/`)

Contains all frontend application files including HTML, CSS, JavaScript, and assets.

```
src/
├── index.html                   # Main application interface
├── script.js                    # Application logic and functionality
├── style.css                    # Application styles and layout
├── help.html                    # Help documentation page
├── DEMO.html                    # Demo/tutorial page
├── README.html                  # Project information page
├── Bible.TXT                    # Sample text file (demo)
├── English_Dictionary.PDF       # Sample PDF file (demo)
├── Old_Man_&_the_Sea.DOCX      # Sample DOCX file (demo)
└── help_files/                  # Help page assets
    ├── colorschememapping.xml   # Color scheme data
    ├── filelist.xml             # File list data
    └── themedata.thmx           # Theme data
```

### Frontend File Descriptions

#### `index.html`
- Main application interface
- Contains the UI structure
- Includes file browser, controls, and display area
- Links to external libraries (PDF.js, Mammoth.js)
- Responsive layout with flexbox

#### `script.js`
- Core application logic
- File loading and parsing
- PDF rendering with PDF.js
- Text/DOCX processing with Mammoth.js
- Slideshow control
- Navigation handling
- Settings management
- Event listeners

#### `style.css`
- Application styling
- Layout definitions
- Responsive design rules
- Button and control styles
- Visual aid styles (crosshair, percentage)
- Fullscreen mode styles

#### `help.html`
- User help documentation
- Feature explanations
- Usage instructions
- Keyboard shortcuts reference

#### `DEMO.html`
- Interactive demo/tutorial
- Feature showcase
- Getting started guide

#### `README.html`
- Project information
- Feature overview
- Credits and licensing

#### Sample Files
- **Bible.TXT**: Large text file for testing text display
- **English_Dictionary.PDF**: Multi-page PDF for testing PDF viewer
- **Old_Man_&_the_Sea.DOCX**: DOCX file for testing Word document support

## 🦀 Backend Directory (`src-tauri/`)

Contains all Tauri backend files including Rust code, configuration, and assets.

```
src-tauri/
├── src/                         # Rust source code
│   ├── main.rs                 # Application entry point
│   └── lib.rs                  # Library code
├── icons/                       # Application icons
│   ├── 32x32.png               # 32x32 icon
│   ├── 128x128.png             # 128x128 icon
│   ├── 128x128@2x.png          # 128x128 retina icon
│   ├── icon.icns               # macOS icon
│   ├── icon.ico                # Windows icon
│   └── icon.png                # Base icon
├── capabilities/                # Tauri capabilities
│   └── default.json            # Default permissions
├── gen/                         # Generated files (build-time)
├── target/                      # Build output (generated)
│   ├── debug/                  # Debug builds
│   └── release/                # Release builds
│       └── bundle/             # Installers
│           ├── msi/            # Windows MSI installers
│           ├── nsis/           # Windows NSIS installers
│           ├── deb/            # Linux DEB packages
│           ├── rpm/            # Linux RPM packages
│           ├── dmg/            # macOS DMG images
│           ├── macos/          # macOS app bundles
│           └── appimage/       # Linux AppImages
├── Cargo.toml                   # Rust dependencies
├── Cargo.lock                   # Dependency lock file (generated)
├── tauri.conf.json             # Tauri configuration
├── build.rs                     # Build script
└── .gitignore                   # Tauri-specific ignores
```

### Backend File Descriptions

#### `src/main.rs`
```rust
// Application entry point
// Initializes Tauri
// Sets up plugins
// Runs the application
```

#### `src/lib.rs`
```rust
// Library code
// Shared functions
// Command handlers (if any)
```

#### `Cargo.toml`
- Rust package configuration
- Dependencies:
  - tauri 2.0
  - tauri-plugin-shell
  - serde
  - serde_json
- Build dependencies:
  - tauri-build
- Release optimizations

#### `tauri.conf.json`
- Tauri configuration
- Application metadata
- Window settings
- Build configuration
- Bundle settings
- Security settings

#### `build.rs`
- Build script
- Runs before compilation
- Generates code
- Processes resources

#### Icons Directory
All required icon formats for cross-platform support:
- **32x32.png**: Small icon (Windows taskbar)
- **128x128.png**: Medium icon (macOS dock)
- **128x128@2x.png**: Retina display icon
- **icon.icns**: macOS icon bundle
- **icon.ico**: Windows icon bundle
- **icon.png**: Base icon (512x512 or larger)

#### Capabilities Directory
- **default.json**: Default security permissions
  - Core permissions
  - Shell permissions
  - Asset protocol access

## 📚 Documentation Files

### Root Level Documentation

#### `README.md`
- Project overview
- Features list
- Prerequisites
- Installation instructions
- Usage guide
- Build instructions
- Troubleshooting

#### `BUILD_INSTRUCTIONS.md`
- Detailed build guide
- Platform-specific instructions
- Cross-compilation guide
- Build optimization
- Troubleshooting builds

#### `SETUP.md`
- Development environment setup
- Dependency installation
- Configuration guide
- IDE setup
- Development workflow

#### `PROJECT_SUMMARY.md`
- Complete project overview
- Technical architecture
- Dependencies
- Features
- Performance characteristics
- Future enhancements

#### `START_HERE.md`
- Quick start guide
- First-time setup
- Feature overview
- Common use cases
- Pro tips

#### `CHECKLIST.md`
- Development progress tracking
- Feature completion status
- Testing checklist
- Pre-release checklist

#### `DIRECTORY_STRUCTURE.md`
- This file
- Project organization
- File descriptions
- Directory purposes

#### `BUILD_STATUS.md`
- Build status tracking
- Platform build results
- Known issues
- Build history

## 🔧 Configuration Files

### `package.json`
```json
{
  "name": "photo-reader",
  "version": "1.0.0",
  "scripts": {
    "tauri": "tauri",
    "dev": "tauri dev",
    "build": "tauri build",
    "build:windows": "...",
    "build:linux": "...",
    "build:macos": "..."
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0"
  }
}
```

### `.gitignore`
```
# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Tauri
src-tauri/target/
src-tauri/gen/

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

## 🚀 Build Scripts

### `quick-dev.bat` (Windows)
```batch
@echo off
echo Starting Photo-Reader Development Server...
call npm install
call npm run dev
```

### `quick-build.bat` (Windows)
```batch
@echo off
echo Building Photo-Reader...
call npm install
call npm run build
echo Build complete!
pause
```

## 📦 Generated Directories

These directories are created during development/build and should not be committed to version control:

### `node_modules/`
- Node.js dependencies
- Installed by `npm install`
- Ignored by git

### `src-tauri/target/`
- Rust build output
- Debug and release builds
- Installers and bundles
- Ignored by git

### `src-tauri/gen/`
- Generated Tauri code
- Platform-specific files
- Ignored by git

## 🎯 Key File Relationships

### Frontend → Backend
```
index.html
    ↓ (loads)
script.js
    ↓ (uses)
Tauri APIs
    ↓ (calls)
main.rs
```

### Configuration Flow
```
package.json
    ↓ (defines)
npm scripts
    ↓ (runs)
Tauri CLI
    ↓ (reads)
tauri.conf.json
    ↓ (configures)
Cargo.toml
    ↓ (builds)
main.rs
```

### Build Process
```
Source Files (src/, src-tauri/src/)
    ↓ (compiled by)
Build Tools (Cargo, Tauri CLI)
    ↓ (produces)
Executables (target/release/)
    ↓ (packaged into)
Installers (target/release/bundle/)
```

## 📊 File Size Overview

Approximate file sizes:

```
Frontend:
- index.html: ~15 KB
- script.js: ~25 KB
- style.css: ~10 KB
- Sample files: ~5-10 MB total

Backend:
- main.rs: ~1 KB
- lib.rs: ~1 KB
- Cargo.toml: ~1 KB
- tauri.conf.json: ~2 KB

Icons:
- Total: ~500 KB

Documentation:
- Total: ~100 KB

Build Output:
- Executable: ~5-10 MB
- Installer: ~10-20 MB
```

## 🔍 Finding Files

### By Purpose

**Application Logic:**
- `src/script.js`
- `src-tauri/src/main.rs`

**User Interface:**
- `src/index.html`
- `src/style.css`

**Configuration:**
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

**Documentation:**
- All `.md` files in root
- `src/help.html`

**Assets:**
- `src-tauri/icons/`
- `src/*.TXT`, `src/*.PDF`, `src/*.DOCX`

**Build Output:**
- `src-tauri/target/release/bundle/`

## 📝 Notes

### File Naming Conventions
- **Lowercase with hyphens**: Configuration files (`tauri.conf.json`)
- **PascalCase**: Documentation files (`README.md`)
- **lowercase**: Source files (`main.rs`, `script.js`)
- **UPPERCASE**: Sample files (`Bible.TXT`)

### Directory Naming Conventions
- **lowercase with hyphens**: Main directories (`src-tauri`)
- **lowercase**: Subdirectories (`src`, `icons`)
- **snake_case**: Generated directories (`help_files`)

### File Organization Principles
1. **Separation of Concerns**: Frontend and backend separated
2. **Logical Grouping**: Related files in same directory
3. **Clear Naming**: Descriptive file names
4. **Documentation**: Comprehensive docs at root level
5. **Assets**: Organized by type and purpose

---

**Last Updated**: January 2025
**Total Files**: ~30 source files + generated files
**Total Directories**: ~10 main directories
