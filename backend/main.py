# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, chatflows, feedback, departments, chat_history, sample_files, user_chat_sessions, user_chat_sessions_direct, test_router, conversation_sync, user_chat
# Removed: from email_sync_service import start_email_sync_service

app = FastAPI(title="Admin Management API")

# Cấu hình CORS để frontend có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Cho phép frontend của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thêm các router vào ứng dụng
app.include_router(users.router, prefix="/api/v1")
app.include_router(chatflows.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(departments.router, prefix="/api/v1")
app.include_router(chat_history.router, prefix="/api/v1")
app.include_router(sample_files.router, prefix="/api/v1")
app.include_router(user_chat_sessions.router, prefix="/api/v1")
app.include_router(user_chat_sessions_direct.router, prefix="/api/v1")
app.include_router(conversation_sync.router, prefix="/api/v1")
app.include_router(test_router.router, prefix="/api/v1")
app.include_router(user_chat.router, prefix="/api/v1")

# Removed: Khởi động email sync service khi app start
# @app.on_event("startup")
# async def startup_event():
#     """Khởi động email sync service khi app start"""
#     start_email_sync_service()

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