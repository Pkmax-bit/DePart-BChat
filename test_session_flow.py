#!/usr/bin/env python3
"""
Test script để kiểm tra flow session mới:
1. User chọn chatflow -> tạo session và lấy conversation_id từ chat_history
2. Iframe load với conversation_id đúng
3. User gửi message -> session được cập nhật
"""

import requests
import json
import time

BASE_URL = "http://localhost:8001"

def test_session_flow():
    print("=== Testing Session Flow ===")

    # Giả sử user_id = 8 (dangkhoa), chatflow_id = 1
    user_id = 8
    chatflow_id = 1

    print(f"Testing with user_id={user_id}, chatflow_id={chatflow_id}")

    # Step 1: Simulate user selecting chatflow (calls first-chat endpoint)
    print("\n1. User selects chatflow - calling first-chat endpoint...")
    response = requests.post(f"{BASE_URL}/api/v1/user-chat-sessions/first-chat/{user_id}/{chatflow_id}")

    if response.status_code == 200:
        result = response.json()
        print("✓ First chat session created successfully")
        print(f"  Conversation ID: {result.get('conversation_id')}")
        print(f"  Session: {result.get('session', {}).get('id')}")
    else:
        print(f"✗ Failed to create first chat session: {response.status_code}")
        print(response.text)
        return

    conversation_id = result.get('conversation_id')

    # Step 2: Check if session was created properly
    print("\n2. Checking session data...")
    response = requests.get(f"{BASE_URL}/api/v1/user-chat-sessions/user/{user_id}/chatflow/{chatflow_id}")

    if response.status_code == 200:
        session_data = response.json()
        print("✓ Session loaded successfully")
        print(f"  Conversation ID in session: {session_data.get('conversation_id')}")
        print(f"  Matches expected: {session_data.get('conversation_id') == conversation_id}")
    else:
        print(f"✗ Failed to load session: {response.status_code}")

    # Step 3: Simulate iframe loading with conversation_id
    print("\n3. Simulating iframe load...")
    if conversation_id:
        print(f"✓ Iframe would load with conversation_id: {conversation_id}")
    else:
        print("✗ No conversation_id for iframe")

    # Step 4: Check chat history
    print("\n4. Checking chat history...")
    if conversation_id:
        response = requests.get(f"{BASE_URL}/api/v1/chat-history/conversation/{conversation_id}")
        if response.status_code == 200:
            history = response.json()
            print(f"✓ Chat history loaded: {len(history)} messages")
        else:
            print(f"✗ Failed to load chat history: {response.status_code}")

    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_session_flow()
