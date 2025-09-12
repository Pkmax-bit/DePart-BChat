-- Tạo bảng cho hệ thống quản lý phụ kiện bếp (thiết bị bếp)

-- Bảng loại phụ kiện bếp
CREATE TABLE IF NOT EXISTS loaiphukienbep (
    id SERIAL PRIMARY KEY,
    tenloai VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phụ kiện bếp
CREATE TABLE IF NOT EXISTS phukienbep (
    id SERIAL PRIMARY KEY,
    id_loaiphukien INTEGER REFERENCES loaiphukienbep(id),
    tenphukien VARCHAR(255) NOT NULL,
    thuong_hieu VARCHAR(255),
    model VARCHAR(255),
    cong_suat VARCHAR(100),
    kich_thuoc VARCHAR(100),
    trong_luong DECIMAL(10,2),
    don_gia DECIMAL(15,2) NOT NULL,
    mo_ta TEXT,
    hinh_anh TEXT,
    thong_so_ky_thuat TEXT,
    bao_hanh VARCHAR(100),
    xuat_xu VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm cột phân loại vào bảng invoice_items để phân biệt sản phẩm tủ bếp và phụ kiện bếp
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS loai_san_pham VARCHAR(50) DEFAULT 'tu_bep',
ADD COLUMN IF NOT EXISTS id_phukien INTEGER REFERENCES phukienbep(id);

-- Thêm một số dữ liệu mẫu cho loại phụ kiện bếp
INSERT INTO loaiphukienbep (tenloai, mo_ta) VALUES
('Bếp từ', 'Bếp từ các loại công suất khác nhau'),
('Lò nướng', 'Lò nướng âm tường và độc lập'),
('Máy rửa bát', 'Máy rửa bát gia dụng'),
('Tủ lạnh', 'Tủ lạnh các loại dung tích'),
('Máy lọc nước', 'Máy lọc nước tinh khiết'),
('Máy pha cà phê', 'Máy pha cà phê tự động'),
('Lò vi sóng', 'Lò vi sóng các loại'),
('Máy xay sinh tố', 'Máy xay sinh tố công nghiệp')
ON CONFLICT DO NOTHING;

-- Thêm một số dữ liệu mẫu cho phụ kiện bếp
INSERT INTO phukienbep (id_loaiphukien, tenphukien, thuong_hieu, model, cong_suat, kich_thuoc, trong_luong, don_gia, mo_ta, bao_hanh) VALUES
(1, 'Bếp từ Electrolux', 'Electrolux', 'EHI6450F', '6.4 kW', '59x52x5 cm', 8.5, 8500000, 'Bếp từ âm tường Electrolux 4 vùng nấu', '2 năm'),
(1, 'Bếp từ Bosch', 'Bosch', 'PKE611D17E', '4.6 kW', '60x52x5 cm', 7.2, 6500000, 'Bếp từ Bosch 4 vùng nấu với timer', '2 năm'),
(2, 'Lò nướng Bosch', 'Bosch', 'HBG633BS1', '3.3 kW', '60x55x55 cm', 32.5, 18500000, 'Lò nướng Bosch âm tường 71L', '2 năm'),
(2, 'Lò nướng Electrolux', 'Electrolux', 'EVY7800AAX', '3.5 kW', '60x57x55 cm', 35.0, 22000000, 'Lò nướng Electrolux 78L với Pyrolytic', '2 năm'),
(3, 'Máy rửa bát Bosch', 'Bosch', 'SMS46MI01E', '2.4 kW', '60x60x85 cm', 42.0, 16500000, 'Máy rửa bát Bosch 13 bộ đồ ăn', '2 năm'),
(4, 'Tủ lạnh Samsung', 'Samsung', 'RT38K5932S8', '150W', '68x67x185 cm', 75.0, 18900000, 'Tủ lạnh Samsung Inverter 380L', '3 năm'),
(5, 'Máy lọc nước Kangaroo', 'Kangaroo', 'KG100A', '50W', '30x40x100 cm', 15.0, 4500000, 'Máy lọc nước Kangaroo 10 lõi lọc', '1 năm')
ON CONFLICT DO NOTHING;</content>
<parameter name="filePath">d:\Project\Department-botchat\backend\create_phukienbep_tables.sql
