#!/usr/bin/env python3
"""
Check invoice_items table schema
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

try:
    from supabase_client import supabase

    print('=== CHECK: invoice_items Table Schema ===')
    print()

    # Get table information using information_schema
    print('Checking numeric columns in invoice_items table...')

    # Query to get column information
    schema_query = """
    SELECT column_name, data_type, numeric_precision, numeric_scale, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'invoice_items'
    AND table_schema = 'public'
    AND data_type IN ('numeric', 'decimal', 'integer', 'bigint', 'smallint')
    ORDER BY ordinal_position;
    """

    try:
        # Use rpc to execute the schema query
        result = supabase.rpc('exec_sql', {
            'sql': schema_query
        })

        print('Numeric columns in invoice_items table:')
        print('=' * 80)
        print(f"{'Column Name':<25} {'Data Type':<15} {'Precision':<10} {'Scale':<6} {'Nullable':<10}")
        print('=' * 80)

        # Since we can't directly execute information_schema queries through Supabase RPC,
        # let's try a different approach - check by inserting test data
        print('Trying to identify problematic column by testing different values...')

        # Test with smaller values
        test_data = {
            "invoice_id": 1,
            "loai_san_pham": "tu_bep",
            "id_nhom": 1,
            "id_kinh": 1,
            "id_taynam": 1,
            "id_bophan": 1,
            "sanpham_id": 1,
            "ngang": 100,
            "cao": 200,
            "sau": 50,
            "so_luong": 1,
            "don_gia": 1000000,
            "dien_tich_ke_hoach": 20000,
            "dien_tich_thuc_te": 20000,
            "ti_le": 100.0,
            "chiet_khau": 10.0,
            "thanh_tien": 900000
        }

        print('Test data values:')
        for key, value in test_data.items():
            print(f"  {key}: {value} (type: {type(value).__name__})")

    except Exception as e:
        print(f'❌ Schema check failed: {e}')

        # Alternative: try to get a sample row and see what happens
        print('Trying alternative approach...')
        try:
            sample = supabase.table('invoice_items').select('*').limit(1).execute()
            if sample.data:
                print('Sample row structure:')
                for key, value in sample.data[0].items():
                    print(f"  {key}: {value} (type: {type(value).__name__})")
        except Exception as e2:
            print(f'❌ Alternative check also failed: {e2}')

except Exception as e:
    print(f'❌ Error: {e}')
