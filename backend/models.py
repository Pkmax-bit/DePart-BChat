# models.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# Model cho việc tạo người dùng mới
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role_id: int = 2
    department_id: Optional[int] = None

# Model cho bảng users (database)
class UserResponse(BaseModel):
    id: int
    username: str
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

# Model cho LoaiNhom
class LoaiNhomCreate(BaseModel):
    tenloai: str

class LoaiNhomResponse(BaseModel):
    id: str
    tenloai: str

# Model cho LoaiKinh
class LoaiKinhCreate(BaseModel):
    tenloai: str

class LoaiKinhResponse(BaseModel):
    id: str
    tenloai: str

# Model cho LoaiTayNam
class LoaiTayNamCreate(BaseModel):
    tenloai: str

class LoaiTayNamResponse(BaseModel):
    id: str
    tenloai: str

# Model cho BoPhan
class BoPhanCreate(BaseModel):
    tenloai: str

class BoPhanResponse(BaseModel):
    id: str
    tenloai: str

# Model cho SanPham
class SanPhamCreate(BaseModel):
    tensp: str
    id_nhom: str
    id_kinh: str
    id_taynam: str
    id_bophan: str

class SanPhamResponse(BaseModel):
    id: str
    tensp: str
    id_nhom: str
    id_kinh: str
    id_taynam: str
    id_bophan: str

# Model cho ChiTietSanPham
class ChiTietSanPhamCreate(BaseModel):
    id_sanpham: str
    don_gia: float
    don_vi_tinh: str
    ngang: int
    cao: int
    sau: int

class ChiTietSanPhamResponse(BaseModel):
    id: int
    id_sanpham: str
    don_gia: float
    don_vi_tinh: str
    ngang: int
    cao: int
    sau: int

# Model cho Invoice
class InvoiceItem(BaseModel):
    id_nhom: str
    id_kinh: str
    id_taynam: str
    id_bophan: str
    sanpham_id: Optional[str] = None
    ngang: int
    cao: int
    sau: int
    so_luong: int
    don_gia: float
    dien_tich_ke_hoach: float
    dien_tich_thuc_te: float
    ti_le: float
    thanh_tien: float

class InvoiceCreate(BaseModel):
    customer_name: str
    invoice_date: str
    items: list[InvoiceItem]
    total_amount: float

class InvoiceResponse(BaseModel):
    id: int
    customer_name: str
    invoice_date: str
    items: list[dict]
    total_amount: float
    created_at: Optional[str]
    updated_at: Optional[str]