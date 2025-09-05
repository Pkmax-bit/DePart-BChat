#!/usr/bin/env python3
"""
Script để tạo bảng user_chat_sessions trong database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import supabase

def create_user_chat_sessions_table():
    """
    Tạo bảng user_chat_sessions để lưu trữ session state của user với chatflow
    """
    try:
        # SQL để tạo bảng
        create_table_sql = '''
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
        '''

        # Tạo index để tối ưu performance
        create_indexes_sql = '''
        CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_user_id ON user_chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_chatflow_id ON user_chat_sessions(chatflow_id);
        CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_last_accessed ON user_chat_sessions(last_accessed);
        '''

        print("Creating user_chat_sessions table...")

        # Thực thi SQL tạo bảng
        result = supabase.rpc('exec_sql', {'sql': create_table_sql})
        print("✓ Table created successfully")

        # Thực thi SQL tạo index
        result = supabase.rpc('exec_sql', {'sql': create_indexes_sql})
        print("✓ Indexes created successfully")

        print("\n🎉 user_chat_sessions table setup completed!")
        print("\nTable structure:")
        print("- id: Primary key")
        print("- user_id: Foreign key to users table")
        print("- chatflow_id: Foreign key to chatflows table")
        print("- conversation_id: ID của cuộc hội thoại (từ Dify)")
        print("- session_data: Dữ liệu session bổ sung (JSON)")
        print("- last_accessed: Thời gian truy cập cuối cùng")
        print("- created_at: Thời gian tạo")
        print("- updated_at: Thời gian cập nhật cuối cùng")

    except Exception as e:
        print(f"❌ Error creating table: {str(e)}")
        return False

    return True

if __name__ == "__main__":
    print("🚀 Setting up user_chat_sessions table...")
    success = create_user_chat_sessions_table()
    if success:
        print("\n✅ Setup completed successfully!")
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)
