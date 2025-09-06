import sys
sys.path.append('backend')
from supabase_client import supabase

# Kiểm tra records chưa sync (user_id is null)
result = supabase.table('chat_history').select('*').is_('user_id', 'null').execute()

print(f'📊 Records chưa sync (user_id = null): {len(result.data) if result.data else 0}')

if result.data:
    print('\n📋 Chi tiết records chưa sync:')
    for record in result.data:
        print(f'  LogID: {record.get("log_id")}, Email: {record.get("email")}, Created: {record.get("created_at")}')
else:
    print('✅ Không có records nào chưa sync')
