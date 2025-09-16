import sys
sys.path.append('backend')
from supabase_client import supabase

# Check if user exists with levanc@company.com
user_result = supabase.table('employees').select('*').eq('email', 'levanc@company.com').execute()
if user_result.data:
    user = user_result.data[0]
    print(f'✅ User found: ID {user["id"]}, Name: {user["full_name"]}, Email: {user["email"]}')
else:
    print('❌ User not found with email levanc@company.com')
    print('Available users:')
    users_result = supabase.table('employees').select('id, full_name, email').limit(5).execute()
    for user in users_result.data:
        print(f'  ID: {user["id"]}, Name: {user["full_name"]}, Email: {user["email"]}')
