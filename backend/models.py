# models.py
from pydantic import BaseModel, EmailStr
from typing import Optional, Union

# Model cho việc tạo người dùng mới
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role_id: int = 2
    department_id: Optional[int] = None
    # Employee-specific fields
    ma_nv: Optional[str] = None  # Tự động tạo nếu không cung cấp
    chuc_vu: Optional[str] = None
    phong_ban: Optional[str] = None
    luong_hop_dong: float
    muc_luong_dong_bhxh: float
    so_nguoi_phu_thuoc: int = 0
    dien_thoai: Optional[str] = None
    dia_chi: Optional[str] = None
    ngay_vao_lam: Optional[str] = None

# Model cho bảng employees (database)
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role_id: int
    department_id: Optional[int]
    is_active: bool
    created_at: Optional[str]
    updated_at: Optional[str]

# Model cho Activity Log
class ActivityLogCreate(BaseModel):
    user_id: int
    chatflow_id: Optional[int] = None  # None for login/logout activities, specific id for chatflow access
    online: Optional[bool] = None  # True for login, False for logout, None for access

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    chatflow_id: int
    online: Optional[bool]
    access_time: Optional[str]

# Model cho Chatflow
class ChatflowCreate(BaseModel):
    name: str
    embed_url: str
    department_id: Optional[int] = None
    is_enabled: bool = True

class ChatflowUpdate(BaseModel):
    name: Optional[str] = None
    embed_url: Optional[str] = None
    department_id: Optional[int] = None
    is_enabled: Optional[bool] = None

# Model cho Department
class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: bool = True

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: Optional[bool] = None

class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    manager_id: Optional[int]
    is_active: bool
    created_at: Optional[str]
    updated_at: Optional[str]

# Model cho Department Member
class DepartmentMemberCreate(BaseModel):
    department_id: int
    user_id: int
    role_in_department: str = "member"

class DepartmentMemberResponse(BaseModel):
    id: int
    department_id: int
    user_id: int
    role_in_department: str
    joined_at: Optional[str]

# Model cho Feedback
class FeedbackCreate(BaseModel):
    user_id: Optional[int] = None
    subject: str
    message: str
    category: str = "general"  # "general", "bug", "feature", "improvement"
    priority: str = "medium"   # "low", "medium", "high", "urgent"

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    category: str
    priority: str
    status: str
    created_at: Optional[str]
    updated_at: Optional[str]

# Model cho Chat History
class ChatHistoryCreate(BaseModel):
    name_app: str
    input_text: str
    output_text: str
    user_id: Optional[int] = None
    conversation_id: Optional[str] = None
    email: Optional[str] = None

class ChatHistoryResponse(BaseModel):
    id: int
    name_app: str
    user_message: str
    bot_response: str
    user_id: Optional[int]
    session_id: Optional[str]
    timestamp: Optional[str]

# Model cho User Chat Sessions
class UserChatSessionCreate(BaseModel):
    user_id: int
    chatflow_id: int
    conversation_id: Optional[str] = None
    session_data: Optional[dict] = None

class UserChatSessionUpdate(BaseModel):
    conversation_id: Optional[str] = None
    session_data: Optional[dict] = None
    last_accessed: Optional[str] = None

class UserChatSessionResponse(BaseModel):
    id: int
    user_id: int
    chatflow_id: int
    conversation_id: Optional[str]
    session_data: Optional[dict]
    last_accessed: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]

# Model cho User Chat
class UserChatCreate(BaseModel):
    app_id: Optional[str] = None
    conversation_id: Optional[str] = None
    email: str
    user_id: Optional[int] = None
    name_app: str

class UserChatResponse(BaseModel):
    id: int
    app_id: Optional[str]
    conversation_id: Optional[str]
    email: str
    user_id: Optional[int]
    name_app: str
    created_at: Optional[str]

# ===== PAYROLL MODELS =====

