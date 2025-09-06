import sys
sys.path.append('backend')
from supabase_client import supabase

# Kiểm tra records với user_id = null
result = supabase.table('chat_history').select('log_id, email, user_id').is_('user_id', 'null').execute()
print(f'Records with user_id = null: {len(result.data)}')

if result.data:
    for record in result.data:
        print(f'  LogID {record["log_id"]}: Email {record["email"]}')

# Kiểm tra records gần đây
result2 = supabase.table('chat_history').select('log_id, email, user_id').order('created_at', desc=True).limit(3).execute()
print('\nRecent chat_history records:')
for record in result2.data:
    print(f'  LogID {record["log_id"]}: Email {record["email"]}, UserID {record["user_id"]}')
