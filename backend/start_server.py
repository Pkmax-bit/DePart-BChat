#!/usr/bin/env python3
"""
Simple script to run the FastAPI backend server
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import the app
from main import app

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)