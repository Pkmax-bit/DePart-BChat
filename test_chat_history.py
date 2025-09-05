#!/usr/bin/env python3
"""
Test script để kiểm tra logic lấy conversation_id từ chat_history
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def test_chat_history_lookup():
    print("=== Testing Chat History Lookup ===")

    # Test data
    user_id = 8
    chatflow_id = 1

    print(f"Testing with user_id={user_id}, chatflow_id={chatflow_id}")

    # 1. Kiểm tra chatflow name
    print("\n1. Getting chatflow name...")
    response = requests.get(f"{BASE_URL}/api/v1/chatflows/")
    if response.status_code == 200:
        chatflows = response.json()
        chatflow = next((cf for cf in chatflows if cf['id'] == chatflow_id), None)
        if chatflow:
            chatflow_name = chatflow.get('name')
            print(f"✓ Chatflow name: {chatflow_name}")
        else:
            print(f"✗ Chatflow with id {chatflow_id} not found")
            return
    else:
        print(f"✗ Failed to get chatflows: {response.status_code}")
        return

    # 2. Kiểm tra chat_history data
    print("\n2. Checking chat_history data...")
    response = requests.get(f"{BASE_URL}/api/v1/chat-history/")
    if response.status_code == 200:
        history = response.json()
        print(f"✓ Found {len(history)} total chat history records")

        # Filter by user_id and chatflow name
        user_records = [h for h in history if h.get('user_id') == user_id]
        print(f"✓ Found {len(user_records)} records for user {user_id}")

        matching_records = [h for h in user_records if h.get('name_app') == chatflow_name]
        print(f"✓ Found {len(matching_records)} records for chatflow '{chatflow_name}'")

        if matching_records:
            for record in matching_records[:3]:  # Show first 3
                print(f"  - Conversation ID: {record.get('conversation_id')}")
                print(f"  - Message: {record.get('user_message', '')[:50]}...")
                print(f"  - Timestamp: {record.get('created_at')}")
        else:
            print("✗ No chat history records found for this user+chatflow combination")
    else:
        print(f"✗ Failed to get chat history: {response.status_code}")

    # 3. Test first-chat endpoint
    print("\n3. Testing first-chat endpoint...")
    response = requests.post(f"{BASE_URL}/api/v1/user-chat-sessions/first-chat/{user_id}/{chatflow_id}")

    if response.status_code == 200:
        result = response.json()
        conversation_id = result.get('conversation_id')
        source = result.get('session', {}).get('session_data', {}).get('conversation_source')

        print("✓ First chat successful")
        print(f"  Conversation ID: {conversation_id}")
        print(f"  Source: {source}")

        if source == 'chat_history':
            print("✓ Conversation ID retrieved from chat_history")
        elif source == 'local':
            print("✓ New conversation ID created (no history found)")
        else:
            print("? Unknown source")
    else:
        print(f"✗ First chat failed: {response.status_code}")
        print(response.text)

    # 4. Verify session data
    print("\n4. Verifying session data...")
    response = requests.get(f"{BASE_URL}/api/v1/user-chat-sessions/user/{user_id}/chatflow/{chatflow_id}")

    if response.status_code == 200:
        session = response.json()
        print("✓ Session data retrieved")
        print(f"  Conversation ID: {session.get('conversation_id')}")
        print(f"  Session data: {session.get('session_data')}")
    else:
        print(f"✗ Failed to get session: {response.status_code}")

if __name__ == "__main__":
    test_chat_history_lookup()
