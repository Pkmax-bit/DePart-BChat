# routers/user_chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
from models import UserChatCreate, UserChatResponse
from typing import Optional

router = APIRouter(
    prefix="/user-chat",
    tags=["User Chat"]
)

@router.post("/", status_code=201)
def create_user_chat(user_chat: UserChatCreate):
    """
    Tạo một bản ghi user_chat mới
    """
    try:
        data, count = supabase.table('user_chat').insert(user_chat.dict()).execute()
        return data[1][0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_all_user_chat(limit: int = 100):
    """
    Lấy tất cả user_chat records
    """
    try:
        result = supabase.table('user_chat').select('*').order('created_at', desc=True).limit(limit).execute()

        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}")
def get_user_chat_by_user(user_id: int):
    """
    Lấy user_chat records của một user cụ thể
    """
    try:
        result = supabase.table('user_chat').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()

        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/all-users")
def get_all_users_chat_history():
    """
    Lấy lịch sử chat của tất cả users cho admin (bao gồm thông tin user)
    """
    try:
        # Lấy tất cả user_chat records
        result = supabase.table('user_chat').select('*').order('created_at', desc=True).execute()

        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        # Group by user_id và enrich với thông tin user
        user_groups = {}
        for record in records:
            user_id = record['user_id']
            if user_id not in user_groups:
                # Lấy thông tin user
                user_result = supabase.table('employees').select('*').eq('id', user_id).execute()
                user_info = user_result.data[0] if user_result.data else None

                user_groups[user_id] = {
                    'user': user_info,
                    'conversations': []
                }

            # Thêm conversation vào group
            user_groups[user_id]['conversations'].append({
                'conversation_id': record['conversation_id'],
                'name_app': record['name_app'],
                'app_id': record['app_id'],
                'email': record['email'],
                'created_at': record['created_at']
            })

        # Convert to list format
        result_list = []
        for user_id, data in user_groups.items():
            result_list.append({
                'user': data['user'],
                'conversations': data['conversations']
            })

        return {'users': result_list}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
