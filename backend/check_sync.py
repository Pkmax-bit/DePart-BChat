from supabase_client import supabase

# Check chatflows
chatflows = supabase.table('chatflows').select('*').execute()
print('Chatflows in database:')
for chatflow in chatflows.data:
    print(f'ID: {chatflow["id"]}, Name: {chatflow["name"]}')

# Check user sessions for user 8
sessions = supabase.table('user_chat_sessions').select('*').eq('user_id', 8).execute()
print('\nUser sessions for user 8:')
for session in sessions.data:
    print(f'ID: {session["id"]}, Chatflow: {session["chatflow_id"]}, Conversation: {session["conversation_id"]}')
