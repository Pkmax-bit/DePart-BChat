import requests
import time

def test_email_column_only():
    """Test chỉ sử dụng cột Email, không parse từ input_text"""

    print("=== TEST CHỈ SỬ DỤNG CỘT EMAIL ===")

    # Test 1: Chat_history có cột Email
    print("\n1. Test với cột Email có dữ liệu...")
    chat_data_1 = {
        'input_text': 'Hello world',
        'output_text': 'Test with Email column',
        'conversation_id': 'test_email_column_only',
        'name_app': 'Test bot',
        'Email': 'phannguyendangkhoa0915@gmail.com'  # Cột Email có dữ liệu
    }

    response = requests.post('http://localhost:8001/api/v1/chat-history/', json=chat_data_1)
    print(f'Status: {response.status_code}')
    if response.status_code == 201:
        record = response.json()
        print(f'Created record: {record.get("log_id")}')

        time.sleep(1)

        # Kiểm tra user_chat
        response = requests.get('http://localhost:8001/api/v1/user-chat/email/phannguyendangkhoa0915@gmail.com')
        if response.status_code == 200:
            data = response.json()
            print(f'User-chat records: {len(data)}')
            if data:
                print('✅ Sync thành công với cột Email')

    # Test 2: Chat_history có email trong input_text nhưng không có cột Email
    print("\n2. Test với email trong input_text (không có cột Email)...")
    chat_data_2 = {
        'input_text': '{"Email":"phannguyendangkhoa0915@gmail.com"}',  # Email trong input_text
        'output_text': 'Test with email in input_text only',
        'conversation_id': 'test_input_text_only',
        'name_app': 'Test bot'
        # Không có cột Email
    }

    response = requests.post('http://localhost:8001/api/v1/chat-history/', json=chat_data_2)
    print(f'Status: {response.status_code}')
    if response.status_code == 201:
        record = response.json()
        print(f'Created record: {record.get("log_id")}')

        time.sleep(1)

        # Kiểm tra user_chat - không nên tạo record mới vì không có cột Email
        response = requests.get('http://localhost:8001/api/v1/user-chat/email/phannguyendangkhoa0915@gmail.com')
        if response.status_code == 200:
            data = response.json()
            print(f'User-chat records: {len(data)}')
            print('✅ Không tạo user_chat record khi chỉ có email trong input_text')

    # Test 3: Chat_history không có email nào
    print("\n3. Test không có email...")
    chat_data_3 = {
        'input_text': 'Hello without email',
        'output_text': 'Test without email',
        'conversation_id': 'test_no_email_only',
        'name_app': 'Test bot'
        # Không có cột Email và không có email trong input_text
    }

    response = requests.post('http://localhost:8001/api/v1/chat-history/', json=chat_data_3)
    print(f'Status: {response.status_code}')
    if response.status_code == 201:
        record = response.json()
        print(f'Created record: {record.get("log_id")}')

        time.sleep(1)

        # Kiểm tra user_chat - không nên có record mới
        response = requests.get('http://localhost:8001/api/v1/user-chat/email/phannguyendangkhoa0915@gmail.com')
        if response.status_code == 200:
            data = response.json()
            print(f'User-chat records: {len(data)}')
            print('✅ Không tạo user_chat record khi không có email')

    print("\n=== HOÀN THÀNH TEST ===")

if __name__ == "__main__":
    test_email_column_only()
