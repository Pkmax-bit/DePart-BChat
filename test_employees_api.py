import requests
import os
from dotenv import load_dotenv

# Load from backend/.env
load_dotenv(dotenv_path='backend/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

print(f"URL: {SUPABASE_URL}")
print(f"Key exists: {SUPABASE_ANON_KEY is not None}")

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json'
}

try:
    response = requests.get(f'{SUPABASE_URL}/rest/v1/employees?select=*', headers=headers)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Found {len(data)} employees')
        if data:
            print('Sample employee:', data[0])
    else:
        print('Error:', response.text)
except Exception as e:
    print('Exception:', e)