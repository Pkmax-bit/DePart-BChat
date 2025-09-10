-- Tạo các bảng cho hệ thống quản lý chi phí

-- Bảng loại chi phí
CREATE TABLE IF NOT EXISTS loaichiphi (
    id SERIAL PRIMARY KEY,
    ten_loai VARCHAR(255) NOT NULL,
    loai_phi VARCHAR(50) NOT NULL CHECK (loai_phi IN ('cố định', 'biến phí')),
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng quản lý chi phí
CREATE TABLE IF NOT EXISTS quanly_chiphi (
    id SERIAL PRIMARY KEY,
    id_loai_chiphi INTEGER REFERENCES loaichiphi(id),
    ten_chi_phi VARCHAR(255) NOT NULL,
    so_tien DECIMAL(15,2) NOT NULL,
    mo_ta TEXT,
    hinh_chung_minh TEXT, -- URL hoặc path đến hình ảnh chứng minh
    ngay_chi_phi DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm một số dữ liệu mẫu cho loại chi phí
INSERT INTO loaichiphi (ten_loai, loai_phi, mo_ta) VALUES
('Chi phí nguyên vật liệu', 'biến phí', 'Chi phí mua nguyên vật liệu sản xuất'),
('Chi phí nhân công', 'cố định', 'Chi phí trả lương nhân viên'),
('Chi phí vận chuyển', 'biến phí', 'Chi phí vận chuyển hàng hóa'),
('Chi phí marketing', 'biến phí', 'Chi phí quảng cáo và marketing'),
('Chi phí văn phòng', 'cố định', 'Chi phí hoạt động văn phòng'),
('Chi phí bảo trì', 'biến phí', 'Chi phí bảo trì thiết bị và cơ sở vật chất'),
('Chi phí điện nước', 'cố định', 'Chi phí tiền điện và nước'),
('Chi phí thuê mặt bằng', 'cố định', 'Chi phí thuê nhà xưởng và văn phòng')
ON CONFLICT DO NOTHING;

-- Thêm một số dữ liệu mẫu cho chi phí
INSERT INTO quanly_chiphi (id_loai_chiphi, ten_chi_phi, so_tien, mo_ta, hinh_chung_minh, ngay_chi_phi) VALUES
(1, 'Mua nhôm 6063', 5000000.00, 'Mua nhôm cho sản xuất tủ bếp', '/images/hoa_don_nhom.jpg', CURRENT_DATE - INTERVAL '5 days'),
(2, 'Lương nhân viên tháng 9', 15000000.00, 'Lương nhân viên sản xuất', '/images/bang_luong.jpg', CURRENT_DATE - INTERVAL '1 month'),
(3, 'Vận chuyển hàng hóa', 800000.00, 'Vận chuyển tủ bếp đến khách hàng', '/images/phieu_van_chuyen.jpg', CURRENT_DATE - INTERVAL '3 days'),
(4, 'Quảng cáo Facebook', 2000000.00, 'Chi phí quảng cáo sản phẩm', '/images/hoa_don_facebook.jpg', CURRENT_DATE - INTERVAL '10 days'),
(5, 'Điện nước văn phòng', 1200000.00, 'Tiền điện nước tháng 9', '/images/hoa_don_dien_nuoc.jpg', CURRENT_DATE - INTERVAL '1 month'),
(6, 'Bảo trì máy móc', 3000000.00, 'Bảo trì máy cắt nhôm', '/images/hoa_don_bao_tri.jpg', CURRENT_DATE - INTERVAL '15 days')
ON CONFLICT DO NOTHING;
