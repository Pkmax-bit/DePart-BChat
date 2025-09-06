import sys
sys.path.append('backend')
from supabase_client import supabase

result = supabase.table('chat_history').select('*').order('created_at', desc=True).limit(3).execute()
print('Recent records:')
for r in result.data:
    print(f'ID: {r.get("log_id")}, Email: {r.get("email")}, UserID: {r.get("user_id")}')
