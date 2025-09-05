# routers/feedback.py
from fastapi import APIRouter, HTTPException, Depends
from supabase_client import supabase
from models import FeedbackCreate, FeedbackResponse
from dependencies import get_current_user, get_current_user_optional
from typing import Optional

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"],
)

@router.post("/", status_code=201, response_model=FeedbackResponse)
def create_feedback(feedback: FeedbackCreate, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Tạo góp ý mới từ nhân viên.
    """
    try:
        # Lấy user_id từ token (cho admin) hoặc từ body (cho user/manager)
        user_id = None

        if current_user:
            user_id = current_user.get('id') or current_user.get('user_id')
        elif feedback.user_id:
            user_id = feedback.user_id
        else:
            raise HTTPException(status_code=400, detail="Không thể xác định user_id")

        if not user_id:
            raise HTTPException(status_code=400, detail="Không thể xác định user_id")

        feedback_data = {
            "user_id": user_id,
            "subject": feedback.subject,
            "message": feedback.message,
            "category": feedback.category,
            "priority": feedback.priority,
            "status": "pending"
        }

        result = supabase.table('feedback').insert(feedback_data).execute()

        if not result.data:
            raise HTTPException(status_code=400, detail="Không thể tạo feedback")

        return result.data[0]

    except Exception as e:
        print(f"Error creating feedback: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[FeedbackResponse])
def list_all_feedback():
    """
    Lấy danh sách tất cả góp ý (cho admin).
    """
    try:
        # Sử dụng query đơn giản hơn để tránh lỗi join
        result = supabase.table('feedback').select('*').order('created_at', desc=True).execute()

        return result.data
    except Exception as e:
        print(f"Error fetching feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-feedback", response_model=list[FeedbackResponse])
def get_my_feedback(current_user = Depends(get_current_user)):
    """
    Lấy danh sách góp ý của user hiện tại.
    """
    try:
        user_id = current_user.get('id') or current_user.get('user_id')

        if not user_id:
            raise HTTPException(status_code=400, detail="Không thể xác định user_id")

        result = supabase.table('feedback').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()

        return result.data
    except Exception as e:
        print(f"Error fetching user feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{feedback_id}")
def update_feedback_status(feedback_id: int, status_update: dict):
    """
    Cập nhật trạng thái góp ý (cho admin).
    """
    try:
        status = status_update.get('status')
        if not status:
            raise HTTPException(status_code=400, detail="Thiếu trường status")

        valid_statuses = ['pending', 'in_review', 'resolved', 'closed']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Trạng thái không hợp lệ. Các trạng thái hợp lệ: {', '.join(valid_statuses)}")

        result = supabase.table('feedback').update({"status": status}).eq('id', feedback_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Feedback không tìm thấy")

        return {"message": "Cập nhật trạng thái thành công", "feedback": result.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating feedback status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{feedback_id}")
def delete_feedback(feedback_id: int):
    """
    Xóa góp ý (cho admin).
    """
    try:
        result = supabase.table('feedback').delete().eq('id', feedback_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Feedback không tìm thấy")

        return {"message": "Xóa góp ý thành công"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
