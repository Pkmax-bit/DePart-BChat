from supabase_client import supabase
import sys

def update_activity_logs_schema():
    try:
        print("Đang cập nhật schema bảng activity_logs...")

        # Đọc file SQL
        with open('update_activity_logs_schema.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # Chia thành các câu lệnh SQL riêng biệt
        sql_commands = [cmd.strip() for cmd in sql_script.split(';') if cmd.strip() and not cmd.strip().startswith('--')]

        # Thực thi từng câu lệnh
        for i, command in enumerate(sql_commands, 1):
            if command:
                print(f"Thực thi lệnh {i}: {command[:50]}...")
                try:
                    # Sử dụng rpc để thực thi SQL
                    result = supabase.rpc('exec_sql', {'sql': command + ';'})
                    print(f"✓ Lệnh {i} thành công")
                except Exception as e:
                    print(f"⚠ Lệnh {i} thất bại: {e}")
                    # Tiếp tục với lệnh tiếp theo

        print("Hoàn thành cập nhật schema!")

        # Kiểm tra kết quả
        print("\nKiểm tra dữ liệu activity_logs hiện tại:")
        result = supabase.table('activity_logs').select('*').order('access_time', desc=True).limit(5).execute()

        for log in result.data:
            print(f"- ID: {log['id']}, User: {log.get('user_id', 'N/A')}, Action: {log.get('action_type', 'N/A')}, Online: {log.get('online_status', 'N/A')}, Time: {log.get('access_time', 'N/A')}")

    except Exception as e:
        print(f"Lỗi khi cập nhật schema: {e}")
        sys.exit(1)

if __name__ == "__main__":
    update_activity_logs_schema()
