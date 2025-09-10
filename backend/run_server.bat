@echo off
cd /d d:\Project\Department-botchat\backend
python -c "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8001, reload=True)"
