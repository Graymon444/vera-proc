@echo off
echo Starting VERA Backend...
echo.
cd /d "%~dp0"
"C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python313\python.exe" -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
pause
