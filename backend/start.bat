@echo off
chcp 65001 >nul
echo.
echo  ===================================
echo   RailSupport Backend - Windows
echo  ===================================
echo.

cd /d "%~dp0"

echo [1/3] Kutubxonalar o'rnatilmoqda...
pip install -r requirements.txt --quiet

echo.
echo [2/3] Ma'lumotlar bazasi yaratilmoqda...
python -m app.seed

echo.
echo [3/3] Server ishga tushmoqda...
echo.
echo  Backend: http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo.
echo  Demo login: admin / 1234
echo.
python -m uvicorn app.main:app --reload --port 8000
pause
