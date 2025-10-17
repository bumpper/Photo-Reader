@echo off
REM Photo-Reader Image Index Generator
REM Windows Batch Script to generate _index.txt for current directory
REM Usage: Double-click this file or run from command prompt

setlocal enabledelayedexpansion

echo.
echo 🎨 Photo-Reader Image Index Generator
echo =====================================
echo.

REM Set variables - using current directory since script is now in /img/
set "IMG_DIR=%~dp0"
set "INDEX_FILE=%IMG_DIR%_index.txt"
set "TEMP_FILE=%TEMP%\img_index_temp.txt"

REM Remove trailing backslash from IMG_DIR for display
set "DISPLAY_DIR=%IMG_DIR:~0,-1%"

echo 🔍 Scanning image directory: %DISPLAY_DIR%
echo.

REM Initialize counters
set /a FILE_COUNT=0
set /a JPG_COUNT=0
set /a PNG_COUNT=0
set /a GIF_COUNT=0
set /a WEBP_COUNT=0
set /a SVG_COUNT=0
set /a OTHER_COUNT=0

REM Get current date and time
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "TIMESTAMP=%MM%/%DD%/%YYYY% %HH%:%Min%:%Sec%"

REM Create temporary file with file list
if exist "%TEMP_FILE%" del "%TEMP_FILE%"

REM Scan for image files and count them (exclude script files and _index.txt)
for %%f in ("%IMG_DIR%*.jpg" "%IMG_DIR%*.jpeg" "%IMG_DIR%*.png" "%IMG_DIR%*.gif" "%IMG_DIR%*.webp" "%IMG_DIR%*.svg" "%IMG_DIR%*.bmp" "%IMG_DIR%*.tiff" "%IMG_DIR%*.ico") do (
    if exist "%%f" (
        set "filename=%%~nxf"
        set "ext=%%~xf"
        
        REM Skip script files and _index.txt
        if not "!filename:~0,10!"=="_generate-" (
            if not "!filename!"=="_index.txt" (
                set /a FILE_COUNT+=1
                
                REM Count by extension (case insensitive)
                if /i "!ext!"==".jpg" set /a JPG_COUNT+=1
                if /i "!ext!"==".jpeg" set /a JPG_COUNT+=1
                if /i "!ext!"==".png" set /a PNG_COUNT+=1
                if /i "!ext!"==".gif" set /a GIF_COUNT+=1
                if /i "!ext!"==".webp" set /a WEBP_COUNT+=1
                if /i "!ext!"==".svg" set /a SVG_COUNT+=1
                if /i "!ext!"==".bmp" set /a OTHER_COUNT+=1
                if /i "!ext!"==".tiff" set /a OTHER_COUNT+=1
                if /i "!ext!"==".ico" set /a OTHER_COUNT+=1
                
                echo !filename! >> "%TEMP_FILE%"
            )
        )
    )
)

REM Sort the file list (if sort command is available)
if exist "%TEMP_FILE%" (
    sort "%TEMP_FILE%" > "%TEMP_FILE%.sorted"
    move "%TEMP_FILE%.sorted" "%TEMP_FILE%" >nul 2>&1
)

REM Generate index file
echo Image Directory Contents > "%INDEX_FILE%"
echo ======================== >> "%INDEX_FILE%"
echo. >> "%INDEX_FILE%"
echo This directory contains vision board images for the Photo-Reader application. >> "%INDEX_FILE%"
echo. >> "%INDEX_FILE%"
echo Generated: %TIMESTAMP% >> "%INDEX_FILE%"
echo. >> "%INDEX_FILE%"
echo Directory Summary: >> "%INDEX_FILE%"
echo ----------------- >> "%INDEX_FILE%"
echo 📁 Location: ./img/ >> "%INDEX_FILE%"
echo 📊 Total files: %FILE_COUNT% >> "%INDEX_FILE%"
echo 🔄 Last updated: %TIMESTAMP% >> "%INDEX_FILE%"
echo. >> "%INDEX_FILE%"
echo File Types Summary: >> "%INDEX_FILE%"
echo ------------------ >> "%INDEX_FILE%"

