# Icons Directory

This directory should contain the application icons in the following formats:

## Required Icon Files

- `32x32.png` - 32x32 pixel PNG icon
- `128x128.png` - 128x128 pixel PNG icon
- `128x128@2x.png` - 256x256 pixel PNG icon (2x resolution)
- `icon.icns` - macOS icon file
- `icon.ico` - Windows icon file

## Creating Icons

You can create these icons from a single source image using various tools:

### Online Tools
- [Icon Generator](https://icon.kitchen/)
- [App Icon Generator](https://appicon.co/)

### Command Line Tools
- **ImageMagick** (cross-platform)
  ```bash
  # Install ImageMagick first
  # Then convert your source image:
  convert source.png -resize 32x32 32x32.png
  convert source.png -resize 128x128 128x128.png
  convert source.png -resize 256x256 128x128@2x.png
  ```

- **For .icns (macOS)**
  ```bash
  # Use iconutil (macOS only)
  mkdir icon.iconset
  sips -z 16 16 source.png --out icon.iconset/icon_16x16.png
  sips -z 32 32 source.png --out icon.iconset/icon_16x16@2x.png
  # ... (create all required sizes)
  iconutil -c icns icon.iconset
  ```

- **For .ico (Windows)**
  ```bash
  # Use ImageMagick
  convert source.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
  ```

## Temporary Solution

Until you create custom icons, you can:
1. Use placeholder icons from the Tauri default template
2. Copy icons from another Tauri project
3. Generate simple icons using online tools

## Note

The build process will fail if these icon files are missing. Make sure to add them before building the application.
