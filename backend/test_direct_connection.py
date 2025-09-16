# test_direct_connection.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_direct_connection():
    """Test direct database connection"""
    print("🔍 Testing Direct Database Connection")
    print("=" * 50)

    # Get connection details from environment or ask user
    db_host = os.environ.get("SUPABASE_DB_HOST")
    db_name = os.environ.get("SUPABASE_DB_NAME", "postgres")
    db_user = os.environ.get("SUPABASE_DB_USER")
    db_password = os.environ.get("SUPABASE_DB_PASSWORD")
    db_port = os.environ.get("SUPABASE_DB_PORT", "5432")

    if not all([db_host, db_user, db_password]):
        print("❌ Missing database connection details in .env file")
        print("\n📋 Please add these to your .env file:")
        print("SUPABASE_DB_HOST=your-db-host.supabase.co")
        print("SUPABASE_DB_USER=postgres")
        print("SUPABASE_DB_PASSWORD=your-db-password")
        print("SUPABASE_DB_NAME=postgres")
        print("SUPABASE_DB_PORT=5432")
        print("\n🔍 You can find these in Supabase Dashboard > Settings > Database")
        return False

    try:
        print(f"🔌 Connecting to: {db_host}:{db_port}/{db_name}")

        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port
        )

        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Test connection
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Connected successfully!")
        print(f"   PostgreSQL version: {version['version'][:50]}...")

        # Check if user_chat_sessions table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'user_chat_sessions'
            );
        """)

        table_exists = cursor.fetchone()['exists']
        print(f"📊 user_chat_sessions table exists: {table_exists}")

        if not table_exists:
            print("📝 Creating user_chat_sessions table...")

            create_table_sql = """
            CREATE TABLE IF NOT EXISTS user_chat_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                chatflow_id INTEGER NOT NULL,
                conversation_id VARCHAR(255),
                session_data JSONB,
                last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

                CONSTRAINT fk_user_chat_sessions_user
                    FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE,
                CONSTRAINT fk_user_chat_sessions_chatflow
                    FOREIGN KEY (chatflow_id) REFERENCES chatflows(id) ON DELETE CASCADE,
                CONSTRAINT unique_user_chatflow UNIQUE (user_id, chatflow_id)
            );
            """

            cursor.execute(create_table_sql)
            conn.commit()
            print("✅ Table created successfully")

            # Create indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_user_id ON user_chat_sessions(user_id);
                CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_chatflow_id ON user_chat_sessions(chatflow_id);
                CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_last_accessed ON user_chat_sessions(last_accessed);
            """)
            conn.commit()
            print("✅ Indexes created successfully")
        else:
            print("✅ Table already exists")

        # Test basic operations
        print("\n🧪 Testing basic operations...")

        # Insert test data
        cursor.execute("""
            INSERT INTO user_chat_sessions (user_id, chatflow_id, conversation_id, session_data)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, chatflow_id) DO UPDATE SET
                conversation_id = EXCLUDED.conversation_id,
                session_data = EXCLUDED.session_data,
                last_accessed = NOW(),
                updated_at = NOW()
            RETURNING *
        """, (1, 1, "test_conversation_123", '{"test": "data"}'))

        result = cursor.fetchone()
        conn.commit()

        print("✅ Insert/Update operation successful")
        print(f"   Result: conversation_id = {result['conversation_id']}")

        # Query test data
        cursor.execute("""
            SELECT * FROM user_chat_sessions
            WHERE user_id = %s AND chatflow_id = %s
        """, (1, 1))

        query_result = cursor.fetchone()
        print("✅ Query operation successful")
        print(f"   Found session: {query_result['conversation_id']}")

        cursor.close()
        conn.close()

        print("\n🎉 All tests passed! Direct database connection is working.")
        return True

    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_direct_connection()

    if success:
        print("\n🚀 You can now use the direct database connection endpoints:")
        print("   POST /api/v1/user-chat-sessions-direct/")
        print("   GET /api/v1/user-chat-sessions-direct/user/{user_id}/chatflow/{chatflow_id}")
        print("   GET /api/v1/user-chat-sessions-direct/user/{user_id}")
        print("   PUT /api/v1/user-chat-sessions-direct/user/{user_id}/chatflow/{chatflow_id}")
        print("   DELETE /api/v1/user-chat-sessions-direct/user/{user_id}/chatflow/{chatflow_id}")
    else:
        print("\n❌ Please check your database connection details and try again.")
