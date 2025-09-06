import sys
sys.path.append('backend')
from supabase_client import supabase

# Tạo test record trực tiếp
test_data = {
    'name_app': 'Bot tư vấn giải pháp tổng hợp',
    'app_id': 'fa649102-0547-4c53-9961-0d1baf239fa4',
    'conversation_id': 'test_conv_147',
    'input_text': '{"Email":"test@example.com"}',
    'output_text': 'Test message'
}

result = supabase.table('chat_history').insert(test_data).execute()
print(f'Created test record: {result.data}')

if result.data:
    log_id = result.data[0]['log_id']
    print(f'Log ID: {log_id}')
    
    # Đợi một chút để service xử lý
    import time
    time.sleep(3)
    
    # Kiểm tra user_chat
    user_chat_result = supabase.table('user_chat').select('*').execute()
    print(f'User_chat records: {len(user_chat_result.data) if user_chat_result.data else 0}')
    
    # Clean up
    supabase.table('chat_history').delete().eq('log_id', log_id).execute()
    print('Cleaned up test record')
