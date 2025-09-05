#!/usr/bin/env python3
"""
Test script để simulate full user flow:
1. User login
2. User selects chatflow
3. Check session and conversation_id
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def test_full_user_flow():
    print("=== Testing Full User Flow ===")

    # Step 1: User login
    print("\n1. User login...")
    login_data = {
        "email": "phannguyendangkhoa0915@gmail.com",
        "password": "123456"  # Giả sử password mặc định
    }

    response = requests.post(f"{BASE_URL}/api/v1/users/auth/login", json=login_data)

    if response.status_code == 200:
        login_result = response.json()
        print("✓ Login successful")
        user_id = login_result["user"]["id"]
        print(f"  User ID: {user_id}")
    else:
        print(f"✗ Login failed: {response.status_code}")
        print(response.text)
        return

    # Step 2: Get available chatflows for user
    print("\n2. Getting chatflows...")
    response = requests.get(f"{BASE_URL}/api/v1/chatflows/user/{user_id}")

    if response.status_code == 200:
        chatflows = response.json()
        print(f"✓ Got {len(chatflows)} chatflows")
        if chatflows:
            chatflow = chatflows[0]  # Chọn chatflow đầu tiên
            chatflow_id = chatflow["id"]
            print(f"  Selected chatflow: {chatflow['name']} (ID: {chatflow_id})")
        else:
            print("✗ No chatflows available")
            return
    else:
        print(f"✗ Failed to get chatflows: {response.status_code}")
        return

    # Step 3: Simulate selecting chatflow (calls first-chat endpoint)
    print("\n3. Selecting chatflow...")
    response = requests.post(f"{BASE_URL}/api/v1/user-chat-sessions/first-chat/{user_id}/{chatflow_id}")

    if response.status_code == 200:
        result = response.json()
        print("✓ Chatflow selected successfully")
        conversation_id = result.get("conversation_id")
        print(f"  Conversation ID: {conversation_id}")
    else:
        print(f"✗ Failed to select chatflow: {response.status_code}")
        print(response.text)
        return

    # Step 4: Verify session
    print("\n4. Verifying session...")
    response = requests.get(f"{BASE_URL}/api/v1/user-chat-sessions/user/{user_id}/chatflow/{chatflow_id}")

    if response.status_code == 200:
        session = response.json()
        print("✓ Session verified")
        print(f"  Session conversation_id: {session.get('conversation_id')}")
        print(f"  Matches: {session.get('conversation_id') == conversation_id}")
    else:
        print(f"✗ Failed to verify session: {response.status_code}")

    print("\n=== Full User Flow Test Complete ===")

if __name__ == "__main__":
    test_full_user_flow()
