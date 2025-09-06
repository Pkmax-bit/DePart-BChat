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

@router.get("/email/{email}")
def get_user_chat_by_email(email: str):
    """
    Lấy user_chat records theo email
    """
    try:
        result = supabase.table('user_chat').select('*').eq('email', email).order('created_at', desc=True).execute()

        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
