@echo off
chcp 65001 >nul
echo.
echo  ===================================
echo   RailSupport Frontend - Windows
echo  ===================================
echo.

cd /d "%~dp0"

echo [1/2] npm paketlar o'rnatilmoqda...
npm install

echo.
echo [2/2] Frontend ishga tushmoqda...
echo.
echo  Frontend: http://localhost:5173
echo.
npm run dev
pause
