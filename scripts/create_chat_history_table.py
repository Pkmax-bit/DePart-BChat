#!/usr/bin/env python3
"""
Script để tạo bảng chat_history trong Supabase
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase

def create_chat_history_table():
    """Tạo bảng chat_history trong database"""

    try:
        print("🚀 Bắt đầu tạo bảng chat_history...")

        # Đọc file SQL
        with open('create_chat_history_table.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()

        print("📄 Đã đọc file SQL, đang thực thi...")

        # Chia thành các câu lệnh SQL riêng biệt
        sql_commands = []
        current_command = ""
        in_function = False

        for line in sql_script.split('\n'):
            line = line.strip()
            if not line or line.startswith('--'):
                continue

            # Xử lý function definition
            if line.startswith('CREATE OR REPLACE FUNCTION'):
                in_function = True
            elif line.startswith('$$ language'):
                in_function = False

            current_command += line + '\n'

            # Kết thúc command khi gặp dấu chấm phẩy
            if line.endswith(';') and not in_function:
                sql_commands.append(current_command.strip())
                current_command = ""

        # Thêm command cuối cùng nếu có
        if current_command.strip():
            sql_commands.append(current_command.strip())

        print(f"📋 Tìm thấy {len(sql_commands)} câu lệnh SQL")

        # Thực thi từng câu lệnh
        for i, command in enumerate(sql_commands, 1):
            if command:
                print(f"⚡ Thực thi lệnh {i}/{len(sql_commands)}: {command.split()[0]} {command.split()[1] if len(command.split()) > 1 else ''}...")

                try:
                    # Sử dụng rpc để thực thi SQL trực tiếp
                    result = supabase.rpc('exec_sql', {'sql': command})
                    print(f"✅ Lệnh {i} thành công")
                except Exception as e:
                    print(f"⚠️  Lệnh {i} thất bại: {str(e)}")
                    # Tiếp tục với lệnh tiếp theo thay vì dừng

        print("\n🎉 Hoàn thành tạo bảng chat_history!")

        # Kiểm tra bảng đã được tạo chưa
        print("\n🔍 Kiểm tra bảng chat_history...")
        try:
            result = supabase.table('chat_history').select('*').limit(1).execute()
            print("✅ Bảng chat_history đã được tạo thành công!")
            print(f"📊 Số bản ghi hiện tại: {len(result.data) if result.data else 0}")
        except Exception as e:
            print(f"❌ Lỗi khi kiểm tra bảng: {str(e)}")

    except Exception as e:
        print(f"❌ Lỗi khi tạo bảng chat_history: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    create_chat_history_table()
