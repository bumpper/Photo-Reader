# Photo-Reader Setup Guide

This guide will help you set up the Photo-Reader development environment and get started with the application.

## Quick Setup (Windows)

For a quick setup on Windows, simply run:
```bash
quick-dev.bat
```

This will automatically install dependencies and start the development server.

## Manual Setup

### Step 1: Install Prerequisites

#### 1.1 Install Rust

**Windows:**
1. Download rustup-init.exe from https://rustup.rs/
2. Run the installer
3. Follow the prompts (default options are recommended)
4. Restart your terminal

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Verify Installation:**
```bash
rustc --version
cargo --version
```

#### 1.2 Install Node.js

**Windows:**
1. Download the installer from https://nodejs.org/
2. Run the installer (LTS version recommended)
3. Follow the installation wizard

**macOS:**
```bash
# Using Homebrew
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify Installation:**
```bash
node --version
npm --version
```

#### 1.3 Install Platform-Specific Dependencies

**Windows:**
- Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Select "Desktop development with C++" workload
- WebView2 is pre-installed on Windows 10/11

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
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

**Linux (Fedora/RHEL):**
```bash
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

### Step 2: Clone/Download Project

If you haven't already, navigate to the project directory:
```bash
cd photo-reader
```

### Step 3: Install Dependencies

Install Node.js dependencies:
```bash
npm install
```

This will install:
- @tauri-apps/cli (Tauri command-line interface)
- Other development dependencies

### Step 4: Verify Setup

Check that Tauri CLI is installed:
```bash
npm run tauri --version
```

You should see output like:
```
tauri-cli 2.0.0
```

### Step 5: Run Development Server

Start the development server:
```bash
npm run dev
```

This will:
1. Compile the Rust backend
2. Start the Tauri development window
3. Enable hot-reload for frontend changes

## Project Structure

```
photo-reader/
├── src/                          # Frontend source files
│   ├── index.html               # Main application HTML
│   ├── script.js                # Application JavaScript
│   ├── style.css                # Application styles
│   ├── help.html                # Help documentation
│   ├── DEMO.html                # Demo page
│   ├── README.html              # README page
│   ├── Bible.TXT                # Sample text file
│   ├── English_Dictionary.PDF   # Sample PDF file
│   ├── Old_Man_&_the_Sea.DOCX  # Sample DOCX file
│   └── help_files/              # Help file assets
├── src-tauri/                   # Tauri backend
│   ├── src/
│   │   ├── main.rs             # Rust main entry point
│   │   └── lib.rs              # Rust library code
│   ├── icons/                   # Application icons
│   ├── capabilities/            # Tauri capabilities
│   ├── Cargo.toml              # Rust dependencies
│   ├── tauri.conf.json         # Tauri configuration
│   └── build.rs                # Build script
├── package.json                 # Node.js dependencies
├── README.md                    # Project documentation
├── BUILD_INSTRUCTIONS.md        # Build instructions
├── SETUP.md                     # This file
└── .gitignore                   # Git ignore rules
```

## Configuration

### Tauri Configuration

The main configuration file is `src-tauri/tauri.conf.json`. Key settings:

```json
{
  "productName": "Photo-Reader",
  "version": "1.0.0",
  "identifier": "center.radius.photoreader",
  "app": {
    "windows": [{
      "title": "Photo-Reader",
      "width": 1400,
      "height": 900,
      "resizable": true
    }]
  }
}
```

### Rust Dependencies

Rust dependencies are managed in `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri = { version = "2.0", features = ["protocol-asset"] }
tauri-plugin-shell = "2.0"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

### Node.js Dependencies

Node.js dependencies are in `package.json`:

```json
{
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0"
  }
}
```

## Development Workflow

### 1. Making Changes

**Frontend Changes (HTML/CSS/JS):**
- Edit files in `src/` directory
- Changes are hot-reloaded automatically
- Refresh the app window to see updates

**Backend Changes (Rust):**
- Edit files in `src-tauri/src/`
- Stop the dev server (Ctrl+C)
- Restart with `npm run dev`

### 2. Testing

**Manual Testing:**
1. Run `npm run dev`
2. Test all features:
   - File loading (PDF, TXT, DOCX)
   - Page navigation
   - Slideshow mode
   - Fullscreen mode
   - Visual aids (crosshair, percentage, page numbers)
   - Settings persistence

**Console Debugging:**
- Open DevTools: Right-click → Inspect Element
- Check Console tab for errors
- Use `console.log()` for debugging

### 3. Building

**Development Build:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
```

See BUILD_INSTRUCTIONS.md for detailed build information.

## Common Tasks

### Update Dependencies

**Update Rust dependencies:**
```bash
cd src-tauri
cargo update
cd ..
```

**Update Node.js dependencies:**
```bash
npm update
```

### Clean Build

If you encounter issues:
```bash
# Clean Rust build
cd src-tauri
cargo clean
cd ..

# Clean Node modules
rm -rf node_modules
npm install
```

### Add New Dependencies

**Add Rust dependency:**
```bash
cd src-tauri
cargo add <package-name>
cd ..
```

**Add Node.js dependency:**
```bash
npm install --save-dev <package-name>
```

## Troubleshooting

### Issue: "rustc not found"

**Solution:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Issue: "tauri command not found"

**Solution:**
```bash
npm install
```

### Issue: "WebKit2GTK not found" (Linux)

**Solution:**
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Issue: Build fails on Windows

**Solution:**
1. Install Visual Studio Build Tools
2. Restart terminal
3. Try again

### Issue: Port already in use

**Solution:**
```bash
# Kill the process using the port
# Windows:
netstat -ano | findstr :PORT_NUMBER
taskkill /PID <PID> /F

# Linux/macOS:
lsof -ti:PORT_NUMBER | xargs kill -9
```

### Issue: Hot reload not working

**Solution:**
1. Stop the dev server
2. Clear browser cache
3. Restart: `npm run dev`

## IDE Setup

### Visual Studio Code (Recommended)

**Recommended Extensions:**
- rust-analyzer (Rust language support)
- Tauri (Tauri development tools)
- ESLint (JavaScript linting)
- Prettier (Code formatting)

**Settings:**
Create `.vscode/settings.json`:
```json
{
  "rust-analyzer.checkOnSave.command": "clippy",
  "editor.formatOnSave": true
}
```

### Other IDEs

- **IntelliJ IDEA**: Install Rust plugin
- **Sublime Text**: Install Rust Enhanced package
- **Vim/Neovim**: Install rust.vim plugin

## Environment Variables

You can set environment variables for development:

**Windows:**
```bash
set RUST_LOG=debug
npm run dev
```

**Linux/macOS:**
```bash
RUST_LOG=debug npm run dev
```

## Next Steps

After setup:
1. ✅ Run `npm run dev` to start development
2. ✅ Explore the application features
3. ✅ Read BUILD_INSTRUCTIONS.md for building
4. ✅ Check PROJECT_SUMMARY.md for project overview
5. ✅ Review CHECKLIST.md for development tasks

## Getting Help

If you encounter issues:
1. Check this SETUP.md file
2. Review BUILD_INSTRUCTIONS.md
3. Check Tauri documentation: https://tauri.app/
4. Search GitHub issues
5. Check Rust documentation: https://doc.rust-lang.org/

## Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Mammoth.js Documentation](https://github.com/mwilliamson/mammoth.js)
