import requests

response = requests.get('http://localhost:8001/api/v1/users/')
print(f'Status: {response.status_code}')
print(f'Response: {response.text}')

if response.status_code == 200:
    try:
        users = response.json()
        print('Response type:', type(users))
        if isinstance(users, list):
            print('Available users:')
            for user in users:
                print(f'  ID: {user.get("id")}, Username: {user.get("username")}')
        else:
            print('Response is not a list:', users)
    except Exception as e:
        print('JSON parse error:', e)
else:
    print('Failed to get users')
