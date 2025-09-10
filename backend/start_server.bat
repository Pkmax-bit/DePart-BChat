@echo off
cd /d d:\Project\Department-botchat\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
pause
