#!/usr/bin/env python3
"""
Script để tạo bảng payroll trong database sử dụng psycopg2
"""
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
load_dotenv(os.path.join(backend_dir, '.env'))

def get_db_connection():
    """Tạo kết nối database"""
    return psycopg2.connect(
        host=os.getenv('SUPABASE_DB_HOST'),
        database=os.getenv('SUPABASE_DB_NAME'),
        user=os.getenv('SUPABASE_DB_USER'),
        password=os.getenv('SUPABASE_DB_PASSWORD'),
        port=os.getenv('SUPABASE_DB_PORT')
    )

def run_sql_file(file_path):
    """Chạy file SQL"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Execute the entire SQL content
        cursor.execute(sql_content)

        conn.commit()
        print("✅ SQL file executed successfully!")

    except Exception as e:
        print(f"❌ Error running SQL file: {e}")
        if 'conn' in locals():
            conn.rollback()

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    sql_file = os.path.join(backend_dir, 'create_payroll_tables.sql')
    run_sql_file(sql_file)