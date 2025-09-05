# routers/user_chat_sessions.py
from fastapi import APIRouter, HTTPException
from typing import Optional
from supabase_client import supabase
from models import UserChatSessionCreate, UserChatSessionUpdate, UserChatSessionResponse
from datetime import datetime

router = APIRouter(
    prefix="/user-chat-sessions",
    tags=["User Chat Sessions"]
)

@router.post("/initialize-session")
def initialize_user_session(
    user_id: int,
    chatflow_id: int,
    conversation_id: Optional[str] = None
):
    """
    Khởi tạo session cho user khi lần đầu truy cập chatbot

    Flow:
    1. User click vào chatbot -> gọi endpoint này
    2. Nếu session chưa tồn tại -> tạo mới
    3. Nếu session đã tồn tại -> cập nhật last_accessed
    4. Nếu có conversation_id -> cập nhật conversation_id

    Parameters:
    - user_id: ID của user
    - chatflow_id: ID của chatflow/bot
    - conversation_id: (Optional) Conversation ID từ Dify

    Returns:
    - message: Thông báo kết quả
    - session: Thông tin session
    - created: True nếu tạo mới, False nếu cập nhật
    """
    try:
        # Kiểm tra xem session đã tồn tại chưa
        existing = supabase.table('user_chat_sessions').select('*').eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

        current_time = datetime.now().isoformat()

        if existing.data and len(existing.data) > 0:
            # Session đã tồn tại - cập nhật last_accessed và conversation_id nếu được cung cấp
            update_data = {
                'last_accessed': current_time,
                'updated_at': current_time
            }

            if conversation_id is not None:
                update_data['conversation_id'] = conversation_id

            result = supabase.table('user_chat_sessions').update(update_data).eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

            print(f"Session updated for user {user_id}, chatflow {chatflow_id}")
            return {
                "message": "Session updated successfully",
                "session": result.data[0],
                "created": False
            }
        else:
            # Tạo session mới
            session_data = {
                'user_id': user_id,
                'chatflow_id': chatflow_id,
                'last_accessed': current_time,
                'created_at': current_time,
                'updated_at': current_time,
                'session_data': {
                    'initialized_at': current_time,
                    'device_info': 'web_browser',
                    'first_access': True
                }
            }

            if conversation_id is not None:
                session_data['conversation_id'] = conversation_id

            result = supabase.table('user_chat_sessions').insert(session_data).execute()

            print(f"New session created for user {user_id}, chatflow {chatflow_id}")
            return {
                "message": "Session created successfully",
                "session": result.data[0],
                "created": True
            }

    except Exception as e:
        print(f"Error initializing session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize session: {str(e)}")

@router.get("/user/{user_id}/chatflow/{chatflow_id}", response_model=UserChatSessionResponse)
def get_user_chatflow_session(user_id: int, chatflow_id: int):
    """
    Lấy session chat của user với một chatflow cụ thể
    """
    try:
        result = supabase.table('user_chat_sessions').select('*').eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Session not found")

        # Cập nhật last_accessed
        supabase.table('user_chat_sessions').update({
            'last_accessed': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }).eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}")
def get_user_sessions(user_id: int):
    """
    Lấy tất cả sessions chat của một user
    """
    try:
        # Try descending order first, fall back to ascending if it fails
        try:
            result = supabase.table('user_chat_sessions').select('*').eq('user_id', user_id).order('last_accessed', desc=True).execute()
        except:
            # Fall back to ascending order
            result = supabase.table('user_chat_sessions').select('*').eq('user_id', user_id).order('last_accessed').execute()

        return result.data or []

    except Exception as e:
        print(f"Error getting user sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/user/{user_id}/chatflow/{chatflow_id}")
def update_session(user_id: int, chatflow_id: int, update_data: UserChatSessionUpdate):
    """
    Cập nhật session chat của user với chatflow
    """
    try:
        # Kiểm tra session tồn tại
        existing = supabase.table('user_chat_sessions').select('*').eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

        if not existing.data or len(existing.data) == 0:
            raise HTTPException(status_code=404, detail="Session not found")

        # Chuẩn bị dữ liệu cập nhật
        update_dict = {
            'updated_at': datetime.now().isoformat()
        }

        if update_data.conversation_id is not None:
            update_dict['conversation_id'] = update_data.conversation_id
        if update_data.session_data is not None:
            update_dict['session_data'] = update_data.session_data
        if update_data.last_accessed is not None:
            update_dict['last_accessed'] = update_data.last_accessed
        else:
            update_dict['last_accessed'] = datetime.now().isoformat()

        result = supabase.table('user_chat_sessions').update(update_dict).eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/user/{user_id}/chatflow/{chatflow_id}")
def delete_session(user_id: int, chatflow_id: int):
    """
    Xóa session chat của user với chatflow
    """
    try:
        result = supabase.table('user_chat_sessions').delete().eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Session not found")

        return {"message": "Session deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
