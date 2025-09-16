import sys
sys.path.append('backend')
from supabase_client import supabase

print('🔍 Kiểm tra user_id mapping giữa Dify và User thực tế:')
print('=' * 60)

# Lấy records từ chat_history
chat_result = supabase.table('chat_history').select('log_id, email, user_id').limit(5).execute()

for chat_record in chat_result.data:
    log_id = chat_record.get('log_id')
    email = chat_record.get('email')
    chat_user_id = chat_record.get('user_id')

    # Tìm user thực tế
    user_result = supabase.table('employees').select('id, full_name').eq('email', email).execute()
    if user_result.data:
        real_user = user_result.data[0]
        real_user_id = real_user['id']
        real_name = real_user['full_name']

        # Kiểm tra user_chat
        user_chat_result = supabase.table('user_chat').select('id, user_id').eq('email', email).execute()

        print(f'LogID {log_id}:')
        print(f'  Email: {email}')
        print(f'  Chat UserID (Dify): {chat_user_id}')
        print(f'  Real UserID: {real_user_id} ({real_name})')
        print(f'  UserChat records: {len(user_chat_result.data) if user_chat_result.data else 0}')
        if user_chat_result.data:
            for uc in user_chat_result.data:
                print(f'    UserChat ID {uc["id"]}: UserID {uc["user_id"]}')
        print()

print('✅ Mapping check completed!')
