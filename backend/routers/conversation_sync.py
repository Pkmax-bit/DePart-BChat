# routers/conversation_sync.py
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import jwt as pyjwt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

router = APIRouter(
    prefix="/conversation-sync",
    tags=["Conversation Sync"]
)

# JWT Secret Key
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    conversation_ids: dict  # {chatflow_id: conversation_id}

class SyncTokenData(BaseModel):
    user_id: int
    conversation_ids: Optional[dict] = None
    exp: Optional[datetime] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Tạo JWT access token với conversation_ids"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = pyjwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    return encoded_jwt

def verify_token(token: str) -> Optional[SyncTokenData]:
    """Xác thực JWT token và trả về dữ liệu"""
    try:
        payload = pyjwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return SyncTokenData(**payload)
    except pyjwt.ExpiredSignatureError:
        return None
    except pyjwt.InvalidTokenError:
        return None

async def get_current_user(request: Request) -> SyncTokenData:
    """Dependency để lấy user hiện tại từ JWT token"""
    authorization = request.headers.get("Authorization")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    token = authorization.split(" ")[1]

    user_data = verify_token(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

    return user_data

@router.post("/login", response_model=TokenResponse)
def login_and_sync_conversations(login_data: LoginRequest):
    """
    Đăng nhập và đồng bộ conversation_ids từ Dify
    """
    try:
        # Xác thực user (giả sử có hàm authenticate_user)
        # Trong thực tế, bạn cần implement authentication logic
        from supabase_client import supabase

        # Tìm user theo username
        user_result = supabase.table('employees').select('id, username, email').eq('username', login_data.username).execute()

        if not user_result.data:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        user = user_result.data[0]
        user_id = user['id']

        # Đồng bộ conversation_ids từ Dify
        from dify_api_service import dify_service

        # Lấy tất cả chatflows
        chatflows_result = supabase.table('chatflows').select('id, name').execute()

        conversation_ids = {}

        if chatflows_result.data:
            for chatflow in chatflows_result.data:
                chatflow_id = chatflow['id']
                conversation_id = dify_service.get_or_create_conversation_id(user_id, chatflow_id)

                if conversation_id:
                    conversation_ids[str(chatflow_id)] = conversation_id

                    # Cập nhật database
                    from routers.user_chat_sessions_direct import create_or_update_session_direct
                    from pydantic import BaseModel

                    class SessionCreate(BaseModel):
                        user_id: int
                        chatflow_id: int
                        conversation_id: Optional[str] = None
                        session_data: Optional[dict] = None

                    session_data = SessionCreate(
                        user_id=user_id,
                        chatflow_id=chatflow_id,
                        conversation_id=conversation_id,
                        session_data={"login_sync": True, "sync_time": datetime.now().isoformat()}
                    )

                    create_or_update_session_direct(session_data)

        # Tạo JWT token với conversation_ids
        token_data = {
            "user_id": user_id,
            "conversation_ids": conversation_ids
        }

        access_token = create_access_token(token_data)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user_id,
            conversation_ids=conversation_ids
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during login sync: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=SyncTokenData)
def get_current_user_info(current_user: SyncTokenData = Depends(get_current_user)):
    """
    Lấy thông tin user hiện tại từ token
    """
    return current_user

@router.post("/refresh-conversations")
def refresh_conversation_ids(current_user: SyncTokenData = Depends(get_current_user)):
    """
    Làm mới conversation_ids trong token
    """
    try:
        user_id = current_user.user_id

        # Đồng bộ lại từ Dify
        from dify_api_service import dify_service
        from supabase_client import supabase

        chatflows_result = supabase.table('chatflows').select('id, name').execute()

        conversation_ids = {}

        if chatflows_result.data:
            for chatflow in chatflows_result.data:
                chatflow_id = chatflow['id']
                conversation_id = dify_service.get_or_create_conversation_id(user_id, chatflow_id)

                if conversation_id:
                    conversation_ids[str(chatflow_id)] = conversation_id

        # Tạo token mới
        token_data = {
            "user_id": user_id,
            "conversation_ids": conversation_ids
        }

        new_token = create_access_token(token_data)

        return {
            "message": "Conversations refreshed",
            "access_token": new_token,
            "conversation_ids": conversation_ids
        }

    except Exception as e:
        print(f"Error refreshing conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
