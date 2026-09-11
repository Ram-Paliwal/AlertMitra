@echo off
title AlertMitra — Road Safety Intelligence System
cd /d "%~dp0"

echo ===================================================
echo               ALERT MITRA
echo    "Know the risk before you reach it."
echo ===================================================
echo.

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [1/2] First time setup: Installing dependencies...
    call npm.cmd install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Please ensure Node.js is installed.
        pause
        exit /b %errorlevel%
    )
    echo [OK] Dependencies installed successfully!
    echo.
) else (
    echo [OK] Dependencies found.
)

:: Launch browser after 2 seconds
start "" http://localhost:3000/

:: Start the Vite development server
echo [2/2] Starting AlertMitra dev server on http://localhost:3000/ ...
echo.
call npm.cmd run dev

pause
