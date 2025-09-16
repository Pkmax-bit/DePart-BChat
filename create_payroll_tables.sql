-- ===========================================
-- DATABASE SCHEMA FOR PAYROLL SYSTEM
-- Hệ thống quản lý lương nhân viên
-- ===========================================

-- ===========================================
-- 1. BẢNG NHÂN VIÊN (Employees)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.nhan_vien (
    ma_nv VARCHAR(50) PRIMARY KEY,
    ho_ten VARCHAR(255) NOT NULL,
    chuc_vu VARCHAR(255),
    phong_ban VARCHAR(255),
    luong_hop_dong DECIMAL(15,2) NOT NULL,
    muc_luong_dong_bhxh DECIMAL(15,2) NOT NULL,
    so_nguoi_phu_thuoc INTEGER DEFAULT 0,
    email VARCHAR(255),
    dien_thoai VARCHAR(20),
    dia_chi TEXT,
    ngay_vao_lam DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ===========================================
-- 2. BẢNG CHẤM CÔNG (Timesheets)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.bang_cham_cong (
    id BIGSERIAL PRIMARY KEY,
    ma_nv VARCHAR(50) NOT NULL REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
    ky_tinh_luong VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    ngay_cong_chuan DECIMAL(5,2) NOT NULL,
    ngay_cong_thuc_te DECIMAL(5,2) NOT NULL,
    gio_ot_ngay_thuong DECIMAL(5,2) DEFAULT 0,
    gio_ot_cuoi_tuan DECIMAL(5,2) DEFAULT 0,
    gio_ot_le_tet DECIMAL(5,2) DEFAULT 0,
    ghi_chu TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ===========================================
-- 3. BẢNG LƯƠNG SẢN PHẨM (Product Salary)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.luong_san_pham (
    id BIGSERIAL PRIMARY KEY,
    ma_nv VARCHAR(50) NOT NULL REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
    ky_tinh_luong VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    san_pham_id VARCHAR(100) NOT NULL,
    ten_san_pham VARCHAR(255),
    so_luong DECIMAL(10,2) NOT NULL,
    don_gia DECIMAL(15,2) NOT NULL,
    thanh_tien DECIMAL(15,2) GENERATED ALWAYS AS (so_luong * don_gia) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ===========================================
-- 4. BẢNG PHIẾU LƯƠNG (Payslips)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.phieu_luong (
    id BIGSERIAL PRIMARY KEY,
    ma_nv VARCHAR(50) NOT NULL REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
    ky_tinh_luong VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    tong_thu_nhap DECIMAL(15,2) NOT NULL,
    tong_khau_tru DECIMAL(15,2) NOT NULL,
    luong_thuc_nhan DECIMAL(15,2) NOT NULL,
    chi_tiet_thu_nhap JSONB,
    chi_tiet_khau_tru JSONB,
    trang_thai VARCHAR(50) DEFAULT 'draft',
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    ngay_duyet TIMESTAMP WITH TIME ZONE,
    nguoi_duyet VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(ma_nv, ky_tinh_luong)
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Nhân viên
CREATE INDEX IF NOT EXISTS idx_nhan_vien_ma_nv ON public.nhan_vien(ma_nv);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_phong_ban ON public.nhan_vien(phong_ban);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_is_active ON public.nhan_vien(is_active);

-- Chấm công
CREATE INDEX IF NOT EXISTS idx_bang_cham_cong_ma_nv ON public.bang_cham_cong(ma_nv);
CREATE INDEX IF NOT EXISTS idx_bang_cham_cong_ky_tinh_luong ON public.bang_cham_cong(ky_tinh_luong);
CREATE INDEX IF NOT EXISTS idx_bang_cham_cong_ma_nv_ky ON public.bang_cham_cong(ma_nv, ky_tinh_luong);

-- Lương sản phẩm
CREATE INDEX IF NOT EXISTS idx_luong_san_pham_ma_nv ON public.luong_san_pham(ma_nv);
CREATE INDEX IF NOT EXISTS idx_luong_san_pham_ky_tinh_luong ON public.luong_san_pham(ky_tinh_luong);
CREATE INDEX IF NOT EXISTS idx_luong_san_pham_ma_nv_ky ON public.luong_san_pham(ma_nv, ky_tinh_luong);
CREATE INDEX IF NOT EXISTS idx_luong_san_pham_san_pham_id ON public.luong_san_pham(san_pham_id);

-- Phiếu lương
CREATE INDEX IF NOT EXISTS idx_phieu_luong_ma_nv ON public.phieu_luong(ma_nv);
CREATE INDEX IF NOT EXISTS idx_phieu_luong_ky_tinh_luong ON public.phieu_luong(ky_tinh_luong);
CREATE INDEX IF NOT EXISTS idx_phieu_luong_trang_thai ON public.phieu_luong(trang_thai);
CREATE INDEX IF NOT EXISTS idx_phieu_luong_ma_nv_ky ON public.phieu_luong(ma_nv, ky_tinh_luong);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

-- Trigger cho bảng nhan_vien
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nhan_vien_updated_at
    BEFORE UPDATE ON public.nhan_vien
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bang_cham_cong_updated_at
    BEFORE UPDATE ON public.bang_cham_cong
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_luong_san_pham_updated_at
    BEFORE UPDATE ON public.luong_san_pham
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phieu_luong_updated_at
    BEFORE UPDATE ON public.phieu_luong
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SAMPLE DATA (Dữ liệu mẫu)
-- ===========================================

-- Thêm nhân viên mẫu
INSERT INTO public.nhan_vien (ma_nv, ho_ten, chuc_vu, phong_ban, luong_hop_dong, muc_luong_dong_bhxh, so_nguoi_phu_thuoc, email, dien_thoai)
VALUES
    ('NV001', 'Nguyễn Văn A', 'Nhân viên kinh doanh', 'Kinh doanh', 15000000, 12000000, 1, 'nguyenvana@company.com', '0987654321'),
    ('NV002', 'Trần Thị B', 'Kỹ sư phần mềm', 'Kỹ thuật', 18000000, 15000000, 0, 'tranthib@company.com', '0987654322'),
    ('NV003', 'Lê Văn C', 'Nhân viên hành chính', 'Hành chính', 12000000, 10000000, 2, 'levanc@company.com', '0987654323')
ON CONFLICT (ma_nv) DO NOTHING;

-- Thêm dữ liệu chấm công mẫu
INSERT INTO public.bang_cham_cong (ma_nv, ky_tinh_luong, ngay_cong_chuan, ngay_cong_thuc_te, gio_ot_ngay_thuong, gio_ot_cuoi_tuan)
VALUES
    ('NV001', '2024-09', 22, 22, 5, 8),
    ('NV002', '2024-09', 22, 20, 10, 4),
    ('NV003', '2024-09', 22, 22, 2, 0)
ON CONFLICT DO NOTHING;

-- Thêm dữ liệu lương sản phẩm mẫu
INSERT INTO public.luong_san_pham (ma_nv, ky_tinh_luong, san_pham_id, ten_san_pham, so_luong, don_gia)
VALUES
    ('NV001', '2024-09', 'SP001', 'Sản phẩm A', 100, 50000),
    ('NV002', '2024-09', 'SP002', 'Sản phẩm B', 50, 80000),
    ('NV001', '2024-09', 'SP003', 'Sản phẩm C', 75, 60000)
ON CONFLICT DO NOTHING;

-- ===========================================
-- COMMENTS
-- ===========================================

COMMENT ON TABLE public.nhan_vien IS 'Bảng chứa thông tin nhân viên';
COMMENT ON TABLE public.bang_cham_cong IS 'Bảng chấm công và giờ làm việc';
COMMENT ON TABLE public.luong_san_pham IS 'Bảng lương theo sản phẩm';
COMMENT ON TABLE public.phieu_luong IS 'Bảng phiếu lương đã tính toán';

COMMENT ON COLUMN public.nhan_vien.ma_nv IS 'Mã nhân viên (khóa chính)';
COMMENT ON COLUMN public.nhan_vien.luong_hop_dong IS 'Lương theo hợp đồng';
COMMENT ON COLUMN public.nhan_vien.muc_luong_dong_bhxh IS 'Mức lương dùng để tính BHXH';
COMMENT ON COLUMN public.bang_cham_cong.ky_tinh_luong IS 'Kỳ tính lương dạng YYYY-MM';
COMMENT ON COLUMN public.phieu_luong.chi_tiet_thu_nhap IS 'JSON chi tiết các khoản thu nhập';
COMMENT ON COLUMN public.phieu_luong.chi_tiet_khau_tru IS 'JSON chi tiết các khoản khấu trừ';

-- ===========================================
-- END OF FILE
-- ===========================================