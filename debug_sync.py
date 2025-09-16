import sys
sys.path.append('backend')
from supabase_client import supabase

# Test trực tiếp logic sync
print("🔍 Testing sync logic...")

# Tạo test record
test_data = {
    'name_app': 'test_app',
    'user_message': 'test message',
    'bot_response': 'test response',
    'email': 'phannguyendangkhoa0915@gmail.com',
    'conversation_id': 'test_conv_123'
}

result = supabase.table('chat_history').insert(test_data).execute()
print(f"Created test record: {result.data}")

if result.data:
    record_id = result.data[0]['id']
    print(f"Record ID: {record_id}")

    # Kiểm tra user
    user_result = supabase.table('employees').select('*').eq('email', 'phannguyendangkhoa0915@gmail.com').execute()
    if user_result.data:
        user = user_result.data[0]
        print(f"Found user: {user['id']}")

        # Thử insert vào user_chat
        user_chat_data = {
            'email': 'phannguyendangkhoa0915@gmail.com',
            'user_id': user['id'],
            'conversation_id': 'test_conv_123',
            'name_app': 'test_app',
            'app_id': 'test_app'
        }

        try:
            insert_result = supabase.table('user_chat').insert(user_chat_data).execute()
            print(f"✅ Inserted user_chat: {insert_result.data}")
        except Exception as e:
            print(f"❌ Error inserting user_chat: {e}")

        # Update chat_history
        update_result = supabase.table('chat_history').update({'user_id': user['id']}).eq('id', record_id).execute()
        print(f"✅ Updated chat_history: {update_result.data}")

    # Clean up
    supabase.table('chat_history').delete().eq('id', record_id).execute()
    print("🧹 Cleaned up test record")
