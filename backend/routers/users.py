# routers/users.py
from fastapi import APIRouter, HTTPException, Depends
from supabase_client import supabase, SUPABASE_AVAILABLE
from models import UserCreate, ActivityLogCreate
from dependencies import get_current_admin_user
from pydantic import BaseModel, EmailStr
import hashlib
import bcrypt
from fastapi import UploadFile, File
import pandas as pd
import io
import random
import string
import time
from email_utils import send_verification_code
from typing import Optional

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    # dependencies=[Depends(get_current_admin_user)]  # Tạm thời bỏ qua
)

# Model cho login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Models for password reset
class SendCodeRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

# In-memory store for verification codes (use database table in production)
verification_codes = {}

@router.post("/auth/login")
def login_user(login: LoginRequest):
    """
    Đăng nhập user bằng cách kiểm tra bảng users
    """
    try:
        print(f"Login attempt for: {login.email}")

        if not SUPABASE_AVAILABLE or supabase is None:
            raise HTTPException(status_code=503, detail="Database service unavailable")

        # Tìm user trong bảng employees
        result = supabase.table('employees').select('*').eq('email', login.email).execute()

        if not result.data or len(result.data) == 0:
            print(f"User not found: {login.email}")
            raise HTTPException(status_code=401, detail="Email không tồn tại")

        user = result.data[0]
        print(f"User found: {user}")
        print(f"User keys: {list(user.keys())}")
        print(f"User id: {user.get('id')}")

        # Verify password using bcrypt
        try:
            password_valid = bcrypt.checkpw(login.password.encode('utf-8'), user['hashed_password'].encode('utf-8'))
            print(f"Password verification for {login.email}: {'valid' if password_valid else 'invalid'}")
        except Exception as e:
            print(f"Password verification error for {login.email}: {e}")
            print(f"Stored hash: {user['hashed_password'][:20]}...")
            raise HTTPException(status_code=401, detail="Mật khẩu không đúng")

        if not password_valid:
            print(f"Invalid password for {login.email}")
            raise HTTPException(status_code=401, detail="Mật khẩu không đúng")

        # Lấy thông tin role
        role_result = supabase.table('roles').select('name').eq('id', user['role_id']).execute()
        role_name = role_result.data[0]['name'] if role_result.data else 'user'

        print(f"Login successful for {login.email} with role {role_name}")

        # Log activity khi đăng nhập với online = true
        try:
            print(f"Attempting to log login activity for user {user['ma_nv']}")
            # Sử dụng table API thay vì raw SQL để tránh vấn đề formatting
            activity_result = supabase.table('activity_logs').insert({
                "user_id": user['ma_nv'],
                "chatflow_id": None,
                "online": True
            }).execute()
            print(f"Login activity logged successfully for user {user['ma_nv']}")
        except Exception as e:
            print(f"Failed to log login activity: {e}")
            # Không raise error để không làm gián đoạn login

        # Đồng bộ conversation IDs từ Dify khi đăng nhập
        # TEMPORARILY DISABLED for testing
        try:
            print("Conversation sync disabled for testing")
            # from dify_api_service import dify_service
            # from routers.user_chat_sessions_direct import create_or_update_session_direct
            # ... rest of sync logic
        except Exception as e:
            print(f"Failed to sync conversations on login: {e}")
            # Không raise error để không làm gián đoạn login

        return {
            "message": "Đăng nhập thành công",
            "user": {
                "id": user['ma_nv'],
                "username": user['username'],
                "email": user['email'],
                "full_name": user['full_name'],
                "role_id": user['role_id'],
                "department_id": user.get('department_id')
            },
            "role": role_name,
            "conversation_sync": {
                "synced_count": 0,  # Disabled for testing
                "conversation_ids": {}
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi server")

@router.post("/auth/logout/{user_id}")
def logout_user(user_id: str):
    """
    Đăng xuất user và cập nhật trạng thái online
    """
    try:
        print(f"Logout for user_id: {user_id}")

        # Log activity khi đăng xuất với online = false
        try:
            sql = f'''
            INSERT INTO activity_logs (user_id, chatflow_id, online)
            VALUES ('{user_id}', NULL, false)
            '''
            supabase.rpc('exec_sql', {'sql': sql})
        except:
            # Fallback: sử dụng table API
            supabase.table('activity_logs').insert({
                "user_id": user_id,
                "chatflow_id": None,
                "online": False
            }).execute()
        print(f"Logout activity logged for user {user_id}")

        return {"message": "Đăng xuất thành công"}

    except Exception as e:
        print(f"Logout error: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi server")

@router.post("/", status_code=201)
def create_new_user(user: UserCreate):
    """
    Tạo một tài khoản nhân viên mới.
    - Admin (role_id=1): Lưu cả Supabase Auth và database
    - User/Manager (role_id=2,3): Chỉ lưu database, không tạo Auth account
    """
    try:
        print(f"Creating user with data: {user.dict()}")  # Debug log

        supabase_user_id = None

        # Chỉ tạo Auth account nếu là Admin (role_id = 1)
        if user.role_id == 1:
            print("Creating Admin user in Supabase Auth...")
            new_user = supabase.auth.admin.create_user({
                "email": user.email,
                "password": user.password,
                "email_confirm": True, # Tự động xác thực email
                "user_metadata": {
                    "full_name": user.full_name,
                    "username": user.username,
                    "role_id": user.role_id
                }
            })
            supabase_user_id = new_user.user.id
            print(f"Admin Auth user created: {supabase_user_id}")
        else:
            print(f"Creating {user.role_id == 2 and 'User' or 'Manager'} in database only (no Auth)")

        # Thêm vào bảng employees
        user_data = {
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role_id": user.role_id,
            "is_active": True,
            "department_id": user.department_id  # Thêm department_id vào user_data
        }

        # Hash password cho tất cả users (bao gồm cả User/Manager)
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_data["hashed_password"] = hashed_password
        print(f"Password hashed for {user.username}: {hashed_password[:20]}...")  # Debug log (chỉ hiển thị 20 ký tự đầu)

        user_result = supabase.table('employees').insert(user_data).execute()
        print(f"User created in database: {user_result.data}")

        return {
            "message": f"{'Admin' if user.role_id == 1 else 'User/Manager'} created successfully",
            "user": supabase_user_id,
            "database_user": user_result.data,
            "auth_created": user.role_id == 1
        }
    except Exception as e:
        print(f"Error creating user: {str(e)}")  # Debug log
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def list_all_users(department_id: int = None, search: str = None):
    """
    Lấy danh sách tất cả nhân viên từ bảng users, có thể filter theo department và search theo tên hoặc email
    """
    try:
        # Lấy danh sách users với filter từ database
        users_query = supabase.table('employees').select('*').order('ma_nv')

        # Áp dụng department filter
        if department_id:
            users_query = users_query.eq('department_id', department_id)

        # Áp dụng search filter
        if search and search.strip():
            search_term = search.strip()
            # Lấy tất cả users và filter trong Python để tránh vấn đề với Supabase client
            all_users_query = supabase.table('employees').select('*').order('ma_nv')
            if department_id:
                all_users_query = all_users_query.eq('department_id', department_id)
            all_users_result = all_users_query.execute()

            # Filter trong Python
            filtered_users = []
            if all_users_result.data:
                for user in all_users_result.data:
                    if (search_term.lower() in (user.get('full_name') or '').lower() or
                        search_term.lower() in (user.get('username') or '').lower() or
                        search_term.lower() in (user.get('email') or '').lower()):
                        filtered_users.append(user)

            users_result = type('Result', (), {'data': filtered_users})()
        else:
            # Query bình thường nếu không có search
            users_result = users_query.execute()

        # Lấy danh sách departments để map
        dept_result = supabase.table('departments').select('id, name, description').execute()
        dept_map = {dept['id']: dept for dept in dept_result.data}

        # Transform dữ liệu để thêm thông tin department
        users = []
        for user in users_result.data:
            user_dict = dict(user)
            dept_id = user_dict.get('department_id')

            if dept_id and dept_id in dept_map:
                user_dict['departments'] = dept_map[dept_id]
            else:
                user_dict['departments'] = None

            users.append(user_dict)

        return {"users": users}
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}")
def update_user(user_id: str, user_data: dict):
    """
    Cập nhật thông tin nhân viên trong database.
    """
    try:
        # Cập nhật thông tin user trong bảng employees
        update_data = {}
        if 'username' in user_data:
            update_data['username'] = user_data['username']
        if 'email' in user_data:
            update_data['email'] = user_data['email']
        if 'full_name' in user_data:
            update_data['full_name'] = user_data['full_name']
        if 'department_id' in user_data:
            update_data['department_id'] = user_data['department_id']
        if 'is_active' in user_data:
            update_data['is_active'] = user_data['is_active']
        if 'role_id' in user_data:
            update_data['role_id'] = user_data['role_id']

        if update_data:
            result = supabase.table('employees').update(update_data).eq('ma_nv', user_id).execute()
            return {"message": "User updated successfully", "user": result.data}
        else:
            raise HTTPException(status_code=400, detail="No valid fields to update")
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str):
    """
    Xóa tài khoản nhân viên khỏi database.
    """
    try:
        # Xóa user khỏi bảng employees
        result = supabase.table('employees').delete().eq('ma_nv', user_id).execute()
        return {"message": "User deleted successfully"}
    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/activity/log")
