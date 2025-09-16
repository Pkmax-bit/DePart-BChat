-- Migration to merge nhan_vien and users tables into a single table
-- This migration combines employee and user data into one unified table

-- Step 1: Create the new merged table
CREATE TABLE public.employees (
  -- Primary key (auto-increment like users table)
  id SERIAL NOT NULL,

  -- Employee-specific fields from nhan_vien
  ma_nv character varying(20) NOT NULL,

  -- Employee-specific fields from nhan_vien
  ho_ten character varying(100) NOT NULL,
  chuc_vu character varying(50) NULL,
  phong_ban character varying(50) NULL,
  luong_hop_dong numeric(15, 2) NOT NULL,
  muc_luong_dong_bhxh numeric(15, 2) NOT NULL,
  so_nguoi_phu_thuoc integer NULL DEFAULT 0,
  dien_thoai character varying(20) NULL,
  dia_chi text NULL,
  ngay_vao_lam date NULL,

  -- User-specific fields from users
  username character varying(100) NOT NULL,
  hashed_password character varying(255) NOT NULL,
  full_name character varying(150) NULL,
  role_id integer NOT NULL,
  department_id integer NULL,

  -- Common fields (merged)
  email character varying(150) NULL, -- Using users' email constraint (longer)
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_ma_nv_key UNIQUE (ma_nv),
  CONSTRAINT employees_email_key UNIQUE (email),
  CONSTRAINT employees_username_key UNIQUE (username),
  CONSTRAINT employees_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles (id),
  CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON public.employees USING btree (department_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_employees_role_id ON public.employees USING btree (role_id) TABLESPACE pg_default;

-- Step 3: Migrate data from the old tables
-- Insert data by joining nhan_vien and users tables
INSERT INTO public.employees (
  ma_nv,
  ho_ten,
  chuc_vu,
  phong_ban,
  luong_hop_dong,
  muc_luong_dong_bhxh,
  so_nguoi_phu_thuoc,
  dien_thoai,
  dia_chi,
  ngay_vao_lam,
  username,
  hashed_password,
  full_name,
  role_id,
  department_id,
  email,
  is_active,
  created_at,
  updated_at
)
SELECT
  nv.ma_nv,
  nv.ho_ten,
  nv.chuc_vu,
  nv.phong_ban,
  nv.luong_hop_dong,
  nv.muc_luong_dong_bhxh,
  nv.so_nguoi_phu_thuoc,
  nv.dien_thoai,
  nv.dia_chi,
  nv.ngay_vao_lam,
  u.username,
  u.hashed_password,
  u.full_name,
  u.role_id,
  u.department_id,
  COALESCE(u.email, nv.email) as email, -- Prefer users.email, fallback to nhan_vien.email
  COALESCE(u.is_active, nv.is_active, true) as is_active, -- Use users.is_active, then nhan_vien.is_active, default true
  COALESCE(u.created_at, nv.created_at) as created_at, -- Prefer users.created_at
  COALESCE(u.updated_at, nv.updated_at) as updated_at -- Prefer users.updated_at
FROM public.nhan_vien nv
LEFT JOIN public.users u ON nv.user_id = u.id;

-- Step 4: Handle any remaining users that don't have nhan_vien records
-- (This would be rare, but just in case)
INSERT INTO public.employees (
  ma_nv,
  ho_ten,
  username,
  hashed_password,
  full_name,
  role_id,
  department_id,
  email,
  is_active,
  created_at,
  updated_at,
  luong_hop_dong,
  muc_luong_dong_bhxh
)
SELECT
  'USER_' || u.id::text as ma_nv, -- Generate ma_nv for users without nhan_vien records
  COALESCE(u.full_name, u.username) as ho_ten,
  u.username,
  u.hashed_password,
  u.full_name,
  u.role_id,
  u.department_id,
  u.email,
  u.is_active,
  u.created_at,
  u.updated_at,
  0 as luong_hop_dong, -- Default values for required fields
  0 as muc_luong_dong_bhxh
FROM public.users u
LEFT JOIN public.nhan_vien nv ON u.id = nv.user_id
WHERE nv.user_id IS NULL;

-- Step 5: Update any foreign key references to point to the new table
-- Note: This step may need to be customized based on your specific foreign key relationships
-- For now, we'll assume the main references are handled

-- Step 6: Drop the old tables
DROP TABLE IF EXISTS public.nhan_vien CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 7: Rename the new table to a more appropriate name if desired
-- ALTER TABLE public.employees RENAME TO public.user_employees;

-- Optional: Add any additional constraints or indexes as needed
-- Example: Add a check constraint for salary validation
-- ALTER TABLE public.employees ADD CONSTRAINT check_salary_positive CHECK (luong_hop_dong >= 0);
-- ALTER TABLE public.employees ADD CONSTRAINT check_insurance_salary_positive CHECK (muc_luong_dong_bhxh >= 0);

-- Optional: Update any sequences if needed
-- SELECT setval('public.employees_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.employees));

COMMENT ON TABLE public.employees IS 'Unified table containing both user authentication and employee information';
COMMENT ON COLUMN public.employees.id IS 'Auto-increment primary key';
COMMENT ON COLUMN public.employees.ma_nv IS 'Employee code (unique)';
COMMENT ON COLUMN public.employees.username IS 'Login username';
COMMENT ON COLUMN public.employees.hashed_password IS 'Hashed password for authentication';
COMMENT ON COLUMN public.employees.ho_ten IS 'Full name in Vietnamese';
COMMENT ON COLUMN public.employees.full_name IS 'Full name in English (optional)';
COMMENT ON COLUMN public.employees.email IS 'Email address (unique)';
COMMENT ON COLUMN public.employees.role_id IS 'Foreign key to roles table';
COMMENT ON COLUMN public.employees.department_id IS 'Foreign key to departments table';
COMMENT ON COLUMN public.employees.luong_hop_dong IS 'Contract salary amount';
COMMENT ON COLUMN public.employees.muc_luong_dong_bhxh IS 'Salary amount for social insurance calculation';
COMMENT ON COLUMN public.employees.so_nguoi_phu_thuoc IS 'Number of dependents for tax calculation';
COMMENT ON COLUMN public.employees.is_active IS 'Whether the employee account is active';
