@echo off
echo ====================================================
echo Starting PulseRoute Backend (FastAPI on Port 8000)...
echo ====================================================
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause
