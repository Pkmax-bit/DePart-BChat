import requests

response = requests.get('http://localhost:8001/api/v1/chatflows/')
if response.status_code == 200:
    chatflows = response.json()
    for cf in chatflows:
        print(f'Chatflow: {cf["name"]}')
        print(f'Embed URL: {cf["embed_url"]}')
        print('---')
else:
    print(f'Error: {response.status_code}')
