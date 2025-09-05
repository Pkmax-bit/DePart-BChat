from supabase_client import supabase
import sys

def add_columns_manually():
    try:
        print("Thêm cột action_type và online_status thủ công...")

        # Thêm cột action_type
        try:
            result = supabase.rpc('exec_sql', {
                'sql': '''
                ALTER TABLE activity_logs
                ADD COLUMN IF NOT EXISTS action_type VARCHAR(50) DEFAULT 'access'
                '''
            })
            print("✅ Đã thêm cột action_type")
        except Exception as e:
            print(f"⚠ Không thể thêm cột action_type: {e}")

        # Thêm cột online_status
        try:
            result = supabase.rpc('exec_sql', {
                'sql': '''
                ALTER TABLE activity_logs
                ADD COLUMN IF NOT EXISTS online_status BOOLEAN
                '''
            })
            print("✅ Đã thêm cột online_status")
        except Exception as e:
            print(f"⚠ Không thể thêm cột online_status: {e}")

        # Cập nhật dữ liệu cũ
        try:
            result = supabase.rpc('exec_sql', {
                'sql': '''
                UPDATE activity_logs
                SET action_type = CASE
                  WHEN chatflow_id = 0 THEN 'login'
                  ELSE 'access'
                END
                WHERE action_type IS NULL OR action_type = ''
                '''
            })
            print("✅ Đã cập nhật dữ liệu cũ")
        except Exception as e:
            print(f"⚠ Không thể cập nhật dữ liệu cũ: {e}")

        print("Hoàn thành!")

    except Exception as e:
        print(f"Lỗi: {e}")
        sys.exit(1)

if __name__ == "__main__":
    add_columns_manually()
