import requests

response = requests.get('http://localhost:8001/api/v1/chatflows/')
if response.status_code == 200:
    chatflows = response.json()
    print('Available chatflows:')
    for cf in chatflows:
        print(f'  ID: {cf["id"]}, Name: {cf["name"]}')
else:
    print('Failed to get chatflows')
