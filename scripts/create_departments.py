from supabase_client import supabase
import sys

def create_departments_schema():
    try:
        print("Đang tạo schema cho departments...")

        # Đọc file SQL
        with open('create_departments_schema.sql', 'r', encoding='utf-8') as f:
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

        print("Hoàn thành tạo schema departments!")

        # Kiểm tra kết quả
        print("\nKiểm tra dữ liệu departments hiện tại:")
        result = supabase.table('departments').select('*').order('name').execute()

        for dept in result.data:
            print(f"- ID: {dept['id']}, Name: {dept['name']}, Active: {dept['is_active']}")

    except Exception as e:
        print(f"Lỗi khi tạo schema: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_departments_schema()
