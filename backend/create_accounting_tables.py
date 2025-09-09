# create_accounting_tables.py
import os
from supabase_client import supabase

def create_accounting_tables():
    """Tạo các bảng cho hệ thống quản lý sản phẩm và hóa đơn"""

    # Đọc file SQL
    sql_file_path = os.path.join(os.path.dirname(__file__), 'create_accounting_tables.sql')

    try:
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Tách các câu lệnh SQL
        sql_statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

        for sql in sql_statements:
            if sql:  # Bỏ qua các câu lệnh rỗng
                try:
                    # Thực thi từng câu lệnh SQL
                    result = supabase.rpc('exec_sql', {'sql': sql})
                    print(f"Executed: {sql[:50]}...")
                except Exception as e:
                    print(f"Error executing SQL: {sql[:50]}... - {str(e)}")

        print("Accounting tables creation completed!")

    except FileNotFoundError:
        print(f"SQL file not found: {sql_file_path}")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")

if __name__ == "__main__":
    create_accounting_tables()
