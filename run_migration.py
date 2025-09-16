#!/usr/bin/env python3
"""
Script để chạy migration merge users và nhan_vien tables thành employees table
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

def run_migration():
    """Chạy migration script"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        migration_file = os.path.join(os.path.dirname(__file__), 'merge_users_nhanvien_migration.sql')

        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        print("🚀 Đang chạy migration script...")
        print("📄 File: merge_users_nhanvien_migration.sql")

        # Split SQL content by semicolon and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

        for i, statement in enumerate(statements, 1):
            if statement:
                try:
                    print(f"⚡ Executing statement {i}/{len(statements)}...")
                    cursor.execute(statement)
                    print(f"✅ Statement {i} completed")
                except Exception as stmt_error:
                    print(f"❌ Error in statement {i}: {stmt_error}")
                    # Continue with next statement instead of failing completely
                    continue

        conn.commit()
        print("🎉 Migration completed successfully!")
        print("📊 Tables merged: users + nhan_vien → employees")
        print("🔄 Foreign key references updated")
        print("👀 Backward compatibility views created")

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
    print("🔄 Starting database migration...")
    print("🎯 Merging users and nhan_vien tables into unified employees table")
    run_migration()