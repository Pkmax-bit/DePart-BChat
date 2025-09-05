-- Tạo bảng users trong Supabase
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL NOT NULL,
  username VARCHAR(100) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NULL,
  email VARCHAR(150) NULL,
  role_id INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_username_key UNIQUE (username)
) TABLESPACE pg_default;

-- Tạo bảng roles nếu chưa có
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT roles_pkey PRIMARY KEY (id),
  CONSTRAINT roles_name_key UNIQUE (name)
) TABLESPACE pg_default;

-- Thêm foreign key constraint
ALTER TABLE public.users
ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles (id);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
('admin', 'Administrator with full access'),
('user', 'Regular user with limited access'),
('manager', 'Manager with elevated access')
ON CONFLICT (name) DO NOTHING;

-- Tạo bảng chatflows nếu chưa có
CREATE TABLE IF NOT EXISTS public.chatflows (
  id SERIAL NOT NULL,
  name VARCHAR(255) NOT NULL,
  embed_url TEXT NOT NULL,
  is_enabled BOOLEAN NULL DEFAULT true,
  created_by INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT chatflows_pkey PRIMARY KEY (id),
  CONSTRAINT fk_chatflows_created_by FOREIGN KEY (created_by) REFERENCES public.users (id)
) TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatflows ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Tạo bảng nhanvien để lưu thông tin nhân viên
CREATE TABLE IF NOT EXISTS public.nhanvien (
  id SERIAL NOT NULL,
  username VARCHAR(100) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  role_id INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  supabase_user_id VARCHAR(255) NULL, -- Liên kết với Supabase Auth user
  CONSTRAINT nhanvien_pkey PRIMARY KEY (id),
  CONSTRAINT nhanvien_email_key UNIQUE (email),
  CONSTRAINT nhanvien_username_key UNIQUE (username),
  CONSTRAINT fk_nhanvien_role FOREIGN KEY (role_id) REFERENCES public.roles (id)
) TABLESPACE pg_default;

-- Enable Row Level Security cho bảng nhanvien
ALTER TABLE public.nhanvien ENABLE ROW LEVEL SECURITY;

-- Create policies for nhanvien table
CREATE POLICY "Users can view their own nhanvien data" ON public.nhanvien
  FOR SELECT USING (auth.uid()::text = supabase_user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all nhanvien" ON public.nhanvien
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
