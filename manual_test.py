import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.supabase_client import supabase
import time

# Tạo record test không clean up
test_data = {
    'name_app': 'Manual Test',
    'conversation_id': f'manual-test-{int(time.time())}',
    'input_text': 'Manual test message',
    'output_text': 'Manual test response',
    'email': 'phannguyendangkhoa0915@gmail.com'
}

print(f"Creating manual test record with email: {test_data['email']}")
result = supabase.table('chat_history').insert(test_data).execute()

if result.data:
    record = result.data[0]
    log_id = record.get('log_id')
    print(f"Created record with log_id: {log_id}")
    print("Waiting 10 seconds for sync...")
    time.sleep(10)
    
    # Kiểm tra
    updated_result = supabase.table('chat_history').select('*').eq('log_id', log_id).execute()
    if updated_result.data:
        user_id = updated_result.data[0].get('user_id')
        print(f"Chat history user_id: {user_id}")
    
    user_chat_result = supabase.table('user_chat').select('*').eq('email', test_data['email']).execute()
    print(f"User_chat records for this email: {len(user_chat_result.data) if user_chat_result.data else 0}")
    
    print(f"Manual check complete. Record log_id: {log_id}")
