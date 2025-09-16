-- Script tạo bảng departments và các bảng liên quan
-- Chạy script này trong Supabase SQL Editor

-- Tạo bảng departments
CREATE TABLE IF NOT EXISTS public.departments (
    id SERIAL NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INTEGER,
    is_active BOOLEAN NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT departments_pkey PRIMARY KEY (id),
    CONSTRAINT departments_name_key UNIQUE (name),
    CONSTRAINT departments_manager_id_fkey FOREIGN KEY (manager_id)
        REFERENCES public.employees(id) ON DELETE SET NULL
);

-- Thêm cột department_id vào bảng employees
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS department_id INTEGER;

-- Thêm cột department_id vào bảng chatflows
ALTER TABLE chatflows
ADD COLUMN IF NOT EXISTS department_id INTEGER;

-- Thêm foreign key constraints
ALTER TABLE employees
ADD CONSTRAINT employees_department_id_fkey
FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

ALTER TABLE chatflows
ADD CONSTRAINT chatflows_department_id_fkey
FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

-- Tạo bảng department_members (quan hệ nhiều-nhiều nếu cần)
CREATE TABLE IF NOT EXISTS public.department_members (
    id SERIAL NOT NULL,
    department_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role_in_department VARCHAR(50) DEFAULT 'member', -- 'manager', 'member', 'assistant'
    joined_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT department_members_pkey PRIMARY KEY (id),
    CONSTRAINT department_members_department_id_fkey FOREIGN KEY (department_id)
        REFERENCES public.departments(id) ON DELETE CASCADE,
    CONSTRAINT department_members_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.employees(id) ON DELETE CASCADE,
    CONSTRAINT department_members_unique UNIQUE (department_id, user_id)
);

-- Tạo indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_chatflows_department_id ON chatflows(department_id);
CREATE INDEX IF NOT EXISTS idx_department_members_department_id ON department_members(department_id);
CREATE INDEX IF NOT EXISTS idx_department_members_user_id ON department_members(user_id);

-- Insert dữ liệu mẫu cho departments
INSERT INTO departments (name, description, is_active) VALUES
('Kỹ thuật', 'Phòng ban kỹ thuật và phát triển', true),
('Kinh doanh', 'Phòng ban kinh doanh và marketing', true),
('Nhân sự', 'Phòng ban nhân sự và hành chính', true),
('Tài chính', 'Phòng ban tài chính và kế toán', true)
ON CONFLICT (name) DO NOTHING;

-- Cập nhật RLS policies nếu cần
-- ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE department_members ENABLE ROW LEVEL SECURITY;