def log_user_activity(activity: ActivityLogCreate):
    """
    Ghi log hoạt động của user khi truy cập chatflow.
    """
    try:
        print(f"Logging activity: user_id={activity.user_id}, chatflow_id={activity.chatflow_id}, online={activity.online}")

        # Sử dụng table API thay vì raw SQL để tránh vấn đề formatting
        result = supabase.table('activity_logs').insert({
            "user_id": activity.user_id,
            "chatflow_id": activity.chatflow_id,
            "online": activity.online
        }).execute()

        print(f"Activity logged: {activity.dict()}")

        return {"message": "Activity logged successfully", "activity": activity.dict()}
    except Exception as e:
        print(f"Error logging activity: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/activity/logs")
def get_activity_logs(current_user = Depends(get_current_admin_user)):
    """
    Lấy danh sách activity logs với thông tin user và chatflow.
    Chỉ admin mới có thể truy cập.
    """
    try:
        # Join với bảng employees và chatflows để lấy thông tin chi tiết
        result = supabase.table('activity_logs').select('''
            *,
            employees!fk_user(username, full_name, email),
            chatflows!fk_chatflow(name)
        ''').order('access_time', desc=True).execute()

        return {"activity_logs": result.data}
    except Exception as e:
        print(f"Error fetching activity logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/activity/logs/test")
