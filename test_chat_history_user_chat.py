#!/usr/bin/env python3
"""
Test script cho chat history với user_chat integration
"""
import requests
import json
from datetime import datetime

# Cấu hình
BASE_URL = "http://localhost:8001"
API_PREFIX = "/chat-history"

def test_endpoint(endpoint, description, auth_token=None):
    """Test một endpoint"""
    print(f"\n🧪 Testing: {description}")
    print(f"📍 Endpoint: {endpoint}")

    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        print(f"📊 Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            if isinstance(data, list):
                print(f"📋 Returned {len(data)} records")
            elif isinstance(data, dict) and "data" in data:
                print(f"📋 Returned {len(data.get('data', []))} records")
            elif isinstance(data, dict) and "apps" in data:
                print(f"📋 Returned {len(data.get('apps', []))} apps")
            elif isinstance(data, dict) and "conversations" in data:
                print(f"📋 Returned {len(data.get('conversations', []))} conversations")
        else:
            print(f"❌ Error: {response.text}")

    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Main test function"""
    print("🚀 Testing Chat History với User Chat Integration")
    print("=" * 60)

    # Test các endpoint không cần auth trước
    test_endpoint(f"{API_PREFIX}/apps", "Get all apps (no auth)")

    # Test với auth (cần token thực)
    # Note: Trong thực tế cần có JWT token hợp lệ
    auth_token = None  # Thay bằng token thực khi test

    if auth_token:
        test_endpoint(f"{API_PREFIX}/", "Get my chat history", auth_token)
        test_endpoint(f"{API_PREFIX}/my-apps", "Get my apps", auth_token)
        test_endpoint(f"{API_PREFIX}/my-conversations", "Get my conversations", auth_token)
        test_endpoint(f"{API_PREFIX}/user/1", "Get user chat history", auth_token)
    else:
        print("\n⚠️  Skipping authenticated endpoints (no token provided)")
        print("   To test authenticated endpoints, set auth_token variable")

    print("\n" + "=" * 60)
    print("✅ Test completed!")

if __name__ == "__main__":
    main()
