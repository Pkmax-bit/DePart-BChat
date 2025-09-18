# main.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import routers with absolute paths
from routers.users import router as users_router
from routers.chatflows import router as chatflows_router
from routers.feedback import router as feedback_router
from routers.departments import router as departments_router
from routers.chat_history import router as chat_history_router
from routers.sample_files import router as sample_files_router
from routers.user_chat_sessions import router as user_chat_sessions_router
from routers.user_chat_sessions_direct import router as user_chat_sessions_direct_router
from routers.test_router import router as test_router_router
from routers.conversation_sync import router as conversation_sync_router
from routers.user_chat import router as user_chat_router
from routers.accounting import router as accounting_router
from routers.payroll import router as payroll_router
from routers.notifications import router as notifications_router
# Removed: from email_sync_service import start_email_sync_service
from notification_scheduler import notification_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events"""
    # Startup
    try:
        notification_scheduler.start_scheduler()
        print("✅ Notification scheduler started successfully")
    except Exception as e:
        print(f"❌ Error starting notification scheduler: {e}")
    yield
    # Shutdown
    try:
        notification_scheduler.stop_scheduler()
        print("✅ Notification scheduler stopped successfully")
    except Exception as e:
        print(f"❌ Error stopping notification scheduler: {e}")

app = FastAPI(title="Admin Management API", lifespan=lifespan)

# Cấu hình CORS để frontend có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Cho phép frontend của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thêm các router vào ứng dụng
app.include_router(users_router, prefix="/api/v1")
app.include_router(chatflows_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")
app.include_router(departments_router, prefix="/api/v1")
app.include_router(chat_history_router, prefix="/api/v1")
app.include_router(sample_files_router, prefix="/api/v1")
app.include_router(user_chat_sessions_router, prefix="/api/v1")
app.include_router(user_chat_sessions_direct_router, prefix="/api/v1")
app.include_router(conversation_sync_router, prefix="/api/v1")
app.include_router(test_router_router, prefix="/api/v1")
app.include_router(user_chat_router, prefix="/api/v1")
app.include_router(accounting_router, prefix="/api/v1")
app.include_router(payroll_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")

# Removed: Khởi động email sync service khi app start
# @app.on_event("startup")
# async def startup_event():
#     """Khởi động notification scheduler khi app start"""
#     notification_scheduler.start_scheduler()

# @app.on_event("shutdown")
# async def shutdown_event():
#     """Dừng notification scheduler khi app shutdown"""
#     notification_scheduler.stop_scheduler()

@app.get("/")
def root():
    return {"message": "Welcome to the Admin API"}

@app.post("/api/v1/create-nhanvien-table")
def create_nhanvien_table():
    """
    Tạo bảng nhanvien nếu chưa tồn tại
    """
    try:
        from supabase_client import supabase

        # Tạo bảng nhanvien
        create_table_sql = '''
        CREATE TABLE IF NOT EXISTS public.nhanvien (
          id SERIAL NOT NULL,
          username VARCHAR(100) NOT NULL,
          full_name VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL,
          role_id INTEGER NOT NULL DEFAULT 2,
          is_active BOOLEAN NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
          supabase_user_id VARCHAR(255) NULL,
          CONSTRAINT nhanvien_pkey PRIMARY KEY (id),
          CONSTRAINT nhanvien_email_key UNIQUE (email),
          CONSTRAINT nhanvien_username_key UNIQUE (username)
        );
        '''

        # Thử tạo bảng
        result = supabase.rpc('exec_sql', {'sql': create_table_sql})

        return {"message": "Nhanvien table created successfully"}
    except Exception as e:
        return {"message": f"Error creating table: {str(e)}"}