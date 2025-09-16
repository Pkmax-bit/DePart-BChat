import sys
sys.path.append('backend')
from supabase_client import supabase

print("🔍 Kiểm tra dữ liệu users...")

# Lấy tất cả users
result = supabase.table('employees').select('*').execute()

print(f"📊 Tổng số users: {len(result.data) if result.data else 0}")

if result.data:
    print("\n👥 Danh sách users:")
    print("-" * 80)
    print(f"{'ID':<5} {'Full Name':<20} {'Email':<30} {'Role':<8}")
    print("-" * 80)

    for user in result.data:
        user_id = user.get('id', 'N/A')
        full_name = user.get('full_name', 'N/A')
        email = user.get('email', 'N/A')
        role_id = user.get('role_id', 'N/A')

        print(f"{user_id:<5} {str(full_name)[:19]:<20} {str(email)[:29]:<30} {role_id:<8}")

    # Kiểm tra email cụ thể
    print(f"\n🔍 Kiểm tra email phannguyendangkhoa0915@gmail.com:")
    user_result = supabase.table('employees').select('*').eq('email', 'phannguyendangkhoa0915@gmail.com').execute()
    if user_result.data:
        user = user_result.data[0]
        print(f"  ✅ Tìm thấy user: ID {user.get('id')}, Name: {user.get('full_name')}")
    else:
        print("  ❌ Không tìm thấy user với email này")

else:
    print("❌ Không có dữ liệu trong bảng users")

print("\n" + "="*80)
