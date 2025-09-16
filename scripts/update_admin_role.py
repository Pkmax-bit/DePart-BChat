from supabase_client import supabase
import sys

try:
    # Kiểm tra roles table
    roles = supabase.table('roles').select('*').execute()
    print('Available roles:')
    for role in roles.data:
        print(f'  - ID: {role["id"]}, Name: {role["name"]}')

    # Update user khoa to admin role (role_id = 1)
    update_result = supabase.table('employees').update({'role_id': 1}).eq('username', 'khoa').execute()
    print(f'\nUpdated user khoa to admin role: {update_result.data}')

    # Verify the update
    verify = supabase.table('employees').select('*').eq('username', 'khoa').execute()
    print(f'Verified user: {verify.data[0] if verify.data else "Not found"}')

except Exception as e:
    print(f'Error: {e}')
