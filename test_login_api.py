#!/usr/bin/env python3
"""
Test login API directly
"""
import requests
import json

def test_login():
    """Test login API"""
    url = "http://localhost:8001/api/v1/users/auth/login"

    payload = {
        "email": "nguyenvana@company.com",
        "password": "123456"
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        print(f"Testing login to: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")

        response = requests.post(url, json=payload, headers=headers)

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"User: {data.get('user', {})}")
            print(f"Role: {data.get('role')}")
        else:
            print("❌ Login failed")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure backend is running on port 8001")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_login()