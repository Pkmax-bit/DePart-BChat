import sys
sys.path.append('./backend')
from supabase_client import supabase

# Kiểm tra users table
result = supabase.table('employees').select('id, email, username').execute()
print('Users:')
for user in result.data:
    print(f'ID: {user["id"]}, Email: {user["email"]}, Username: {user["username"]}')

# Kiểm tra user_chat với user_id = 8
result2 = supabase.table('user_chat').select('*').eq('user_id', 8).execute()
print('\nUser Chat for user_id 8:')
print(result2.data)
