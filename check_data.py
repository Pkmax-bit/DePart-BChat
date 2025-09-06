import sys
sys.path.append('./backend')
from supabase_client import supabase

# Kiểm tra user_chat table
print('=== USER_CHAT TABLE ===')
result = supabase.table('user_chat').select('*').execute()
for record in result.data:
    print(f'User ID: {record["user_id"]}, Email: {record["email"]}, Conversation: {record["conversation_id"]}')

# Kiểm tra chat_history table
print('\n=== CHAT_HISTORY TABLE ===')
result2 = supabase.table('chat_history').select('*').limit(10).execute()
for record in result2.data:
    print(f'Log ID: {record["log_id"]}, Conversation: {record["conversation_id"]}')
    print(f'Input: {record["input_text"][:50] if record["input_text"] else "None"}')
    print(f'Output: {record["output_text"][:50] if record["output_text"] else "None"}')
    print('---')
