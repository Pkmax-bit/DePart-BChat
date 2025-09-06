#!/usr/bin/env python3
"""
Test script: Tự động sync email khi tạo chat_history
"""
import requests
import json

def test_auto_sync():
    """Test chức năng tự động sync email"""

    # Tạo chat history với email
    chat_data = {
        'input_text': '{"Email":"test@example.com"}',
        'output_text': 'Hello! This is an auto-sync test.',
        'conversation_id': 'auto_sync_test_123',
        'name_app': 'Test bot'
    }

    print("1. Tạo chat_history với email...")
    response = requests.post('http://localhost:8001/api/v1/chat-history/',
                           json=chat_data,
                           headers={'Content-Type': 'application/json'})

    if response.status_code == 201:
        record = response.json()
        print(f"✓ Tạo thành công: log_id = {record.get('log_id')}")

        # Kiểm tra xem đã tự động sync chưa
        print("\n2. Kiểm tra user_chat sau khi tạo...")

        # Đợi 1 chút để sync hoàn thành
        import time
        time.sleep(1)

        # Kiểm tra user_chat
        response = requests.get('http://localhost:8001/api/v1/user-chat/email/test@example.com')
        if response.status_code == 200:
            data = response.json()
            if data:
                print(f"✓ Tự động sync thành công: {len(data)} record(s)")
                for record in data:
                    print(f"  - User ID: {record.get('user_id')}")
                    print(f"  - Conversation: {record.get('conversation_id')}")
            else:
                print("✗ Chưa có record trong user_chat")
        else:
            print(f"✗ Lỗi kiểm tra user_chat: {response.status_code}")

        # Kiểm tra chat_history đã được update user_id chưa
        print("\n3. Kiểm tra chat_history đã update user_id...")
        response = requests.get(f"http://localhost:8001/api/v1/chat-history/conversation/{chat_data['conversation_id']}")
        if response.status_code == 200:
            history = response.json()
            if history and len(history) > 0:
                user_id = history[0].get('user_id')
                if user_id:
                    print(f"✓ Chat_history đã update user_id: {user_id}")
                else:
                    print("✗ Chat_history chưa có user_id")
        else:
            print(f"✗ Lỗi kiểm tra chat_history: {response.status_code}")

    else:
        print(f"✗ Lỗi tạo chat_history: {response.status_code}")
        print(response.text)

def test_manual_sync():
    """Test sync thủ công"""
    print("\n4. Test sync thủ công...")
    response = requests.post('http://localhost:8001/api/v1/chat-history/check-and-sync-email')

    if response.status_code == 200:
        result = response.json()
        print("✓ Sync thủ công hoàn thành:")
        print(f"  - Synced: {result.get('synced_records')}")
        print(f"  - Skipped: {result.get('skipped_records')}")
        print(f"  - Total checked: {result.get('total_checked')}")
    else:
        print(f"✗ Lỗi sync thủ công: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("🚀 Test chức năng tự động sync email")
    test_auto_sync()
    test_manual_sync()
    print("\n✅ Hoàn thành test!")