# Model cho Nhân viên
class NhanVienCreate(BaseModel):
    ma_nv: Union[str, int]
    ho_ten: str
    chuc_vu: Optional[str] = None
    phong_ban: Optional[str] = None
    luong_hop_dong: float
    muc_luong_dong_bhxh: float
    so_nguoi_phu_thuoc: int = 0
    email: Optional[str] = None
    dien_thoai: Optional[str] = None
    dia_chi: Optional[str] = None
    ngay_vao_lam: Optional[str] = None

class NhanVienUpdate(BaseModel):
    ho_ten: Optional[str] = None
    chuc_vu: Optional[str] = None
    phong_ban: Optional[str] = None
    luong_hop_dong: Optional[float] = None
    muc_luong_dong_bhxh: Optional[float] = None
    so_nguoi_phu_thuoc: Optional[int] = None
    email: Optional[str] = None
    dien_thoai: Optional[str] = None
    dia_chi: Optional[str] = None
    ngay_vao_lam: Optional[str] = None
    is_active: Optional[bool] = None

class NhanVienResponse(BaseModel):
    ma_nv: Union[str, int]
    ho_ten: str
    chuc_vu: Optional[str]
    phong_ban: Optional[str]
    luong_hop_dong: float
    muc_luong_dong_bhxh: float
    so_nguoi_phu_thuoc: int
    email: Optional[str]
    dien_thoai: Optional[str]
    dia_chi: Optional[str]
    ngay_vao_lam: Optional[str]
    is_active: bool
    created_at: Optional[str]
    updated_at: Optional[str]

# Model cho Bảng chấm công
class BangChamCongCreate(BaseModel):
    ma_nv: Union[str, int]
    ky_tinh_luong: str
    ngay_cong_chuan: float
    ngay_cong_thuc_te: float
    gio_ot_ngay_thuong: float = 0
    gio_ot_cuoi_tuan: float = 0
    gio_ot_le_tet: float = 0
    ghi_chu: Optional[str] = None

class BangChamCongUpdate(BaseModel):
    ngay_cong_chuan: Optional[float] = None
    ngay_cong_thuc_te: Optional[float] = None
    gio_ot_ngay_thuong: Optional[float] = None
    gio_ot_cuoi_tuan: Optional[float] = None
    gio_ot_le_tet: Optional[float] = None
    ghi_chu: Optional[str] = None

class BangChamCongResponse(BaseModel):
    id: int
    ma_nv: Optional[Union[str, int]]
    ky_tinh_luong: str
    ngay_cong_chuan: float
    ngay_cong_thuc_te: float
    gio_ot_ngay_thuong: float
    gio_ot_cuoi_tuan: float
    gio_ot_le_tet: float
    ghi_chu: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]

# Model cho Lương sản phẩm
class LuongSanPhamCreate(BaseModel):
    ma_nv: Union[str, int]
    ky_tinh_luong: str
    san_pham_id: str
    ten_san_pham: Optional[str] = None
    so_luong: float
    don_gia: float
    ty_le: Optional[float] = None

class LuongSanPhamUpdate(BaseModel):
    ten_san_pham: Optional[str] = None
    so_luong: Optional[float] = None
    don_gia: Optional[float] = None
    ty_le: Optional[float] = None

class LuongSanPhamResponse(BaseModel):
    id: int
    ma_nv: Optional[Union[str, int]]
    ky_tinh_luong: str
    san_pham_id: str
    ten_san_pham: Optional[str]
    so_luong: float
    don_gia: float
    ty_le: Optional[float]
    thanh_tien: float
    created_at: Optional[str]
    updated_at: Optional[str]

# Model cho Phiếu lương
class PhieuLuongResponse(BaseModel):
    id: int
    ma_nv: Union[str, int]
    ky_tinh_luong: str
    tong_thu_nhap: float
    tong_khau_tru: float
    luong_thuc_nhan: float
    chi_tiet_thu_nhap: dict
    chi_tiet_khau_tru: dict
    trang_thai: str
    ngay_tao: Optional[str]
    ngay_duyet: Optional[str]
    nguoi_duyet: Optional[str]

# Model cho tính lương
class TinhLuongRequest(BaseModel):
    ma_nv: Union[str, int]
    ky_tinh_luong: str
    phu_cap_khac: float = 0
    thuong_kpi: float = 0