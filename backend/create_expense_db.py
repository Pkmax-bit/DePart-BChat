#!/usr/bin/env python3
"""
Script để tạo                            sample_data = {
                        'id_lcp': category_id,
                        'giathanh': 1000000.00,
                        'mo_ta': 'Chi phí mẫu để test hệ thống',
                        'created_at': '2025-09-10'
                    }           sample_data = {
                        'id_lcp': category_id,
                        'giathanh': 1000000.00,
                        'mo_ta': 'Chi phí mẫu để test hệ thống',
                        'created_at': '2025-09-10'
                    }        sample_data = {
                        'id_lcp': category_id,
                        'giathanh': 1000000.00,
                        'mo_ta': 'Chi phí mẫu để test hệ thống',
                        'created_at': '2025-09-10'
                    }g chi phí trong database
"""
import os
import sys
from supabase_client import supabase

def create_expense_tables():
    """Tạo các bảng chi phí"""
    try:
        # First, check if quanly_chiphi table exists
        try:
            result = supabase.table('quanly_chiphi').select('id').limit(1).execute()
            print("quanly_chiphi table already exists!")
        except Exception as e:
            print("quanly_chiphi table does not exist, creating it...")
            # Create quanly_chiphi table
            create_quanly_chiphi_sql = '''
            CREATE TABLE IF NOT EXISTS quanly_chiphi (
                id SERIAL PRIMARY KEY,
                id_lcp INTEGER,
                giathanh DECIMAL,
                hinhanh TEXT,
                created_at TIMESTAMP,
                mo_ta TEXT
            );
            '''
            supabase.rpc('exec_sql', {'sql': create_quanly_chiphi_sql})
            print("quanly_chiphi table created successfully!")

        # Add some sample data if table is empty
        try:
            count_result = supabase.table('quanly_chiphi').select('id', count='exact').execute()
            if count_result.count == 0:
                print("Adding sample expense data...")
                # Get first expense category ID
                category_result = supabase.table('loaichiphi').select('id').limit(1).execute()
                if category_result.data:
                    category_id = category_result.data[0]['id']
                    sample_data = {
                        'id_loai_chiphi': category_id,
                        'ten_chi_phi': 'Chi phí mẫu',
                        'so_tien': 1000000.00,
                        'mo_ta': 'Chi phí mẫu để test hệ thống',
                        'ngay_chi_phi': '2025-09-10'
                    }
                    supabase.table('quanly_chiphi').insert(sample_data).execute()
                    print("Sample expense data added!")
        except Exception as e:
            print(f"Warning adding sample data: {str(e)}")

        print("Expense database setup completed!")

    except Exception as e:
        print(f"Error creating expense tables: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    create_expense_tables()
