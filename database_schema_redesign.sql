-- =====================================================
-- DATABASE SCHEMA REDESIGN FOR DEPARTMENT-BOTCHAT
-- =====================================================
-- This script redesigns the database to make it more logical:
-- 1. Users table as central entity with authentication
-- 2. Employees linked to users via user_id foreign key
-- 3. Proper department and role relationships
-- 4. Employee creation automatically creates user accounts

-- =====================================================
-- 1. ROLES TABLE (Keep existing but ensure data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (name, description, permissions) VALUES
    ('admin', 'Administrator with full access', '{"all": true}'),
    ('manager', 'Department manager', '{"department": true, "employees": true}'),
    ('employee', 'Regular employee', '{"chat": true, "profile": true}'),
    ('hr', 'Human Resources', '{"employees": true, "payroll": true}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. DEPARTMENTS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id INTEGER, -- Will reference users.id
    parent_department_id INTEGER, -- For hierarchical departments
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT departments_parent_fkey FOREIGN KEY (parent_department_id)
        REFERENCES public.departments(id) ON DELETE SET NULL
);

-- Insert default departments
INSERT INTO public.departments (name, description, is_active) VALUES
    ('Kỹ thuật', 'Phòng ban kỹ thuật và phát triển', true),
    ('Kinh doanh', 'Phòng ban kinh doanh và marketing', true),
    ('Nhân sự', 'Phòng ban nhân sự và hành chính', true),
    ('Tài chính', 'Phòng ban tài chính và kế toán', true),
    ('Quản lý', 'Ban quản lý cấp cao', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. USERS TABLE (Central authentication entity)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    role_id INTEGER NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    department_id INTEGER REFERENCES public.departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_employee BOOLEAN DEFAULT FALSE, -- Flag to indicate if user is also an employee
    supabase_user_id VARCHAR(255), -- For Supabase Auth integration
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for department manager
ALTER TABLE public.departments
ADD CONSTRAINT departments_manager_id_fkey
FOREIGN KEY (manager_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- =====================================================
-- 4. NHAN_VIEN TABLE (Employee details linked to users)
-- =====================================================
-- Drop existing nhan_vien table if it exists without proper foreign keys
DROP TABLE IF EXISTS public.nhan_vien CASCADE;

CREATE TABLE IF NOT EXISTS public.nhan_vien (
    user_id INTEGER PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    ma_nv VARCHAR(20) UNIQUE NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    chuc_vu VARCHAR(100),
    phong_ban VARCHAR(100), -- Redundant but kept for compatibility
    luong_hop_dong DECIMAL(15,2) NOT NULL,
    muc_luong_dong_bhxh DECIMAL(15,2) NOT NULL,
    so_nguoi_phu_thuoc INTEGER DEFAULT 0,
    email VARCHAR(150), -- Redundant but kept for compatibility
    dien_thoai VARCHAR(20),
    dia_chi TEXT,
    ngay_vao_lam DATE NOT NULL,
    ngay_sinh DATE,
    gioi_tinh VARCHAR(10),
    trinh_do_hoc_van VARCHAR(100),
    chuyen_mon VARCHAR(100),
    kinh_nghiem INTEGER, -- Years of experience
    trang_thai VARCHAR(20) DEFAULT 'active', -- active, inactive, terminated
    ghi_chu TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. DEPARTMENT_MEMBERS TABLE (Many-to-many relationship)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.department_members (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_in_department VARCHAR(50) DEFAULT 'member', -- manager, assistant, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT TRUE, -- Is this the primary department for the user?
    CONSTRAINT department_members_unique UNIQUE (department_id, user_id)
);

-- =====================================================
-- 6. CHATFLOWS TABLE (Enhanced with department)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chatflows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    embed_url TEXT NOT NULL,
    department_id INTEGER REFERENCES public.departments(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. USER_CHAT_SESSIONS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    chatflow_id INTEGER NOT NULL REFERENCES public.chatflows(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255),
    session_data JSONB DEFAULT '{}',
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_chatflow UNIQUE (user_id, chatflow_id)
);

-- =====================================================
-- 8. USER_CHAT TABLE (Chat history)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_chat (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    app_id TEXT,
    conversation_id TEXT,
    email TEXT, -- Keep for backward compatibility
    name_app TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. ACTIVITY_LOGS TABLE (User activity tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. PAYROLL TABLES (Linked to nhan_vien)
-- =====================================================
-- Keep existing payroll tables but ensure they reference nhan_vien properly

-- Update bang_cham_cong to reference nhan_vien properly
ALTER TABLE IF EXISTS public.bang_cham_cong
DROP CONSTRAINT IF EXISTS bang_cham_cong_ma_nv_fkey;

ALTER TABLE IF EXISTS public.bang_cham_cong
ADD CONSTRAINT bang_cham_cong_ma_nv_fkey
FOREIGN KEY (ma_nv) REFERENCES public.nhan_vien(ma_nv) ON DELETE CASCADE;

-- Update luong_san_pham to reference nhan_vien properly
ALTER TABLE IF EXISTS public.luong_san_pham
DROP CONSTRAINT IF EXISTS luong_san_pham_ma_nv_fkey;

ALTER TABLE IF EXISTS public.luong_san_pham
ADD CONSTRAINT luong_san_pham_ma_nv_fkey
FOREIGN KEY (ma_nv) REFERENCES public.nhan_vien(ma_nv) ON DELETE CASCADE;

-- Update phieu_luong to reference nhan_vien properly
ALTER TABLE IF EXISTS public.phieu_luong
DROP CONSTRAINT IF EXISTS phieu_luong_ma_nv_fkey;

ALTER TABLE IF EXISTS public.phieu_luong
ADD CONSTRAINT phieu_luong_ma_nv_fkey
FOREIGN KEY (ma_nv) REFERENCES public.nhan_vien(ma_nv) ON DELETE CASCADE;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_is_employee ON public.users(is_employee);

CREATE INDEX IF NOT EXISTS idx_nhan_vien_ma_nv ON public.nhan_vien(ma_nv);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_email ON public.nhan_vien(email);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_trang_thai ON public.nhan_vien(trang_thai);

CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON public.departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON public.departments(parent_department_id);

CREATE INDEX IF NOT EXISTS idx_department_members_department_id ON public.department_members(department_id);
CREATE INDEX IF NOT EXISTS idx_department_members_user_id ON public.department_members(user_id);

CREATE INDEX IF NOT EXISTS idx_chatflows_department_id ON public.chatflows(department_id);
CREATE INDEX IF NOT EXISTS idx_chatflows_created_by ON public.chatflows(created_by);

CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_user_id ON public.user_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_chatflow_id ON public.user_chat_sessions(chatflow_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_last_accessed ON public.user_chat_sessions(last_accessed);

CREATE INDEX IF NOT EXISTS idx_user_chat_user_id ON public.user_chat(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_email ON public.user_chat(email);
CREATE INDEX IF NOT EXISTS idx_user_chat_conversation_id ON public.user_chat(conversation_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- =====================================================
-- DEFAULT ADMIN USER
-- =====================================================
-- Insert default admin user (password: admin123)
INSERT INTO public.users (username, hashed_password, email, full_name, role_id, is_active, is_employee)
SELECT 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeCt1uB0Y1uO3Xe', 'admin@company.com', 'Administrator', 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'admin');

-- =====================================================
-- DATA MIGRATION HELPERS
-- =====================================================
-- Note: Run data migration scripts separately after schema is created

-- =====================================================
-- RLS POLICIES (Optional - Enable if using Supabase RLS)
-- =====================================================
-- These would be enabled if using Row Level Security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE nhan_vien ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
-- etc.

COMMIT;