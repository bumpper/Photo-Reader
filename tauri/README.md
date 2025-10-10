# Photo-Reader - Advanced PDF & Text Slideshow Viewer

A powerful desktop application for viewing PDFs and text files in slideshow mode with multi-page display capabilities. Built with Tauri for cross-platform support.

## Features

- **PDF Support**: View PDF documents with multi-page display (1-6 pages simultaneously)
- **Text File Support**: Display .TXT and .DOCX files with word-by-word or full-text modes
- **Slideshow Mode**: Automatic page advancement with customizable timing (0.5-10 seconds)
- **Fullscreen Presentation**: Immersive fullscreen mode for presentations
- **Visual Aids**: 
  - Crosshair overlay for focus
  - Percentage progress indicator
  - Page number display
  - Customizable text size
- **Navigation**: Easy keyboard and button controls for page navigation
- **File Management**: Browse and load files from your system
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Cross-platform**: Works on Windows, macOS, and Linux

## Prerequisites

Before building the application, ensure you have the following installed:

1. **Rust** (latest stable version)
   - Download from: https://rustup.rs/
   - Verify installation: `rustc --version`

2. **Node.js** (v16 or later recommended)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

3. **Platform-specific dependencies:**

   ### Windows
   - Microsoft Visual Studio C++ Build Tools
   - WebView2 (usually pre-installed on Windows 10/11)

   ### macOS
   - Xcode Command Line Tools: `xcode-select --install`

   ### Linux (Debian/Ubuntu)
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

   ### Linux (Fedora/RHEL)
   ```bash
   sudo dnf install webkit2gtk4.1-devel \
     openssl-devel \
     curl \
     wget \
     file \
     libappindicator-gtk3-devel \
     librsvg2-devel
   ```

## Installation

1. Navigate to the project directory:
   ```bash
   cd photo-reader
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Development

To run the application in development mode:

```bash
npm run dev
```

This will start the Tauri development server and open the application window.

## Building Installers

### Build for Current Platform

To build the application for your current platform:

```bash
npm run build
```

The installers will be created in `src-tauri/target/release/bundle/`

### Platform-Specific Builds

**Windows (.exe, .msi):**
```bash
npm run build:windows
```
Output: `src-tauri/target/release/bundle/msi/` and `src-tauri/target/release/bundle/nsis/`

**macOS (.dmg, .app):**
```bash
npm run build:macos
```
Output: `src-tauri/target/release/bundle/dmg/` and `src-tauri/target/release/bundle/macos/`

**Linux (.deb, .rpm):**
```bash
npm run build:linux
```
Output: `src-tauri/target/release/bundle/deb/` and `src-tauri/target/release/bundle/rpm/`

## Usage

### Loading Files
1. Click "Browse Files" to select a PDF, TXT, or DOCX file
2. Or use the sample files included in the application

### Viewing Options
- **Pages to Display**: Choose 1-6 pages to display simultaneously
- **Text Size**: Adjust text size for comfortable reading
- **Slideshow Speed**: Set automatic page advancement timing (0.5-10 seconds)

### Display Modes
- **Text Mode**: For .TXT and .DOCX files
  - Word-by-word display for speed reading
  - Full text display for normal reading
- **PDF Mode**: Multi-page PDF viewing with zoom controls

### Visual Aids
- **Crosshair**: Toggle crosshair overlay for focus
- **Percentage**: Show reading progress percentage
- **Page Numbers**: Display current page numbers

### Controls
- **Space/Enter**: Next page
- **Backspace**: Previous page
- **F**: Toggle fullscreen
- **S**: Start/stop slideshow
- **Arrow Keys**: Navigate pages

## Installation Paths

The application will be installed to the following default directories:

- **Windows**: `C:\Program Files\Photo-Reader\` or `%LOCALAPPDATA%\Programs\Photo-Reader\`
- **macOS**: `/Applications/Photo-Reader.app`
- **Linux**: `/usr/bin/photo-reader` (binary) and `/usr/share/applications/` (desktop entry)

## Included Sample Files

The application includes sample files for testing:
- **Bible.TXT**: Sample text file
- **English_Dictionary.PDF**: Sample PDF document
- **Old_Man_&_the_Sea.DOCX**: Sample DOCX file

## Troubleshooting

### Icon Issues
If you encounter icon-related errors during build, ensure all icon files are present in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

### Build Errors
1. Make sure all dependencies are installed
2. Clear the build cache: `cargo clean` in the `src-tauri` directory
3. Update Rust: `rustup update`
4. Update dependencies: `cargo update` in the `src-tauri` directory

### PDF.js Issues
The application uses PDF.js 3.11.174 for PDF rendering. If PDFs don't display:
1. Check browser console for errors
2. Ensure PDF file is not corrupted
3. Try a different PDF file

## Technologies Used

- **Tauri 2.0**: Cross-platform desktop framework
- **PDF.js 3.11.174**: PDF rendering library
- **Mammoth.js 1.6.0**: DOCX file parsing
- **HTML5/CSS3/JavaScript**: Frontend technologies

## License

MIT License - Copyright © 2025 Radius.Center

## Support

For issues and questions, please visit the project repository.
