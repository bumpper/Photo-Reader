# 🚀 START HERE - Photo-Reader Quick Start Guide

Welcome to Photo-Reader! This guide will get you up and running in minutes.

## ⚡ Quick Start (Windows)

The fastest way to get started:

1. **Open Terminal** in the project directory
2. **Run the quick start script:**
   ```bash
   quick-dev.bat
   ```
3. **Done!** The application will open automatically.

## 📋 What You Need

Before starting, make sure you have:

- ✅ **Rust** - [Install from rustup.rs](https://rustup.rs/)
- ✅ **Node.js** - [Install from nodejs.org](https://nodejs.org/)
- ✅ **Visual Studio Build Tools** (Windows only)

## 🎯 First Time Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs the Tauri CLI and other required packages.

### Step 2: Start Development Server

```bash
npm run dev
```

The application window will open automatically!

## 🎨 What You'll See

When the app opens, you'll see:

1. **File Browser** - Load PDF, TXT, or DOCX files
2. **Sample Files** - Try the included demo files:
   - Bible.TXT (text file)
   - English_Dictionary.PDF (PDF file)
   - Old_Man_&_the_Sea.DOCX (Word document)
3. **Controls** - Adjust pages, text size, and slideshow speed
4. **Visual Aids** - Toggle crosshair, percentage, and page numbers

## 🎮 Try These Features

### 1. Load a Sample File
- Click "Browse Files"
- Select one of the sample files
- Watch it load!

### 2. Navigate Pages
- Press **Space** or **Enter** for next page
- Press **Backspace** for previous page
- Use **Arrow Keys** to navigate

### 3. Start Slideshow
- Click "Start Slideshow"
- Pages advance automatically
- Adjust speed with the slider

### 4. Go Fullscreen
- Press **F** key
- Perfect for presentations!
- Press **F** again to exit

### 5. Try Visual Aids
- Toggle **Crosshair** for focus
- Show **Percentage** to track progress
- Display **Page Numbers**

## 📚 Key Features to Explore

### Multi-Page Display
- View 1-6 pages at once
- Great for comparing pages
- Adjust in the "Pages to Display" dropdown

### Text Modes (for TXT/DOCX)
- **Word-by-Word**: Speed reading mode
- **Full Text**: Normal reading mode

### Slideshow Control
- Adjustable speed (0.5-10 seconds)
- Start/stop anytime
- Manual override with keyboard

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** / **Enter** | Next page |
| **Backspace** | Previous page |
| **F** | Toggle fullscreen |
| **S** | Start/stop slideshow |
| **Arrow Keys** | Navigate pages |

## 🛠️ Development Tips

### Making Changes

**Frontend (HTML/CSS/JS):**
- Edit files in `src/` folder
- Changes reload automatically
- No restart needed!

**Backend (Rust):**
- Edit files in `src-tauri/src/`
- Stop server (Ctrl+C)
- Restart with `npm run dev`

### Viewing Console
- Right-click in app → "Inspect Element"
- Check Console tab for logs
- Useful for debugging

## 📖 Next Steps

Now that you're running, explore these guides:

1. **SETUP.md** - Detailed setup instructions
2. **BUILD_INSTRUCTIONS.md** - How to build installers
3. **PROJECT_SUMMARY.md** - Complete project overview
4. **CHECKLIST.md** - Development tasks

## 🏗️ Building the App

When you're ready to create an installer:

### Quick Build (Windows)
```bash
quick-build.bat
```

### Manual Build
```bash
npm run build
```

Installers will be in: `src-tauri/target/release/bundle/`

## 🐛 Troubleshooting

### App Won't Start?

**Check Rust:**
```bash
rustc --version
```
If not found, install from [rustup.rs](https://rustup.rs/)

**Check Node.js:**
```bash
node --version
```
If not found, install from [nodejs.org](https://nodejs.org/)

**Windows: Missing Build Tools?**
Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

### Build Errors?

**Clean and Rebuild:**
```bash
cd src-tauri
cargo clean
cd ..
npm install
npm run dev
```

### Still Having Issues?

1. Check SETUP.md for detailed instructions
2. Review BUILD_INSTRUCTIONS.md
3. Ensure all prerequisites are installed

## 💡 Pro Tips

1. **Use Sample Files** - Great for testing features
2. **Try Fullscreen** - Best presentation experience
3. **Adjust Text Size** - Find your comfortable reading size
4. **Experiment with Pages** - Try different multi-page layouts
5. **Use Keyboard Shortcuts** - Faster navigation

## 🎯 Common Use Cases

### Presentations
1. Load your PDF
2. Press **F** for fullscreen
3. Use **Space** to advance slides
4. Toggle **Crosshair** for focus

### Speed Reading
1. Load a text file
2. Enable "Word-by-Word" mode
3. Start slideshow
4. Adjust speed to your preference

### Document Review
1. Load PDF or DOCX
2. Set "Pages to Display" to 2-4
3. Compare pages side-by-side
4. Use arrow keys to navigate

### Study Sessions
1. Load study material
2. Show **Percentage** to track progress
3. Use **Page Numbers** for reference
4. Take breaks at intervals

## 📁 Project Structure (Quick Reference)

```
photo-reader/
├── src/              # Your app's frontend
│   ├── index.html   # Main interface
│   ├── script.js    # App logic
│   └── style.css    # Styling
├── src-tauri/       # Backend (Rust)
└── Documentation    # All guides
```

## 🚀 Ready to Go!

You're all set! Here's what to do now:

1. ✅ Run `npm run dev`
2. ✅ Try loading a sample file
3. ✅ Explore the features
4. ✅ Read the other documentation
5. ✅ Start building something awesome!

## 📞 Need Help?

- **SETUP.md** - Detailed setup guide
- **BUILD_INSTRUCTIONS.md** - Building installers
- **PROJECT_SUMMARY.md** - Complete project info
- **Tauri Docs** - [tauri.app](https://tauri.app/)

---

**Happy Coding! 🎉**

*Photo-Reader - Advanced PDF & Text Slideshow Viewer*
