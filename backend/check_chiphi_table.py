#!/usr/bin/env python3
"""
Script để kiểm tra các bảng có sẵn trong database
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from supabase_client import supabase

def check_tables():
    """Kiểm tra các bảng có sẵn"""
    try:
        # Thử truy vấn một số bảng có thể liên quan đến chi phí
        tables_to_check = ['chiphi', 'loaichiphi', 'quanly_chiphi', 'loai_chiphi']

        print("Kiểm tra các bảng có thể liên quan đến chi phí:")
        for table_name in tables_to_check:
            try:
                result = supabase.table(table_name).select('*').limit(1).execute()
                if result.data:
                    print(f"✓ Bảng '{table_name}' tồn tại")
                    print(f"  Cấu trúc: {list(result.data[0].keys())}")
                else:
                    print(f"✓ Bảng '{table_name}' tồn tại nhưng trống")
            except Exception as e:
                print(f"✗ Bảng '{table_name}' không tồn tại hoặc lỗi: {str(e)}")

    except Exception as e:
        print(f"Lỗi khi kiểm tra database: {str(e)}")

if __name__ == "__main__":
    check_tables()
