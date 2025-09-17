from supabase_client import supabase, SUPABASE_AVAILABLE

if SUPABASE_AVAILABLE:
    try:
        # Try to query employees table
        print("Checking employees table...")
        try:
            result = supabase.table('employees').select('*', count='exact').limit(1).execute()
            print(f"✅ employees table exists with {result.count} records")
        except Exception as e:
            print(f"❌ employees table error: {e}")

        # Try to query nhan_vien table
        print("Checking nhan_vien table...")
        try:
            result = supabase.table('nhan_vien').select('*', count='exact').limit(1).execute()
            print(f"✅ nhan_vien table exists with {result.count} records")
        except Exception as e:
            print(f"❌ nhan_vien table error: {e}")

    except Exception as e:
        print(f'Error checking database: {e}')
else:
    print('Supabase not available')