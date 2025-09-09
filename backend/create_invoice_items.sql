
-- Tạo bảng invoice_items nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER,
    id_nhom VARCHAR(50),
    id_kinh VARCHAR(50),
    id_taynam VARCHAR(50),
    id_bophan VARCHAR(50),
    sanpham_id VARCHAR(100),
    ngang INTEGER,
    cao INTEGER,
    sau INTEGER,
    so_luong INTEGER DEFAULT 1,
    don_gia DECIMAL(15,2),
    dien_tich_ke_hoach DECIMAL(15,2),
    dien_tich_thuc_te DECIMAL(15,2),
    ti_le DECIMAL(5,4),
    thanh_tien DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm một bản ghi test
INSERT INTO invoice_items (id_nhom, id_kinh, id_taynam, id_bophan, sanpham_id, ngang, cao, sau, so_luong, don_gia, thanh_tien)
VALUES ('TEST', 'TEST', 'TEST', 'TEST', 'TEST123', 100, 200, 300, 1, 100000, 100000)
ON CONFLICT DO NOTHING;
