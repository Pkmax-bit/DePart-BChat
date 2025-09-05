from supabase_client import supabase
import sys

def check_and_fix_schema():
    try:
        print("Kiểm tra schema bảng activity_logs...")

        # Kiểm tra dữ liệu hiện tại
        result = supabase.table('activity_logs').select('*').limit(1).execute()

        if result.data:
            sample_record = result.data[0]
            print(f"Sample record keys: {list(sample_record.keys())}")

            # Kiểm tra các trường mới
            has_action_type = 'action_type' in sample_record
            has_online_status = 'online_status' in sample_record

            print(f"Has action_type: {has_action_type}")
            print(f"Has online_status: {has_online_status}")

            if not has_action_type or not has_online_status:
                print("Cần cập nhật schema database!")
                print("Vui lòng chạy script update_schema.py trước")
                return False
            else:
                print("✅ Schema đã được cập nhật!")
                return True
        else:
            print("Không có dữ liệu trong activity_logs")
            return True

    except Exception as e:
        print(f"Lỗi khi kiểm tra schema: {e}")
        return False

if __name__ == "__main__":
    success = check_and_fix_schema()
    sys.exit(0 if success else 1)
