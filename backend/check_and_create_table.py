# check_and_create_table.py
import sys
import os
sys.path.append(os.path.dirname(__file__))

from supabase_client import supabase

def check_table_exists():
    """Check if user_chat_sessions table exists"""
    try:
        # Try to query the table
        result = supabase.table('user_chat_sessions').select('*').limit(1).execute()
        print("✅ Table exists and is accessible")
        return True
    except Exception as e:
        print(f"❌ Table check failed: {e}")
        return False

def create_table_manually():
    """Create table using raw SQL"""
    try:
        sql = """
        -- Tạo bảng để lưu trữ session state của user với chatflow
        CREATE TABLE IF NOT EXISTS user_chat_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            chatflow_id INTEGER NOT NULL,
            conversation_id VARCHAR(255),
            session_data JSONB,
            last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

            -- Foreign key constraints
            CONSTRAINT fk_user_chat_sessions_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_user_chat_sessions_chatflow
                FOREIGN KEY (chatflow_id) REFERENCES chatflows(id) ON DELETE CASCADE,

            -- Unique constraint để đảm bảo mỗi user chỉ có một session với mỗi chatflow
            CONSTRAINT unique_user_chatflow UNIQUE (user_id, chatflow_id)
        );

        -- Tạo index để tối ưu performance
        CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_user_id ON user_chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_chatflow_id ON user_chat_sessions(chatflow_id);
        CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_last_accessed ON user_chat_sessions(last_accessed);
        """

        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print("✅ Table created successfully via raw SQL")
        return True
    except Exception as e:
        print(f"❌ Failed to create table: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Checking user_chat_sessions table...")

    if check_table_exists():
        print("🎉 Table is ready!")
    else:
        print("📝 Attempting to create table...")
        if create_table_manually():
            print("🎉 Table created and ready!")
        else:
            print("❌ Could not create table. Please check Supabase configuration.")
