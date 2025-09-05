import requests

# Test first-chat endpoint
print("Testing first-chat endpoint...")
response = requests.post('http://localhost:8001/api/v1/user-chat-sessions/first-chat/8/1')
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'Message: {data.get("message")}')
    print(f'Conversation ID: {data.get("conversation_id")}')
    print(f'Source: {data.get("session", {}).get("session_data", {}).get("conversation_source")}')
else:
    print(f'Error: {response.text}')
