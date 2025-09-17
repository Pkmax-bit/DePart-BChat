import sys
sys.path.append('backend')

from backend.supabase_client import supabase

try:
    # Check the latest ma_nv values
    result = supabase.table('employees').select('ma_nv, ho_ten, email').order('ma_nv', desc=True).limit(5).execute()
    if result.data:
        print('Latest employees:')
        for emp in result.data:
            print(f'  ma_nv: {emp["ma_nv"]}, name: {emp["ho_ten"]}, email: {emp["email"]}')
    else:
        print('No employees found')
except Exception as e:
    print(f'Error: {e}')