def get_activity_logs_test():
    """
    Lấy danh sách activity logs với thông tin user và chatflow (không cần authentication).
    """
    try:
        # Test database connection trước
        test_result = supabase.table('employees').select('count').limit(1).execute()
        print(f"Database connection test: {test_result}")

        # Thử query activity logs với fallback
        try:
            result = supabase.table('activity_logs').select('*').order('access_time', desc=True).limit(10).execute()
            return {
                "message": "Activity logs retrieved successfully",
                "activity_logs": result.data,
                "count": len(result.data) if result.data else 0
            }
        except Exception as table_error:
            print(f"Table activity_logs not found: {table_error}")

            # Thử tạo activity log mẫu để test
            try:
                # Insert một activity log mẫu
                sample_activity = {
                    "user_id": 1,
                    "chatflow_id": 0,
                    "online": True
                }

                # Thử insert trực tiếp
                insert_result = supabase.table('activity_logs').insert(sample_activity).execute()
                print(f"Sample activity inserted: {insert_result}")

                # Query lại
                result = supabase.table('activity_logs').select('*').order('access_time', desc=True).limit(10).execute()
                return {
                    "message": "Activity logs table exists and working",
                    "activity_logs": result.data,
                    "count": len(result.data) if result.data else 0,
                    "sample_inserted": True
                }

            except Exception as insert_error:
                print(f"Failed to insert sample activity: {insert_error}")
                return {
                    "error": f"Table may not exist: {str(table_error)}",
                    "insert_error": str(insert_error),
                    "message": "Activity logs functionality needs table creation"
                }

    except Exception as e:
        print(f"Database connection error: {str(e)}")
        return {
            "error": str(e),
            "message": "Database connection failed"
        }

@router.post("/password-reset/send-code")
def send_password_reset_code(request: SendCodeRequest):
    """
    Send verification code to user's email for password reset
    """
    try:
        if not SUPABASE_AVAILABLE or supabase is None:
            raise HTTPException(status_code=503, detail="Database service unavailable")

        # Check if user exists
        result = supabase.table('employees').select('*').eq('email', request.email).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Email không tồn tại")

        # Generate 6-digit code
        code = ''.join(random.choices(string.digits, k=6))

        # Store code with timestamp (expires in 10 minutes)
        verification_codes[request.email] = {
            'code': code,
            'timestamp': time.time(),
            'expires': time.time() + 600  # 10 minutes
        }

        # Send email
        if send_verification_code(request.email, code):
            return {
                "message": "Mã xác thực đã được gửi đến email của bạn",
                "expires_in": "10 phút"
            }
        else:
            raise HTTPException(status_code=500, detail="Không thể gửi email")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending verification code: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi server")

@router.post("/password-reset/verify")
def verify_code_and_reset_password(request: VerifyCodeRequest):
    """
    Verify code and update password
    """
    try:
        if not SUPABASE_AVAILABLE or supabase is None:
            raise HTTPException(status_code=503, detail="Database service unavailable")

        # Check if code exists and is valid
        if request.email not in verification_codes:
            raise HTTPException(status_code=400, detail="Mã xác thực không hợp lệ")

        stored_data = verification_codes[request.email]

        if time.time() > stored_data['expires']:
            del verification_codes[request.email]
            raise HTTPException(status_code=400, detail="Mã xác thực đã hết hạn")

        if stored_data['code'] != request.code:
            raise HTTPException(status_code=400, detail="Mã xác thực không đúng")

        # Update password
        hashed_password = bcrypt.hashpw(request.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        result = supabase.table('employees').update({
            'hashed_password': hashed_password
        }).eq('email', request.email).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Không thể cập nhật mật khẩu")

        # Remove used code
        del verification_codes[request.email]

        return {"message": "Mật khẩu đã được cập nhật thành công"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying code: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi server")

@router.get("/me")
def get_current_user_info():
    """
    Lấy thông tin user hiện tại dựa trên Supabase session
    """
    try:
        # Lấy user từ Supabase auth
        user_response = supabase.auth.get_user()
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Không tìm thấy user")

        supabase_user = user_response.user

        # Tìm user trong database dựa trên email
        result = supabase.table('employees').select('*').eq('email', supabase_user.email).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="User không tồn tại trong database")

        user = result.data[0]

        return {
            "id": user['ma_nv'],
            "username": user['username'],
            "email": user['email'],
            "full_name": user['full_name'],
            "role_id": user['role_id'],
            "department_id": user.get('department_id')
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting current user: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi server")