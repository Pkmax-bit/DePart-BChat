# routers/departments.py
from fastapi import APIRouter, HTTPException, Depends
from supabase_client import supabase
from models import DepartmentCreate, DepartmentUpdate, DepartmentMemberCreate
from dependencies import get_current_admin_user

router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
    # dependencies=[Depends(get_current_admin_user)]  # Tạm thời bỏ qua
)

@router.post("/", status_code=201)
def create_department(department: DepartmentCreate):
    """
    Tạo phòng ban mới
    """
    try:
        data, count = supabase.table('departments').insert(department.dict()).execute()
        return data[1][0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def list_departments():
    """
    Lấy danh sách tất cả phòng ban
    """
    try:
        data, count = supabase.table('departments').select('*').order('name').execute()
        return data[1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{department_id}")
def get_department(department_id: int):
    """
    Lấy thông tin chi tiết của một phòng ban
    """
    try:
        data, count = supabase.table('departments').select('''
            *,
            department_members(
                id,
                role_in_department,
                joined_at,
                employees(user_id, username, full_name, email)
            )
        ''').eq('id', department_id).execute()

        if not data[1]:
            raise HTTPException(status_code=404, detail="Department not found")

        return data[1][0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{department_id}")
def update_department(department_id: int, department: DepartmentUpdate):
    """
    Cập nhật thông tin phòng ban
    """
    try:
        data, count = supabase.table('departments').update(department.dict(exclude_unset=True)).eq('id', department_id).execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Department not found")
        return data[1][0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{department_id}", status_code=204)
def delete_department(department_id: int):
    """
    Xóa phòng ban
    """
    try:
        data, count = supabase.table('departments').delete().eq('id', department_id).execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Department not found")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{department_id}/members")
def add_department_member(department_id: int, member: DepartmentMemberCreate):
    """
    Thêm thành viên vào phòng ban
    """
    try:
        # Kiểm tra department tồn tại
        dept_check = supabase.table('departments').select('id').eq('id', department_id).execute()
        if not dept_check.data:
            raise HTTPException(status_code=404, detail="Department not found")

        # Kiểm tra user tồn tại
        user_check = supabase.table('employees').select('id').eq('id', member.user_id).execute()
        if not user_check.data:
            raise HTTPException(status_code=404, detail="User not found")

        # Thêm member
        data, count = supabase.table('department_members').insert({
            'department_id': department_id,
            'user_id': member.user_id,
            'role_in_department': member.role_in_department
        }).execute()

        return data[1][0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{department_id}/members/{user_id}", status_code=204)
def remove_department_member(department_id: int, user_id: int):
    """
    Xóa thành viên khỏi phòng ban
    """
    try:
        data, count = supabase.table('department_members').delete().eq('department_id', department_id).eq('user_id', user_id).execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Member not found")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}/department")
def assign_user_to_department(user_id: int, department_id: int = None):
    """
    Gán user vào phòng ban
    """
    try:
        # Kiểm tra user tồn tại
        user_check = supabase.table('employees').select('id').eq('id', user_id).execute()
        if not user_check.data:
            raise HTTPException(status_code=404, detail="User not found")

        # Nếu department_id là null, bỏ user khỏi department
        if department_id is None:
            data, count = supabase.table('employees').update({'department_id': None}).eq('id', user_id).execute()
        else:
            # Kiểm tra department tồn tại
            dept_check = supabase.table('departments').select('id').eq('id', department_id).execute()
            if not dept_check.data:
                raise HTTPException(status_code=404, detail="Department not found")

            data, count = supabase.table('employees').update({'department_id': department_id}).eq('id', user_id).execute()

        if not data[1]:
            raise HTTPException(status_code=404, detail="User not found")

        return data[1][0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
