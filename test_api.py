import requests

# Test user-chat API
response = requests.get('http://localhost:8001/api/v1/user-chat/user/8')
print('User-chat API Status:', response.status_code)
if response.status_code == 200:
    data = response.json()
    print('Records found:', len(data))
    for record in data:
        print('  Conversation:', record['conversation_id'])
else:
    print('Error:', response.text)

# Test chat-history API
response2 = requests.get('http://localhost:8001/api/v1/chat-history/conversation/bdd47818-c62a-4a92-854d-5a87a34f9985')
print('\nChat-history API Status:', response2.status_code)
if response2.status_code == 200:
    data2 = response2.json()
    print('Messages found:', len(data2))
    for msg in data2:
        print('  Input:', msg.get('input_text', 'None')[:50])
        print('  Output:', msg.get('output_text', 'None')[:50])
else:
    print('Error:', response2.text)
