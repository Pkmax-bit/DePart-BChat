#!/usr/bin/env python3
"""
Test login function directly
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

from routers.users import login_user
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

def test_login_direct():
    """Test login function directly"""
    try:
        print("Testing login function directly...")

        login_request = LoginRequest(email="nguyenvana@company.com", password="123456")

        result = login_user(login_request)

        print("✅ Login successful!")
        print(f"Result: {result}")

    except Exception as e:
        print(f"❌ Login failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_login_direct()