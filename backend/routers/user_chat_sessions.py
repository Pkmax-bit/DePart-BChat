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

@router.post("/first-chat/{user_id}/{chatflow_id}")
def handle_first_chat(user_id: int, chatflow_id: int):
    """
    Xử lý khi user lần đầu chat với chatflow
    Lấy conversation_id từ chat_history nếu có, hoặc tạo mới nếu chưa có
    """
    try:
        # Kiểm tra xem session đã tồn tại chưa
        existing = supabase.table('user_chat_sessions').select('*').eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

        current_time = datetime.now().isoformat()

        if existing.data and len(existing.data) > 0:
            # Session đã tồn tại - kiểm tra xem có conversation_id chưa
            session = existing.data[0]
            if session.get('conversation_id'):
                # Đã có conversation_id - không cần làm gì
                print(f"Session already has conversation_id for user {user_id}, chatflow {chatflow_id}")
                return {
                    "message": "Session already exists with conversation_id",
                    "conversation_id": session['conversation_id'],
                    "session": session
                }
            else:
                # Session tồn tại nhưng chưa có conversation_id
                # Tìm conversation_id từ chat_history
                conversation_id = get_conversation_id_from_chat_history(user_id, chatflow_id)

                if conversation_id:
                    # Cập nhật session với conversation_id từ chat_history
                    # Merge với session_data hiện có
                    existing_session_data = session.get('session_data', {})

                    update_data = {
                        'conversation_id': conversation_id,
                        'last_accessed': current_time,
                        'updated_at': current_time,
                        'session_data': {
                            **existing_session_data,  # Keep existing data
                            'first_chat_time': current_time,
                            'is_first_chat': True,
                            'conversation_source': 'chat_history'
                        }
                    }

                    result = supabase.table('user_chat_sessions').update(update_data).eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

                    print(f"Updated existing session with conversation_id from chat_history for user {user_id}, chatflow {chatflow_id}: {conversation_id}")

                    return {
                        "message": "Session updated with conversation_id from chat_history successfully",
                        "conversation_id": conversation_id,
                        "session": result.data[0] if result.data else None
                    }
                else:
                    # Không tìm thấy conversation_id trong chat_history - tạo mới
                    conversation_id = f"conv_{user_id}_{chatflow_id}_{int(datetime.now().timestamp())}"

                    # Merge với session_data hiện có
                    existing_session_data = session.get('session_data', {})

                    update_data = {
                        'conversation_id': conversation_id,
                        'last_accessed': current_time,
                        'updated_at': current_time,
                        'session_data': {
                            **existing_session_data,  # Keep existing data
                            'first_chat_time': current_time,
                            'is_first_chat': True,
                            'conversation_source': 'local'
                        }
                    }

                    result = supabase.table('user_chat_sessions').update(update_data).eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

                    print(f"Updated existing session with new conversation_id for user {user_id}, chatflow {chatflow_id}: {conversation_id}")

                    return {
                        "message": "Session updated with new conversation_id successfully",
                        "conversation_id": conversation_id,
                        "session": result.data[0] if result.data else None
                    }
        else:
            # Tạo session mới
            # Tìm conversation_id từ chat_history trước
            existing_conversation_id = get_conversation_id_from_chat_history(user_id, chatflow_id)

            if existing_conversation_id:
                # Sử dụng conversation_id từ chat_history
                conversation_id = existing_conversation_id
                source = 'chat_history'
            else:
                # Không tìm thấy trong chat_history - tạo mới
                conversation_id = f"conv_{user_id}_{chatflow_id}_{int(datetime.now().timestamp())}"
                source = 'local'

            session_data = {
                'user_id': user_id,
                'chatflow_id': chatflow_id,
                'conversation_id': conversation_id,
                'last_accessed': current_time,
                'created_at': current_time,
                'updated_at': current_time,
                'session_data': {
                    'first_chat_time': current_time,
                    'is_first_chat': True,
                    'conversation_source': source
                }
            }

            result = supabase.table('user_chat_sessions').insert(session_data).execute()

            print(f"First chat session created for user {user_id}, chatflow {chatflow_id}: {conversation_id} (source: {source})")

            return {
                "message": "First chat session created successfully",
                "conversation_id": conversation_id,
                "session": result.data[0] if result.data else None
            }

    except Exception as e:
        print(f"Error creating first chat session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create first chat session: {str(e)}")

@router.get("/admin/all-users")
def get_all_users_chat_history(limit: int = 100):
    """
    Lấy tất cả lịch sử chat của tất cả users (cho admin)
    """
    try:
        # Lấy tất cả user chat sessions với thông tin user và chatflow
        result = supabase.table('user_chat_sessions').select('''
            *,
            users!fk_user(id, username, full_name, email),
            chatflows!fk_chatflow(id, name, description)
        ''').order('last_accessed', desc=True).limit(limit).execute()

        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        # Group by user
        users_data = {}
        for record in records:
            user_id = record.get('user_id')
            if not user_id:
                continue
                
            if user_id not in users_data:
                users_data[user_id] = {
                    'user': record.get('users', {}),
                    'sessions': []
                }
            
            users_data[user_id]['sessions'].append({
                'session': record,
                'chatflow': record.get('chatflows', {})
            })

        return {
            'total_users': len(users_data),
            'total_sessions': len(records),
            'users': list(users_data.values())
        }

    except Exception as e:
        print(f"Error getting all users chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_conversation_id_from_chat_history(user_id: int, chatflow_id: int) -> Optional[str]:
    """
    Lấy conversation_id từ chat_history cho user và chatflow cụ thể
    """
    try:
        # Lấy tên chatflow từ chatflow_id
        chatflow_result = supabase.table('chatflows').select('name').eq('id', chatflow_id).execute()
        if not chatflow_result.data or len(chatflow_result.data) == 0:
            return None

        chatflow_name = chatflow_result.data[0]['name']

        # Tìm conversation_id từ chat_history
        chat_history_result = supabase.table('chat_history').select('conversation_id').eq('user_id', user_id).eq('name_app', chatflow_name).execute()

        if chat_history_result.data and len(chat_history_result.data) > 0:
            # Lấy conversation_id từ record đầu tiên (mới nhất)
            conversation_id = chat_history_result.data[0]['conversation_id']
            if conversation_id:
                print(f"Found conversation_id from chat_history: {conversation_id}")
                return conversation_id

        return None

    except Exception as e:
        print(f"Error getting conversation_id from chat_history: {str(e)}")
        return None
