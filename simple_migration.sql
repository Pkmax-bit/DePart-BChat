-- Simplified migration script to merge users and nhan_vien tables
-- Run this step by step to avoid transaction issues

-- Step 1: Create the employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 2,
    department_id INTEGER REFERENCES departments(id),

    -- Employee-specific fields
    employee_code VARCHAR(50) UNIQUE,
    position VARCHAR(255),
    salary DECIMAL(15,2),
    hire_date DATE,

    -- Status and timestamps
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);

-- Step 3: Migrate data from users table
INSERT INTO employees (
    id, username, email, hashed_password, full_name, role_id, department_id, is_active, created_at, updated_at
)
SELECT
    id, username, email, hashed_password, full_name, role_id, department_id, is_active, created_at, updated_at
FROM users;

-- Step 4: Update with nhan_vien data where user_id matches
UPDATE employees
SET
    employee_code = nv.ma_nv,
    position = nv.chuc_vu,
    salary = nv.luong_hop_dong,
    hire_date = nv.ngay_vao_lam::DATE,
    updated_at = CURRENT_TIMESTAMP
FROM nhan_vien nv
WHERE employees.id = nv.user_id;

-- Step 5: Handle orphaned nhan_vien records
INSERT INTO employees (
    username, email, hashed_password, full_name, role_id,
    employee_code, position, salary, hire_date, is_active, created_at, updated_at
)
SELECT
    LOWER(REPLACE(nv.ma_nv, ' ', '_')) as username,
    COALESCE(nv.email, nv.ma_nv || '@company.local') as email,
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8GqH3K3Qy' as hashed_password,
    nv.ho_ten as full_name,
    2 as role_id,
    nv.ma_nv, nv.chuc_vu, nv.luong_hop_dong, nv.ngay_vao_lam::DATE, nv.is_active, nv.created_at, nv.updated_at
FROM nhan_vien nv
WHERE nv.user_id IS NULL;

-- Step 6: Create backward compatibility views
CREATE OR REPLACE VIEW users_view AS
SELECT
    id, username, email, hashed_password, full_name, role_id, department_id, is_active, created_at, updated_at
FROM employees;

CREATE OR REPLACE VIEW nhan_vien_view AS
SELECT
    employee_code as ma_nv, full_name as ho_ten, position as chuc_vu, salary as luong_hop_dong,
    hire_date as ngay_vao_lam, is_active, id as user_id, created_at, updated_at
FROM employees
WHERE employee_code IS NOT NULL;

-- Step 7: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();