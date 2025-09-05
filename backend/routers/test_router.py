# routers/test_router.py
from fastapi import APIRouter

router = APIRouter(
    prefix="/test",
    tags=["Test"]
)

@router.get("/")
def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Test endpoint working!", "status": "success"}

@router.get("/session-test")
def session_test():
    """Test session management concept"""
    return {
        "concept": "Session Management",
        "description": "Lưu và khôi phục conversation ID cho từng user/chatflow",
        "features": [
            "Mỗi user có session riêng biệt",
            "Conversation được bảo toàn khi đăng xuất/đăng nhập",
            "Không bị lẫn lộn giữa các user khác nhau"
        ],
        "status": "Concept ready, implementation in progress"
    }
