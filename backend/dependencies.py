# dependencies.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .supabase_client import supabase

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency để lấy thông tin user hiện tại từ JWT token.
    """
    token = credentials.credentials
    try:
        # Xác thực token với Supabase
        user = supabase.auth.get_user(token)
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user_optional(credentials: HTTPBearer = Depends(HTTPBearer(auto_error=False))):
    """
    Dependency để lấy thông tin user hiện tại từ JWT token (optional).
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        # Xác thực token với Supabase
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception as e:
        return None

async def get_current_admin_user(current_user = Depends(get_current_user)):
    """
    Dependency để kiểm tra quyền admin.
    """
    try:
        # Kiểm tra vai trò admin từ database users table
        from .supabase_client import supabase

        # Tìm user trong bảng users theo email
        result = supabase.table('users').select('role_id, email').eq('email', current_user.email).execute()

        if result.data and len(result.data) > 0:
            user_data = result.data[0]
            # role_id = 1 là Admin
            if user_data['role_id'] == 1:
                return current_user

        # Fallback: kiểm tra email trong danh sách admin
        admin_emails = ["admin@company.com", "admin@example.com"]
        if current_user.email in admin_emails:
            return current_user

        raise HTTPException(status_code=403, detail="Not authorized - Admin access required")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error checking admin status: {e}")
        raise HTTPException(status_code=403, detail="Not authorized - Admin access required")