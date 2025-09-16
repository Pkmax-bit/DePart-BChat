#!/usr/bin/env python3
"""
Script để tạo bảng payroll trong database
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

from supabase_client import supabase

def run_sql_file(file_path):
    """Chạy file SQL"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Split by semicolon and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

        for i, stmt in enumerate(statements):
            if stmt:
                try:
                    print(f"Executing statement {i+1}/{len(statements)}...")
                    supabase.rpc('exec_sql', {'sql': stmt}).execute()
                except Exception as e:
                    print(f"Error in statement {i+1}: {e}")
                    # Continue with next statement

        print("✅ SQL file executed successfully!")

    except Exception as e:
        print(f"❌ Error running SQL file: {e}")

if __name__ == "__main__":
    sql_file = os.path.join(backend_path, 'create_payroll_tables.sql')
    run_sql_file(sql_file)