if %JPG_COUNT% gtr 0 echo JPG/JPEG files: %JPG_COUNT% >> "%INDEX_FILE%"
if %PNG_COUNT% gtr 0 echo PNG files: %PNG_COUNT% >> "%INDEX_FILE%"
if %GIF_COUNT% gtr 0 echo GIF files: %GIF_COUNT% >> "%INDEX_FILE%"
if %WEBP_COUNT% gtr 0 echo WEBP files: %WEBP_COUNT% >> "%INDEX_FILE%"
if %SVG_COUNT% gtr 0 echo SVG files: %SVG_COUNT% >> "%INDEX_FILE%"
if %OTHER_COUNT% gtr 0 echo Other formats: %OTHER_COUNT% >> "%INDEX_FILE%"

echo. >> "%INDEX_FILE%"
echo Image Files: >> "%INDEX_FILE%"
echo ----------- >> "%INDEX_FILE%"

REM Add numbered file list
if exist "%TEMP_FILE%" (
    set /a COUNTER=1
    for /f "delims=" %%a in (%TEMP_FILE%) do (
        set "num=0!COUNTER!"
        set "padded=!num:~-2!"
        echo !padded!. %%a >> "%INDEX_FILE%"
        set /a COUNTER+=1
    )
)

REM Add usage instructions
echo. >> "%INDEX_FILE%"
echo Usage Instructions: >> "%INDEX_FILE%"
echo ------------------ >> "%INDEX_FILE%"
echo 1. Select "Vision Board" from the Photo-Reader's Preloaded dropdown menu >> "%INDEX_FILE%"
echo 2. The application will automatically discover and load all images from this directory >> "%INDEX_FILE%"
echo 3. Use Previous/Next buttons to browse through images >> "%INDEX_FILE%"
echo 4. Click "Play" to start a fullscreen slideshow presentation >> "%INDEX_FILE%"
echo 5. Use keyboard controls (Space, Arrow keys) for navigation during slideshow >> "%INDEX_FILE%"
echo. >> "%INDEX_FILE%"
echo Adding New Images: >> "%INDEX_FILE%"
echo ----------------- >> "%INDEX_FILE%"
echo • Simply copy image files to this directory >> "%INDEX_FILE%"
echo • Run this script again to update the index >> "%INDEX_FILE%"
echo • Supported formats: JPG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO >> "%INDEX_FILE%"
echo • For best results, use descriptive filenames >> "%INDEX_FILE%"
echo. >> "%INDEX_FILE%"
echo Maintenance Scripts: >> "%INDEX_FILE%"
echo ------------------- >> "%INDEX_FILE%"
echo This directory contains several maintenance scripts (prefixed with _): >> "%INDEX_FILE%"
echo • _generate-index.js - Cross-platform Node.js script (recommended) >> "%INDEX_FILE%"
echo • _generate-index.bat - Windows batch script >> "%INDEX_FILE%"
echo • _generate-index.sh - Unix/Linux/macOS shell script >> "%INDEX_FILE%"
echo. >> "%INDEX_FILE%"
echo Script Information: >> "%INDEX_FILE%"
echo ------------------ >> "%INDEX_FILE%"
echo Generator: _generate-index.bat >> "%INDEX_FILE%"
echo Version: 1.0.0 >> "%INDEX_FILE%"
echo Platform: Windows Batch >> "%INDEX_FILE%"
echo Repository: Photo-Reader by bumpper >> "%INDEX_FILE%"

REM Clean up temporary file
if exist "%TEMP_FILE%" del "%TEMP_FILE%"

REM Display results
echo ✅ Index file generated successfully!
echo 📁 Location: %INDEX_FILE%
echo 📊 Found %FILE_COUNT% image files
echo.

if %FILE_COUNT% equ 0 (
    echo ⚠️  Warning: No image files found in the directory
) else (
    echo 📋 File type breakdown:
    if %JPG_COUNT% gtr 0 echo    📸 JPG/JPEG: %JPG_COUNT%
    if %PNG_COUNT% gtr 0 echo    🖼️  PNG: %PNG_COUNT%
    if %GIF_COUNT% gtr 0 echo    🎞️  GIF: %GIF_COUNT%
    if %WEBP_COUNT% gtr 0 echo    🌐 WebP: %WEBP_COUNT%
    if %SVG_COUNT% gtr 0 echo    📐 SVG: %SVG_COUNT%
    if %OTHER_COUNT% gtr 0 echo    📄 Other: %OTHER_COUNT%
)

echo.
echo Press any key to exit...
pause >nul