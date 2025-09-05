import requests

print("Testing first-chat with user 25 (new user)...")
response = requests.post('http://localhost:8001/api/v1/user-chat-sessions/first-chat/25/1')
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'Message: {data.get("message")}')
    print(f'Conversation ID: {data.get("conversation_id")}')
    print(f'Source: {data.get("session", {}).get("session_data", {}).get("conversation_source")}')
else:
    print(f'Error: {response.text}')

# Test xem có chat_history cho user 25 không
print("\nChecking chat history for user 25...")
response2 = requests.get('http://localhost:8001/api/v1/chat-history/app/Test%20bot')
if response2.status_code == 200:
    data2 = response2.json()
    user25_messages = [msg for msg in data2 if msg.get('user_id') == 25]
    print(f'User 25 has {len(user25_messages)} messages in chat history')
    if user25_messages:
        print(f'Conversation ID from chat history: {user25_messages[0].get("conversation_id")}')
else:
    print(f'Error getting chat history: {response2.status_code}')
