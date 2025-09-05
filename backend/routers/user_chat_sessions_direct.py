# routers/user_chat_sessions_direct.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

router = APIRouter(
    prefix="/user-chat-sessions-direct",
    tags=["User Chat Sessions Direct"]
)

# Pydantic models
class UserChatSessionCreate(BaseModel):
    user_id: int
    chatflow_id: int
    conversation_id: str = None
    session_data: dict = None

class UserChatSessionUpdate(BaseModel):
    conversation_id: str = None
    session_data: dict = None
    last_accessed: str = None

class UserChatSessionResponse(BaseModel):
    id: int
    user_id: int
    chatflow_id: int
    conversation_id: str = None
    session_data: dict = None
    last_accessed: str
    created_at: str
    updated_at: str

def get_db_connection():
    """Get direct database connection"""
    try:
        conn = psycopg2.connect(
            host=os.environ.get("SUPABASE_DB_HOST"),
            database=os.environ.get("SUPABASE_DB_NAME", "postgres"),
            user=os.environ.get("SUPABASE_DB_USER"),
            password=os.environ.get("SUPABASE_DB_PASSWORD"),
            port=os.environ.get("SUPABASE_DB_PORT", "5432")
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

@router.post("/", response_model=UserChatSessionResponse)
def create_or_update_session_direct(session: UserChatSessionCreate):
    """
    Tạo mới hoặc cập nhật session chat của user với chatflow (direct DB connection)
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Kiểm tra xem session đã tồn tại chưa
        cursor.execute("""
            SELECT * FROM user_chat_sessions
            WHERE user_id = %s AND chatflow_id = %s
        """, (session.user_id, session.chatflow_id))

        existing = cursor.fetchone()

        now = datetime.now()

        if existing:
            # Cập nhật session hiện có
            update_data = {'updated_at': now}

            if session.conversation_id is not None:
                update_data['conversation_id'] = session.conversation_id
            if session.session_data is not None:
                update_data['session_data'] = json.dumps(session.session_data)

            update_data['last_accessed'] = now

            # Build dynamic update query
            set_parts = []
            values = []
            for key, value in update_data.items():
                set_parts.append(f"{key} = %s")
                values.append(value)

            values.extend([session.user_id, session.chatflow_id])

            query = f"""
                UPDATE user_chat_sessions
                SET {', '.join(set_parts)}
                WHERE user_id = %s AND chatflow_id = %s
                RETURNING *
            """

            cursor.execute(query, values)
        else:
            # Tạo session mới
            session_data = {
                'user_id': session.user_id,
                'chatflow_id': session.chatflow_id,
                'last_accessed': now,
                'created_at': now,
                'updated_at': now
            }

            if session.conversation_id is not None:
                session_data['conversation_id'] = session.conversation_id
            if session.session_data is not None:
                session_data['session_data'] = json.dumps(session.session_data)

            columns = ', '.join(session_data.keys())
            placeholders = ', '.join(['%s'] * len(session_data))
            values = list(session_data.values())

            query = f"""
                INSERT INTO user_chat_sessions ({columns})
                VALUES ({placeholders})
                RETURNING *
            """

            cursor.execute(query, values)

        result = cursor.fetchone()
        conn.commit()

        # Convert to response format
        response_data = dict(result)
        if response_data.get('session_data'):
            response_data['session_data'] = json.loads(response_data['session_data'])

        return response_data

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error creating/updating session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.get("/user/{user_id}/chatflow/{chatflow_id}", response_model=UserChatSessionResponse)
def get_user_chatflow_session_direct(user_id: int, chatflow_id: int):
    """
    Lấy session chat của user với một chatflow cụ thể (direct DB connection)
    Tự động đồng bộ conversation_id từ Dify nếu chưa có
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Lấy session
        cursor.execute("""
            SELECT * FROM user_chat_sessions
            WHERE user_id = %s AND chatflow_id = %s
        """, (user_id, chatflow_id))

        result = cursor.fetchone()

        now = datetime.now()

        if result:
            # Kiểm tra xem có conversation_id không
            if not result.get('conversation_id'):
                # Tự động đồng bộ từ Dify
                from dify_api_service import dify_service
                conversation_id = dify_service.get_or_create_conversation_id(user_id, chatflow_id)

                if conversation_id:
                    # Cập nhật conversation_id
                    cursor.execute("""
                        UPDATE user_chat_sessions
                        SET conversation_id = %s, updated_at = %s, last_accessed = %s
                        WHERE user_id = %s AND chatflow_id = %s
                        RETURNING *
                    """, (conversation_id, now, now, user_id, chatflow_id))

                    result = cursor.fetchone()
                    conn.commit()
                    print(f"Auto-synced conversation_id: {conversation_id} for user {user_id}, chatflow {chatflow_id}")

            # Cập nhật last_accessed
            cursor.execute("""
                UPDATE user_chat_sessions
                SET last_accessed = %s, updated_at = %s
                WHERE user_id = %s AND chatflow_id = %s
            """, (now, now, user_id, chatflow_id))

            conn.commit()
        else:
            # Nếu không có session, thử tạo mới với conversation_id từ Dify
            from dify_api_service import dify_service
            conversation_id = dify_service.get_or_create_conversation_id(user_id, chatflow_id)

            if conversation_id:
                # Tạo session mới
                cursor.execute("""
                    INSERT INTO user_chat_sessions (user_id, chatflow_id, conversation_id, last_accessed, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING *
                """, (user_id, chatflow_id, conversation_id, now, now, now))

                result = cursor.fetchone()
                conn.commit()
                print(f"Auto-created session with conversation_id: {conversation_id} for user {user_id}, chatflow {chatflow_id}")
            else:
                raise HTTPException(status_code=404, detail="Session not found and no conversation available in Dify")

        # Convert to response format
        response_data = dict(result)
        if response_data.get('session_data'):
            response_data['session_data'] = json.loads(response_data['session_data'])

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error getting session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.get("/user/{user_id}", response_model=list[UserChatSessionResponse])
def get_user_sessions_direct(user_id: int):
    """
    Lấy tất cả sessions chat của một user (direct DB connection)
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT * FROM user_chat_sessions
            WHERE user_id = %s
            ORDER BY last_accessed DESC
        """, (user_id,))

        results = cursor.fetchall()

        # Convert to response format
        response_data = []
        for result in results:
            data = dict(result)
            if data.get('session_data'):
                data['session_data'] = json.loads(data['session_data'])
            response_data.append(data)

        return response_data

    except Exception as e:
        print(f"Error getting user sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.put("/user/{user_id}/chatflow/{chatflow_id}")
def update_session_direct(user_id: int, chatflow_id: int, update_data: UserChatSessionUpdate):
    """
    Cập nhật session chat của user với chatflow (direct DB connection)
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Kiểm tra session tồn tại
        cursor.execute("""
            SELECT * FROM user_chat_sessions
            WHERE user_id = %s AND chatflow_id = %s
        """, (user_id, chatflow_id))

        existing = cursor.fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Session not found")

        # Chuẩn bị dữ liệu cập nhật
        update_dict = {'updated_at': datetime.now()}

        if update_data.conversation_id is not None:
            update_dict['conversation_id'] = update_data.conversation_id
        if update_data.session_data is not None:
            update_dict['session_data'] = json.dumps(update_data.session_data)
        if update_data.last_accessed is not None:
            update_dict['last_accessed'] = update_data.last_accessed
        else:
            update_dict['last_accessed'] = datetime.now()

        # Build dynamic update query
        set_parts = []
        values = []
        for key, value in update_dict.items():
            set_parts.append(f"{key} = %s")
            values.append(value)

        values.extend([user_id, chatflow_id])

        query = f"""
            UPDATE user_chat_sessions
            SET {', '.join(set_parts)}
            WHERE user_id = %s AND chatflow_id = %s
            RETURNING *
        """

        cursor.execute(query, values)
        result = cursor.fetchone()
        conn.commit()

        # Convert to response format
        response_data = dict(result)
        if response_data.get('session_data'):
            response_data['session_data'] = json.loads(response_data['session_data'])

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error updating session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.delete("/user/{user_id}/chatflow/{chatflow_id}")
def delete_session_direct(user_id: int, chatflow_id: int):
    """
    Xóa session chat của user với chatflow (direct DB connection)
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            DELETE FROM user_chat_sessions
            WHERE user_id = %s AND chatflow_id = %s
            RETURNING *
        """, (user_id, chatflow_id))

        result = cursor.fetchone()
        conn.commit()

        if not result:
            raise HTTPException(status_code=404, detail="Session not found")

        return {"message": "Session deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error deleting session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.post("/sync-conversation/{user_id}/{chatflow_id}")
def sync_conversation_id(user_id: int, chatflow_id: int):
    """
    Đồng bộ conversation_id từ Dify cho user và chatflow cụ thể
    Nếu không có từ Dify, tạo conversation_id local
    """
    try:
        from dify_api_service import dify_service

        # Lấy conversation_id từ Dify
        dify_conversation_id = dify_service.get_or_create_conversation_id(user_id, chatflow_id)
        is_from_dify = bool(dify_conversation_id)

        if not dify_conversation_id:
            # Nếu không có từ Dify, tạo conversation_id local
            dify_conversation_id = f"conv_{user_id}_{chatflow_id}_{int(datetime.now().timestamp())}"
            print(f"Created local conversation_id: {dify_conversation_id}")

        # Cập nhật hoặc tạo session trong database
        session_data = UserChatSessionCreate(
            user_id=user_id,
            chatflow_id=chatflow_id,
            conversation_id=dify_conversation_id,
            session_data={
                "synced_from_dify": True,
                "sync_time": datetime.now().isoformat(),
                "is_local_conversation": not is_from_dify
            }
        )

        result = create_or_update_session_direct(session_data)
        return {
            "message": "Conversation ID synced successfully",
            "conversation_id": dify_conversation_id,
            "session": result,
            "source": "dify" if is_from_dify else "local"
        }

    except Exception as e:
        print(f"Error syncing conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sync-all/{user_id}")
def sync_all_conversations(user_id: int):
    """
    Đồng bộ tất cả conversation_id từ Dify cho một user
    """
    try:
        from dify_api_service import dify_service
        from supabase_client import supabase

        # Lấy tất cả chatflows của user
        chatflows_result = supabase.table('chatflows').select('id, name').execute()

        if not chatflows_result.data:
            return {"message": "No chatflows found", "synced_sessions": []}

        synced_sessions = []

        for chatflow in chatflows_result.data:
            chatflow_id = chatflow['id']
            chatflow_name = chatflow['name']

            # Sync conversation cho từng chatflow
            conversation_id = dify_service.get_or_create_conversation_id(user_id, chatflow_id)

            if conversation_id:
                session_data = UserChatSessionCreate(
                    user_id=user_id,
                    chatflow_id=chatflow_id,
                    conversation_id=conversation_id,
                    session_data={
                        "synced_from_dify": True,
                        "sync_time": datetime.now().isoformat(),
                        "chatflow_name": chatflow_name
                    }
                )

                result = create_or_update_session_direct(session_data)
                synced_sessions.append({
                    "chatflow_id": chatflow_id,
                    "chatflow_name": chatflow_name,
                    "conversation_id": conversation_id,
                    "session_id": result.id if hasattr(result, 'id') else result.get('id')
                })

        return {
            "message": f"Synced {len(synced_sessions)} conversations",
            "synced_sessions": synced_sessions
        }

    except Exception as e:
        print(f"Error syncing all conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
