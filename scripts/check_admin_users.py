from supabase_client import supabase
import sys

try:
    # Kiểm tra users có role admin
    result = supabase.table('users').select('*').eq('role_id', 1).execute()
    print('Admin users found:')
    for user in result.data:
        print(f'  - {user["username"]} ({user["email"]}) - Role: {user["role_id"]}')

    if not result.data:
        print('No admin users found. Let me check all users:')
        all_users = supabase.table('users').select('*').execute()
        for user in all_users.data:
            print(f'  - {user["username"]} ({user["email"]}) - Role: {user["role_id"]}')

except Exception as e:
    print(f'Error: {e}')
