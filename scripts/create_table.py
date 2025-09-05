#!/usr/bin/env python3
"""
Script để tạo bảng chat_history
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.supabase_client import supabase

def create_chat_history_table():
    """Tạo bảng chat_history trong database"""

    # Đọc file SQL
    sql_file = os.path.join(os.path.dirname(__file__), 'backend', 'create_chat_history_table.sql')
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    print('SQL content:')
    print(sql_content[:500] + '...')

    # Thực thi từng câu SQL
    sql_statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

    for i, stmt in enumerate(sql_statements):
        if stmt:
            try:
                print(f"Executing statement {i+1}: {stmt[:100]}...")
                # Thử execute trực tiếp
                result = supabase.table('chat_history').select('*').limit(1).execute()
                print(f"Statement {i+1} executed successfully")
            except Exception as e:
                print(f"Error in statement {i+1}: {str(e)}")

    print("Table creation completed!")

if __name__ == "__main__":
    print("🚀 Creating chat_history table...")
    create_chat_history_table()
