import sys
sys.path.append('backend')
from supabase_client import supabase

print("🔍 Kiểm tra dữ liệu trong bảng chat_history...")

# Lấy records gần đây trong chat_history
result = supabase.table('chat_history').select('*').order('created_at', desc=True).limit(10).execute()

print(f"📊 Tổng số records gần đây trong chat_history: {len(result.data) if result.data else 0}")

if result.data:
    print("\n📋 Chi tiết records gần đây:")
    print("-" * 100)
    print(f"{'LogID':<6} {'Email':<25} {'UserID':<10} {'NameApp':<15} {'Created':<20}")
    print("-" * 100)

    for record in result.data:
        log_id = record.get('log_id', 'N/A')
        email = record.get('email', 'N/A')
        user_id = record.get('user_id', 'N/A')
        name_app = record.get('name_app', 'N/A')
        created_at = record.get('created_at', 'N/A')

        # Format created_at
        if created_at and len(created_at) > 19:
            created_at = created_at[:19]

        print(f"{log_id:<6} {str(email)[:24]:<25} {str(user_id)[:9]:<10} {str(name_app)[:14]:<15} {created_at:<20}")

    # Thống kê
    total_records = len(result.data)
    records_with_email = sum(1 for r in result.data if r.get('email'))
    records_with_user_id = sum(1 for r in result.data if r.get('user_id'))
    records_synced = sum(1 for r in result.data if r.get('email') and r.get('user_id'))

    print(f"\n📈 Thống kê:")
    print(f"  Tổng records: {total_records}")
    print(f"  Có email: {records_with_email}")
    print(f"  Có user_id: {records_with_user_id}")
    print(f"  Đã sync: {records_synced}")

else:
    print("❌ Không có dữ liệu trong bảng chat_history")

print("\n" + "="*100)
