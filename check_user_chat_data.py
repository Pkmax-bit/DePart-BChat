import sys
sys.path.append('backend')
from supabase_client import supabase

print("🔍 Kiểm tra dữ liệu trong bảng user_chat...")

# Lấy tất cả records trong user_chat
result = supabase.table('user_chat').select('*').execute()

print(f"📊 Tổng số records trong user_chat: {len(result.data) if result.data else 0}")

if result.data:
    print("\n📋 Chi tiết records:")
    print("-" * 80)
    print(f"{'ID':<5} {'Email':<30} {'UserID':<8} {'Conversation':<20} {'Created':<20}")
    print("-" * 80)

    for record in result.data:
        record_id = record.get('id', 'N/A')
        email = record.get('email', 'N/A')
        user_id = record.get('user_id', 'N/A')
        conversation_id = record.get('conversation_id', 'N/A')
        created_at = record.get('created_at', 'N/A')

        # Format created_at
        if created_at and len(created_at) > 19:
            created_at = created_at[:19]

        print(f"{record_id:<5} {email[:29]:<30} {user_id:<8} {str(conversation_id)[:19]:<20} {created_at:<20}")
else:
    print("❌ Không có dữ liệu trong bảng user_chat")

print("\n" + "="*80)

# Kiểm tra thêm thông tin về users liên quan
if result.data:
    print("\n👥 Thông tin users liên quan:")
    user_ids = list(set(record.get('user_id') for record in result.data if record.get('user_id')))
    for user_id in user_ids:
        if user_id:
            user_result = supabase.table('users').select('id, full_name, email').eq('id', user_id).execute()
            if user_result.data:
                user = user_result.data[0]
                print(f"  User ID {user_id}: {user.get('full_name')} ({user.get('email')})")
            else:
                print(f"  User ID {user_id}: Không tìm thấy thông tin user")
