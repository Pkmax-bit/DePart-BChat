import requests

# Kiểm tra chat history
response = requests.get('http://localhost:8001/api/v1/chat-history/')
if response.status_code == 200:
    data = response.json()
    print('Recent chat history records:')
    for record in data[:3]:
        print(f'- Log ID: {record.get("log_id")}, User ID: {record.get("user_id")}, Name App: {record.get("name_app")}')
else:
    print('Error getting chat history:', response.status_code, response.text)

# Kiểm tra user chat sessions
response = requests.get('http://localhost:8001/api/v1/user-chat-sessions/user/1')
if response.status_code == 200:
    data = response.json()
    print(f'User 1 has {len(data)} sessions')
    for session in data:
        print(f'- Chatflow ID: {session.get("chatflow_id")}, Conversation: {session.get("conversation_id")}')
else:
    print('Error getting user sessions:', response.status_code, response.text)
