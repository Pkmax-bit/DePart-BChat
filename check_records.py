import requests
data = requests.get('http://localhost:8001/api/v1/chat-history/', params={'limit': 3}).json()
print('Latest records:')
for r in data:
    print('ID:', r.get('log_id'), 'Email:', r.get('email'), 'UserID:', r.get('user_id'), 'Created:', r.get('created_at'))
