#!/usr/bin/env python3
"""
Tạo dữ liệu chat_history mẫu để test logic lấy conversation_id từ chat_history
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001"

def create_sample_chat_history():
    print("=== Creating Sample Chat History ===")

    # Sample data
    user_id = 8
    chatflow_name = "Test bot"
    conversation_id = "sample_conv_12345"

    # Tạo một số message mẫu
    messages = [
        {
            "user_id": user_id,
            "name_app": chatflow_name,
            "conversation_id": conversation_id,
            "input_text": "Hello, this is a test message",
            "output_text": "Hello! How can I help you today?",
            "created_at": datetime.now().isoformat()
        },
        {
            "user_id": user_id,
            "name_app": chatflow_name,
            "conversation_id": conversation_id,
            "input_text": "Can you tell me about your features?",
            "output_text": "I can help with various tasks including answering questions, providing information, and assisting with workflows.",
            "created_at": datetime.now().isoformat()
        }
    ]

    created_count = 0
    for message in messages:
        response = requests.post(f"{BASE_URL}/api/v1/chat-history/", json=message)
        if response.status_code == 201:
            print(f"✓ Created chat history record")
            created_count += 1
        else:
            print(f"✗ Failed to create chat history: {response.status_code}")
            print(response.text)

    print(f"\nCreated {created_count} chat history records")
    return conversation_id

def test_chat_history_lookup_after_creation():
    print("\n=== Testing Chat History Lookup After Creation ===")

    # Test get_conversation_id_from_chat_history logic
    user_id = 8
    chatflow_id = 1

    response = requests.post(f"{BASE_URL}/api/v1/user-chat-sessions/first-chat/{user_id}/{chatflow_id}")

    if response.status_code == 200:
        result = response.json()
        conversation_id = result.get('conversation_id')
        session = result.get('session', {})
        source = session.get('session_data', {}).get('conversation_source')

        print("✓ First chat successful")
        print(f"  Conversation ID: {conversation_id}")
        print(f"  Source: {source}")

        if source == 'chat_history':
            print("✓ Conversation ID retrieved from chat_history ✅")
        elif source == 'local':
            print("✓ New conversation ID created (no history found)")
        else:
            print(f"? Unknown source: {source}")
    else:
        print(f"✗ First chat failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    # Tạo dữ liệu mẫu
    sample_conv_id = create_sample_chat_history()

    # Test logic
    test_chat_history_lookup_after_creation()

    print(f"\nSample conversation ID created: {sample_conv_id}")
