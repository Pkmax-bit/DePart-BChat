# routers/chatflows.py
from fastapi import APIRouter, HTTPException, Depends
from supabase_client import supabase
from models import ChatflowCreate, ChatflowUpdate
from dependencies import get_current_admin_user

router = APIRouter(
    prefix="/chatflows",
    tags=["Chatflows"],
    # dependencies=[Depends(get_current_admin_user)]  # Tạm thời bỏ qua
)

@router.post("/", status_code=201)
def create_new_chatflow(chatflow: ChatflowCreate):
    try:
        data, count = supabase.table('chatflows').insert(chatflow.dict()).execute()
        return data[1][0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def list_all_chatflows(department_id: int = None):
    """
    Lấy danh sách tất cả chatflows, có thể filter theo department
    """
    try:
        query = supabase.table('chatflows').select('*').order('id')

        if department_id:
            query = query.eq('department_id', department_id)

        data, count = query.execute()
        return data[1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/employees/{user_id}")
def list_chatflows_for_user(user_id: int):
    """
    Lấy danh sách chatflows cho một user cụ thể.
    Hiện tại trả về tất cả chatflows enabled.
    """
    try:
        # Query chatflows - tạm thời bỏ qua logic department
        query = supabase.table('chatflows').select('*').eq('is_enabled', True).order('id')

        data, count = query.execute()
        return data[1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{chatflow_id}")
def update_a_chatflow(chatflow_id: int, chatflow: ChatflowUpdate):
    try:
        data, count = supabase.table('chatflows').update(chatflow.dict(exclude_unset=True)).eq('id', chatflow_id).execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Chatflow not found")
        return data[1][0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{chatflow_id}", status_code=204)
def delete_a_chatflow(chatflow_id: int):
    try:
        data, count = supabase.table('chatflows').delete().eq('id', chatflow_id).execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Chatflow not found")
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))