import sys
sys.path.append('backend')
from supabase_client import supabase

# Kiểm tra records gần đây
result = supabase.table('chat_history').select('*').order('created_at', desc=True).limit(5).execute()
if result.data:
    print('Recent chat_history records:')
    for record in result.data:
        print(f'log_id: {record.get("log_id")}, email: {record.get("email")}, user_id: {record.get("user_id")}')
        if record.get('input_text'):
            print(f'  input_text: {record.get("input_text")[:100]}...')
