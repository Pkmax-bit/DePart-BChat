import sys
sys.path.append('backend')
from supabase_client import supabase

print("🔄 ĐỒNG BỘ THỰC TẾ - Email Sync Service")
print("=" * 50)

# Kiểm tra records cần sync lại (có user_id nhưng sai format)
result = supabase.table('chat_history').select('log_id, email, user_id').execute()

records_to_sync = []
for record in result.data:
    log_id = record.get('log_id')
    email = record.get('email')
    user_id = record.get('user_id')

    if email and user_id:
        # Kiểm tra user với email này
        user_result = supabase.table('users').select('id').eq('email', email).execute()
        if user_result.data:
            correct_user_id = user_result.data[0]['id']
            if str(user_id) != str(correct_user_id):
                records_to_sync.append({
                    'log_id': log_id,
                    'email': email,
                    'current_user_id': user_id,
                    'correct_user_id': correct_user_id
                })

print(f"📊 Tìm thấy {len(records_to_sync)} records cần sync lại")

if records_to_sync:
    print("\n📋 Chi tiết records cần sync:")
    for record in records_to_sync:
        print(f"  LogID {record['log_id']}: {record['email']} - UserID {record['current_user_id']} → {record['correct_user_id']}")

    # Thực hiện sync
    print("\n🔄 Đang sync lại...")
    synced_count = 0
    for record in records_to_sync:
        try:
            # Update chat_history
            supabase.table('chat_history').update({
                'user_id': record['correct_user_id']
            }).eq('log_id', record['log_id']).execute()

            # Kiểm tra và tạo user_chat record
            user_chat_result = supabase.table('user_chat').select('*').eq('email', record['email']).execute()
            if not user_chat_result.data:
                # Tạo user_chat record
                chat_result = supabase.table('chat_history').select('conversation_id, name_app').eq('log_id', record['log_id']).execute()
                if chat_result.data:
                    chat_record = chat_result.data[0]
                    user_chat_data = {
                        'email': record['email'],
                        'user_id': record['correct_user_id'],
                        'conversation_id': chat_record.get('conversation_id'),
                        'name_app': chat_record.get('name_app'),
                        'app_id': chat_record.get('name_app')
                    }
                    supabase.table('user_chat').insert(user_chat_data).execute()

            synced_count += 1
            print(f"  ✅ Synced LogID {record['log_id']}")

        except Exception as e:
            print(f"  ❌ Error syncing LogID {record['log_id']}: {e}")

    print(f"\n✅ Hoàn thành! Đã sync {synced_count}/{len(records_to_sync)} records")

else:
    print("✅ Không có records nào cần sync lại")

print("\n" + "=" * 50)
print("🎯 Email Sync Service đang chạy và sẽ tự động xử lý records mới")
