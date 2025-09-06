import requests
import time

# Tạo chat_history với email
chat_data = {
    'input_text': '{"Email":"debug@example.com"}',
    'output_text': 'Test auto sync',
    'conversation_id': 'debug_test_123',
    'name_app': 'Test bot'
}

print('1. Tạo chat_history với email...')
response = requests.post('http://localhost:8001/api/v1/chat-history/', json=chat_data)
print('Status:', response.status_code)
if response.status_code == 201:
    record = response.json()
    print('Created record:', record.get('log_id'))
    
    # Đợi 2 giây để sync
    print('2. Đợi sync...')
    time.sleep(2)
    
    # Kiểm tra user_chat
    print('3. Kiểm tra user_chat...')
    response = requests.get('http://localhost:8001/api/v1/user-chat/email/debug@example.com')
    print('User-chat status:', response.status_code)
    if response.status_code == 200:
        data = response.json()
        print('User-chat records:', len(data))
        if data:
            print('Sample record:', data[0])
    else:
        print('Error:', response.text)
        
    # Kiểm tra chat_history đã update user_id chưa
    print('4. Kiểm tra chat_history user_id...')
    response = requests.get('http://localhost:8001/api/v1/chat-history/conversation/debug_test_123')
    if response.status_code == 200:
        history = response.json()
        if history:
            user_id = history[0].get('user_id')
            print('Chat history user_id:', user_id)
