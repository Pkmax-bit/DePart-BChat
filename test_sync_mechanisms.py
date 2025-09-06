import requests
import time

def test_sync_mechanisms():
    """Test các cơ chế sync email khác nhau"""

    print("=== TEST CÁC CƠ CHẾ SYNC EMAIL ===")

    # 1. Test auto sync khi tạo chat_history
    print("\n1. Test auto sync khi tạo chat_history...")
    chat_data = {
        'input_text': 'Test message',
        'output_text': 'Test response',
        'conversation_id': 'test_sync_mechanisms',
        'name_app': 'Test bot',
        'Email': 'phannguyendangkhoa0915@gmail.com'
    }

    response = requests.post('http://localhost:8001/api/v1/chat-history/', json=chat_data)
    print(f'Status: {response.status_code}')
    if response.status_code == 201:
        print('✅ Auto sync khi tạo record thành công')

    # 2. Test manual sync tất cả
    print("\n2. Test manual sync tất cả...")
    response = requests.post('http://localhost:8001/api/v1/chat-history/sync-email-to-user-chat')
    if response.status_code == 200:
        result = response.json()
        print(f'✅ Manual sync: {result}')

    # 3. Test detect new emails
    print("\n3. Test detect new emails...")
    response = requests.post('http://localhost:8001/api/v1/chat-history/detect-new-emails')
    if response.status_code == 200:
        result = response.json()
        print(f'✅ Detect new emails: {result}')

    # 4. Test sync pending
    print("\n4. Test sync pending...")
    response = requests.post('http://localhost:8001/api/v1/chat-history/sync-all-pending')
    if response.status_code == 200:
        result = response.json()
        print(f'✅ Sync pending: {result}')

    # 5. Test check and sync recent
    print("\n5. Test check and sync recent...")
    response = requests.post('http://localhost:8001/api/v1/chat-history/check-and-sync-email')
    if response.status_code == 200:
        result = response.json()
        print(f'✅ Check and sync recent: {result}')

    print("\n=== HOÀN THÀNH TEST CƠ CHẾ SYNC ===")

if __name__ == "__main__":
    test_sync_mechanisms()
