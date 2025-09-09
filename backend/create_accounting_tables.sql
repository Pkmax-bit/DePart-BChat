-- Tạo các bảng cho hệ thống quản lý tủ bếp

-- Bảng loại nhôm
CREATE TABLE IF NOT EXISTS loainhom (
    id SERIAL PRIMARY KEY,
    tenloai VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng loại kính
CREATE TABLE IF NOT EXISTS loaikinh (
    id SERIAL PRIMARY KEY,
    tenloai VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng loại tay nắm
CREATE TABLE IF NOT EXISTS loaitaynam (
    id SERIAL PRIMARY KEY,
    tenloai VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bộ phận
CREATE TABLE IF NOT EXISTS bophan (
    id SERIAL PRIMARY KEY,
    tenloai VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sản phẩm
CREATE TABLE IF NOT EXISTS sanpham (
    id SERIAL PRIMARY KEY,
    id_nhom INTEGER REFERENCES loainhom(id),
    id_kinh INTEGER REFERENCES loaikinh(id),
    id_taynam INTEGER REFERENCES loaitaynam(id),
    id_bophan INTEGER REFERENCES bophan(id),
    tensp VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chi tiết sản phẩm
CREATE TABLE IF NOT EXISTS chitietsanpham (
    id SERIAL PRIMARY KEY,
    id_sanpham INTEGER REFERENCES sanpham(id),
    ngang INTEGER NOT NULL, -- chiều ngang
    cao INTEGER NOT NULL, -- chiều cao
    sau INTEGER NOT NULL, -- chiều sâu
    don_gia DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm một số dữ liệu mẫu
INSERT INTO loainhom (tenloai) VALUES
('Nhôm 6063'),
('Nhôm 6061'),
('Nhôm 7075')
ON CONFLICT DO NOTHING;

INSERT INTO loaikinh (tenloai) VALUES
('Kính cường lực 5mm'),
('Kính cường lực 8mm'),
('Kính cường lực 10mm')
ON CONFLICT DO NOTHING;

INSERT INTO loaitaynam (tenloai) VALUES
('Tay nắm inox'),
('Tay nắm gỗ'),
('Tay nắm nhựa')
ON CONFLICT DO NOTHING;

INSERT INTO bophan (tenloai) VALUES
('Cửa tủ'),
('Ngăn kéo'),
('Khung tủ')
ON CONFLICT DO NOTHING;

-- Thêm sản phẩm mẫu
INSERT INTO sanpham (id_nhom, id_kinh, id_taynam, id_bophan, tensp) VALUES
(1, 1, 1, 1, 'Tủ bếp 1 cánh'),
(1, 2, 2, 2, 'Tủ bếp 2 cánh'),
(2, 1, 1, 3, 'Tủ bếp góc')
ON CONFLICT DO NOTHING;

-- Thêm chi tiết sản phẩm mẫu
INSERT INTO chitietsanpham (id_sanpham, ngang, cao, sau, don_gia) VALUES
(1, 600, 700, 500, 1500000.00),
(2, 800, 750, 550, 2200000.00),
(3, 1000, 800, 600, 2800000.00)
ON CONFLICT DO NOTHING;

-- Bảng hóa đơn
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    invoice_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chi tiết hóa đơn
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
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