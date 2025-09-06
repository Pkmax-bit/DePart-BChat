#!/usr/bin/env python3
"""
Test script để kiểm tra các endpoints chat history với anonymous access
"""
import requests
import json
from datetime import datetime

# Cấu hình
BASE_URL = "http://localhost:8000"  # Thay đổi nếu cần
CHAT_HISTORY_API = f"{BASE_URL}/api/chat-history"

def test_endpoint(url, description):
    """Test một endpoint và in kết quả"""
    print(f"\n=== Testing: {description} ===")
    print(f"URL: {url}")

    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    print(f"Success: Returned {len(data)} records")
                    if len(data) > 0:
                        print(f"Sample record keys: {list(data[0].keys()) if isinstance(data[0], dict) else 'Not a dict'}")
                elif isinstance(data, dict):
                    print(f"Success: Returned dict with keys: {list(data.keys())}")
                    if 'conversations' in data:
                        print(f"Found {len(data['conversations'])} conversations")
                    if 'apps' in data:
                        print(f"Found {len(data['apps'])} apps")
                else:
                    print(f"Success: Returned {type(data)}")
            except:
                print(f"Success: Response content length: {len(response.text)}")
        else:
            print(f"Error: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

def main():
    """Chạy tất cả các test"""
    print("Testing Chat History API Endpoints with Anonymous Access")
    print("=" * 60)

    # Test endpoints
    test_endpoint(f"{CHAT_HISTORY_API}/", "Get all chat history")
    test_endpoint(f"{CHAT_HISTORY_API}/?limit=10", "Get all chat history with limit")
    test_endpoint(f"{CHAT_HISTORY_API}/my-conversations", "Get my conversations (anonymous)")
    test_endpoint(f"{CHAT_HISTORY_API}/apps", "Get apps list")

    # Test với conversation ID mẫu (thay thế bằng ID thực tế)
    sample_conversation_id = "conv_sample_123"
    test_endpoint(f"{CHAT_HISTORY_API}/conversation/{sample_conversation_id}", f"Get conversation {sample_conversation_id}")

    # Test với user ID mẫu (thay thế bằng ID thực tế)
    sample_user_id = 1
    test_endpoint(f"{CHAT_HISTORY_API}/user/{sample_user_id}", f"Get user {sample_user_id} chat history")

    # Test với app name mẫu
    sample_app_name = "Test%20App"
    test_endpoint(f"{CHAT_HISTORY_API}/app/{sample_app_name}", f"Get app {sample_app_name} chat history")

    print("\n" + "=" * 60)
    print("Test completed!")

if __name__ == "__main__":
    main()
