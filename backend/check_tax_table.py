from supabase_client import supabase, SUPABASE_AVAILABLE

if SUPABASE_AVAILABLE:
    try:
        # Try to select from the table to see if it exists
        result = supabase.table('cai_dat_thue').select('id').limit(1).execute()
        print('Table cai_dat_thue already exists')
    except Exception as e:
        print(f'Table does not exist or error: {e}')
        print('Please run the SQL manually in Supabase dashboard')
else:
    print('Supabase not available')