#!/usr/bin/env python3
"""
Simplified script to run migration step by step
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

def run_simple_migration():
    """Chạy migration đơn giản"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        migration_file = os.path.join(os.path.dirname(__file__), 'simple_migration.sql')

        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        print("🚀 Đang chạy simplified migration...")

        # Execute the entire SQL content at once
        cursor.execute(sql_content)

        conn.commit()
        print("🎉 Migration completed successfully!")
        print("📊 Created employees table and migrated data")

        # Verify the migration
        cursor.execute("SELECT COUNT(*) FROM employees")
        count = cursor.fetchone()[0]
        print(f"📈 Total employees in new table: {count}")

        cursor.execute("SELECT COUNT(*) FROM users")
        users_count = cursor.fetchone()[0]
        print(f"📈 Total users in old table: {users_count}")

        cursor.execute("SELECT COUNT(*) FROM nhan_vien")
        nhanvien_count = cursor.fetchone()[0]
        print(f"📈 Total nhan_vien in old table: {nhanvien_count}")

    except Exception as e:
        print(f"❌ Error running migration: {e}")
        if 'conn' in locals():
            conn.rollback()

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🔄 Starting simplified database migration...")
    run_simple_migration()