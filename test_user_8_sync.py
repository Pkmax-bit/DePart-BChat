import requests
import time

# Sử dụng user ID 8 làm mẫu
user_id = 8

# Lấy thông tin user 8
print('1. Lấy thông tin user 8...')
response = requests.get('http://localhost:8001/api/v1/users/')
if response.status_code == 200:
    data = response.json()
    users = data.get('users', [])

    user_8 = None
    for user in users:
        if user.get('id') == user_id:
            user_8 = user
            break

    if user_8:
        email = user_8.get('email')
        print(f'User 8 email: {email}')

        # Tạo chat_history với email của user 8
        chat_data = {
            'input_text': f'{{"Email":"{email}"}}',
            'output_text': 'Test auto sync với user 8',
            'conversation_id': f'test_user_{user_id}',
            'name_app': 'Test bot'
        }

        print('2. Tạo chat_history với email của user 8...')
        response = requests.post('http://localhost:8001/api/v1/chat-history/', json=chat_data)
        print('Status:', response.status_code)
        if response.status_code == 201:
            record = response.json()
            print('Created record:', record.get('log_id'))

            # Đợi sync
            print('3. Đợi sync...')
            time.sleep(2)

            # Kiểm tra user_chat
            print('4. Kiểm tra user_chat...')
            response = requests.get(f'http://localhost:8001/api/v1/user-chat/email/{email}')
            print('User-chat status:', response.status_code)
            if response.status_code == 200:
                data = response.json()
                print('User-chat records:', len(data))
                if data:
                    print('Sample record:', data[0])
            else:
                print('Error:', response.text)

            # Kiểm tra chat_history user_id
            print('5. Kiểm tra chat_history user_id...')
            response = requests.get(f'http://localhost:8001/api/v1/chat-history/conversation/test_user_{user_id}')
            if response.status_code == 200:
                history = response.json()
                if history:
                    user_id_in_record = history[0].get('user_id')
                    print('Chat history user_id:', user_id_in_record)
        else:
            print('Error creating chat history:', response.text)
    else:
        print('User ID 8 không tồn tại')
else:
    print('Error getting users:', response.text)
