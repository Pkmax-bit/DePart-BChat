#!/usr/bin/env python3
"""
Script to run the FastAPI backend server
"""
import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Add the parent directory to Python path for calculate_project_budget
parent_dir = os.path.dirname(__file__)
sys.path.insert(0, parent_dir)

# Change to backend directory
os.chdir(backend_dir)

# Now import and run the FastAPI app
from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)