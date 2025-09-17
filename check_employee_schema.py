from backend.supabase_client import supabase

try:
    # Lấy một record mẫu từ employees để xem cấu trúc
    result = supabase.table('employees').select('*').limit(1).execute()
    if result.data:
        print('Sample employee record:')
        for key, value in result.data[0].items():
            print(f'  {key}: {value} ({type(value).__name__})')
    else:
        print('No data in employees table')
except Exception as e:
    print(f'Error: {e}')