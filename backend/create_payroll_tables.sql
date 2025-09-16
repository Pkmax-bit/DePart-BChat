-- Payroll Database Tables
-- Tạo bảng nhân viên
CREATE TABLE IF NOT EXISTS nhan_vien (
    ma_nv VARCHAR(20) PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    chuc_vu VARCHAR(50),
    phong_ban VARCHAR(50),
    luong_hop_dong DECIMAL(15,2) NOT NULL,
    muc_luong_dong_bhxh DECIMAL(15,2) NOT NULL,
    so_nguoi_phu_thuoc INT DEFAULT 0,
    email VARCHAR(100),
    dien_thoai VARCHAR(20),
    dia_chi TEXT,
    ngay_vao_lam DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng chấm công
CREATE TABLE IF NOT EXISTS bang_cham_cong (
    id SERIAL PRIMARY KEY,
    ma_nv VARCHAR(20) NOT NULL,
    ky_tinh_luong VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    ngay_cong_chuan DECIMAL(5,2) NOT NULL,
    ngay_cong_thuc_te DECIMAL(5,2) NOT NULL,
    gio_ot_ngay_thuong DECIMAL(5,2) DEFAULT 0,
    gio_ot_cuoi_tuan DECIMAL(5,2) DEFAULT 0,
    gio_ot_le_tet DECIMAL(5,2) DEFAULT 0,
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
    UNIQUE(ma_nv, ky_tinh_luong)
);

-- Tạo bảng lương sản phẩm
CREATE TABLE IF NOT EXISTS luong_san_pham (
    id SERIAL PRIMARY KEY,
    ma_nv VARCHAR(20) NOT NULL,
    ky_tinh_luong VARCHAR(10) NOT NULL,
    san_pham_id VARCHAR(50) NOT NULL,
    ten_san_pham VARCHAR(100),
    so_luong DECIMAL(10,2) NOT NULL,
    don_gia DECIMAL(15,2) NOT NULL,
    thanh_tien DECIMAL(15,2) GENERATED ALWAYS AS (so_luong * don_gia) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE
);

-- Tạo bảng phiếu lương (để lưu lịch sử)
CREATE TABLE IF NOT EXISTS phieu_luong (
    id SERIAL PRIMARY KEY,
    ma_nv VARCHAR(20) NOT NULL,
    ky_tinh_luong VARCHAR(10) NOT NULL,
    tong_thu_nhap DECIMAL(15,2),
    tong_khau_tru DECIMAL(15,2),
    luong_thuc_nhan DECIMAL(15,2),
    chi_tiet_thu_nhap JSONB,
    chi_tiet_khau_tru JSONB,
    trang_thai VARCHAR(20) DEFAULT 'draft', -- draft, approved, paid
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_duyet TIMESTAMP NULL,
    nguoi_duyet VARCHAR(100),
    FOREIGN KEY (ma_nv) REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
    UNIQUE(ma_nv, ky_tinh_luong)
);

-- Tạo indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_bang_cham_cong_ma_nv ON bang_cham_cong(ma_nv);
CREATE INDEX IF NOT EXISTS idx_bang_cham_cong_ky ON bang_cham_cong(ky_tinh_luong);
CREATE INDEX IF NOT EXISTS idx_luong_san_pham_ma_nv ON luong_san_pham(ma_nv);
CREATE INDEX IF NOT EXISTS idx_luong_san_pham_ky ON luong_san_pham(ky_tinh_luong);
CREATE INDEX IF NOT EXISTS idx_phieu_luong_ma_nv ON phieu_luong(ma_nv);
CREATE INDEX IF NOT EXISTS idx_phieu_luong_ky ON phieu_luong(ky_tinh_luong);