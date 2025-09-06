@echo off
echo Starting Instant Email Sync Service...
echo.

REM Chạy service trong background
start /B python scripts/instant_email_sync.py

echo ✅ Instant Email Sync Service started in background
echo 🔄 Service is checking for new email records every 1 second
echo ⚡ Will trigger sync IMMEDIATELY when detected
echo.
echo To stop the service, find and close the Python process
echo or use Task Manager to end the python.exe process
echo.
pause
