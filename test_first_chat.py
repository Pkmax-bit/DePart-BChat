import requests

response = requests.get('http://localhost:8001/api/v1/chatflows/')
print('Available chatflows:')
for c in response.json():
    print(f'ID: {c["id"]}, Name: {c["name"]}')

# Test first-chat với chatflow đầu tiên
if response.json():
    first_chatflow = response.json()[0]
    print(f'\nTesting first-chat with chatflow {first_chatflow["id"]}')
    response2 = requests.post(f'http://localhost:8001/api/v1/user-chat-sessions/first-chat/8/{first_chatflow["id"]}')
    print(f'Status: {response2.status_code}')
    print(f'Response: {response2.json() if response2.status_code == 200 else response2.text}')
