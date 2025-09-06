
import requests
users = requests.get('http://localhost:8001/api/v1/users/').json()
print('Users type:', type(users))
print('Users:', users)
if isinstance(users, list):
    for i, u in enumerate(users):
        if i < 3:
            print('ID:', u.get('id'), 'Email:', u.get('email'))
else:
    print('Not a list')
