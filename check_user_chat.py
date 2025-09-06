import sys
sys.path.append('backend')
from supabase_client import supabase

# Kiểm tra user_chat sau test
result = supabase.table('user_chat').select('*').execute()
print(f'📊 User_chat records: {len(result.data) if result.data else 0}')
if result.data:
    for record in result.data:
        print(f'ID: {record.get("id")}, Email: {record.get("email")}, UserID: {record.get("user_id")}, Conversation: {record.get("conversation_id")}')

# Kiểm tra user_chat cho email cụ thể
result3 = supabase.table('user_chat').select('*').eq('email', 'phannguyendangkhoa0915@gmail.com').execute()
print(f'User_chat records for phannguyendangkhoa0915@gmail.com: {len(result3.data) if result3.data else 0}')
if result3.data:
    for record in result3.data:
        print(f'ID: {record.get("id")}, UserID: {record.get("user_id")}, Conversation: {record.get("conversation_id")}')
