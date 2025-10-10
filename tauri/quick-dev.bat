@echo off
echo ========================================
echo Photo-Reader - Quick Development Start
echo ========================================
echo.

echo [1/2] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [2/2] Starting development server...
echo.
echo ========================================
echo Development server starting...
echo The application window will open shortly.
echo Press Ctrl+C to stop the server.
echo ========================================
echo.

call npm run dev
