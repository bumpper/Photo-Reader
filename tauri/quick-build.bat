@echo off
echo ========================================
echo Photo-Reader - Quick Build Script
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [2/3] Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo [3/3] Build complete!
echo.
echo ========================================
echo Build artifacts location:
echo src-tauri\target\release\bundle\
echo ========================================
echo.
echo Installers created:
echo - Windows MSI: src-tauri\target\release\bundle\msi\
echo - Windows NSIS: src-tauri\target\release\bundle\nsis\
echo.

pause
