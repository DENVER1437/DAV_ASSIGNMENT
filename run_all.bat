@echo off
echo ====================================================
echo Launching PulseRoute (Backend + Frontend on Port 5180)...
echo ====================================================
start "PulseRoute Backend" cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"
start "PulseRoute Frontend" cmd /k "cd frontend && npm run dev"
echo Both services launched in separate windows!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5180
timeout /t 3 /nobreak >nul
start http://localhost:5180
