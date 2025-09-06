import sys
sys.path.append('backend')
from supabase_client import supabase
import time

print('Waiting for service to process...')
time.sleep(5)

# Kiểm tra user_chat
result = supabase.table('user_chat').select('*').execute()
print(f'User_chat records: {len(result.data) if result.data else 0}')

# Kiểm tra chat_history đã được update chưa
chat_result = supabase.table('chat_history').select('*').eq('log_id', 149).execute()
if chat_result.data:
    record = chat_result.data[0]
    print(f'Chat history user_id: {record.get("user_id")}')

# Clean up
supabase.table('chat_history').delete().eq('log_id', 149).execute()
print('Cleaned up')
