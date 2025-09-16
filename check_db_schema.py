#!/usr/bin/env python3
"""
Check database schema and tables
"""
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
load_dotenv(os.path.join(backend_dir, '.env'))

def check_database():
    try:
        conn = psycopg2.connect(
            host=os.getenv('SUPABASE_DB_HOST'),
            database=os.getenv('SUPABASE_DB_NAME'),
            user=os.getenv('SUPABASE_DB_USER'),
            password=os.getenv('SUPABASE_DB_PASSWORD'),
            port=os.getenv('SUPABASE_DB_PORT')
        )
        cursor = conn.cursor()

        # Check if employees table exists
        cursor.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees')")
        exists = cursor.fetchone()[0]
        print(f'Employees table exists: {exists}')

        # List all tables
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
        tables = cursor.fetchall()
        print('All tables:')
        for table in tables:
            print(f'  - {table[0]}')

        # Check users and nhan_vien tables
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'nhan_vien')")
        user_tables = cursor.fetchall()
        print('User-related tables:')
        for table in user_tables:
            print(f'  - {table[0]}')

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_database()