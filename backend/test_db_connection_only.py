# test_db_connection_only.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

def test_db_connection_only():
    """Test only database connection without FastAPI"""
    print("🔍 Testing Database Connection Only")
    print("=" * 40)

    # Get connection details from environment
    db_host = os.environ.get("SUPABASE_DB_HOST")
    db_name = os.environ.get("SUPABASE_DB_NAME", "postgres")
    db_user = os.environ.get("SUPABASE_DB_USER")
    db_password = os.environ.get("SUPABASE_DB_PASSWORD")
    db_port = os.environ.get("SUPABASE_DB_PORT", "5432")

    print(f"Host: {db_host}")
    print(f"User: {db_user}")
    print(f"Database: {db_name}")
    print(f"Port: {db_port}")
    print(f"Password: {'*' * len(db_password) if db_password else 'None'}")

    if not all([db_host, db_user, db_password]):
        print("❌ Missing database connection details")
        return False

    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port
        )

        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Test basic query
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

        if table_exists:
            # Test basic operations
            print("🧪 Testing basic operations...")

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
            """, (8, 1, "test_db_only_123", '{"test": "db_only"}'))

            result = cursor.fetchone()
            conn.commit()

            print("✅ Insert/Update operation successful")
            print(f"   Result ID: {result['id']}")
            print(f"   Conversation ID: {result['conversation_id']}")

            # Query test data
            cursor.execute("""
                SELECT * FROM user_chat_sessions
                WHERE user_id = %s AND chatflow_id = %s
            """, (8, 1))

            query_result = cursor.fetchone()
            print("✅ Query operation successful")
            print(f"   Found session: {query_result['conversation_id']}")

        cursor.close()
        conn.close()

        print("\n🎉 Database connection test passed!")
        return True

    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_db_connection_only()
    if success:
        print("\n🚀 Database is ready for API endpoints!")
    else:
        print("\n❌ Database connection issues need to be resolved.")
