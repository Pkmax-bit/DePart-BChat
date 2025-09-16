# PAYROLL DATABASE SCHEMA

## 📋 Tổng quan

File `create_payroll_tables.sql` chứa schema hoàn chỉnh cho hệ thống quản lý lương nhân viên bao gồm:

- **nhan_vien**: Thông tin nhân viên
- **bang_cham_cong**: Bảng chấm công
- **luong_san_pham**: Lương theo sản phẩm
- **phieu_luong**: Phiếu lương

## 🚀 Cách sử dụng

### 1. Chạy trên Supabase
```sql
-- Copy toàn bộ nội dung file create_payroll_tables.sql
-- Paste vào SQL Editor của Supabase và chạy
```

### 2. Chạy bằng command line
```bash
# Nếu có psql
psql -h your-host -U your-user -d your-database -f create_payroll_tables.sql

# Hoặc import vào Supabase SQL Editor
```

## 📊 Cấu trúc bảng

### NHAN_VIEN (Nhân viên)
| Column | Type | Description |
|--------|------|-------------|
| ma_nv | VARCHAR(50) | Mã nhân viên (PK) |
| ho_ten | VARCHAR(255) | Họ tên |
| chuc_vu | VARCHAR(255) | Chức vụ |
| phong_ban | VARCHAR(255) | Phòng ban |
| luong_hop_dong | DECIMAL | Lương hợp đồng |
| muc_luong_dong_bhxh | DECIMAL | Mức lương đóng BHXH |
| so_nguoi_phu_thuoc | INTEGER | Số người phụ thuộc |
| email | VARCHAR(255) | Email |
| dien_thoai | VARCHAR(20) | Điện thoại |
| dia_chi | TEXT | Địa chỉ |
| ngay_vao_lam | DATE | Ngày vào làm |
| is_active | BOOLEAN | Trạng thái hoạt động |

### BANG_CHAM_CONG (Chấm công)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | ID tự tăng (PK) |
| ma_nv | VARCHAR(50) | Mã nhân viên (FK) |
| ky_tinh_luong | VARCHAR(7) | Kỳ tính lương (YYYY-MM) |
| ngay_cong_chuan | DECIMAL | Ngày công chuẩn |
| ngay_cong_thuc_te | DECIMAL | Ngày công thực tế |
| gio_ot_ngay_thuong | DECIMAL | Giờ OT ngày thường |
| gio_ot_cuoi_tuan | DECIMAL | Giờ OT cuối tuần |
| gio_ot_le_tet | DECIMAL | Giờ OT lễ tết |
| ghi_chu | TEXT | Ghi chú |

### LUONG_SAN_PHAM (Lương sản phẩm)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | ID tự tăng (PK) |
| ma_nv | VARCHAR(50) | Mã nhân viên (FK) |
| ky_tinh_luong | VARCHAR(7) | Kỳ tính lương |
| san_pham_id | VARCHAR(100) | ID sản phẩm |
| ten_san_pham | VARCHAR(255) | Tên sản phẩm |
| so_luong | DECIMAL | Số lượng |
| don_gia | DECIMAL | Đơn giá |
| thanh_tien | DECIMAL | Thành tiền (tính tự động) |

### PHIEU_LUONG (Phiếu lương)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | ID tự tăng (PK) |
| ma_nv | VARCHAR(50) | Mã nhân viên (FK) |
| ky_tinh_luong | VARCHAR(7) | Kỳ tính lương |
| tong_thu_nhap | DECIMAL | Tổng thu nhập |
| tong_khau_tru | DECIMAL | Tổng khấu trừ |
| luong_thuc_nhan | DECIMAL | Lương thực nhận |
| chi_tiet_thu_nhap | JSONB | Chi tiết thu nhập |
| chi_tiet_khau_tru | JSONB | Chi tiết khấu trừ |
| trang_thai | VARCHAR(50) | Trạng thái |
| ngay_tao | TIMESTAMP | Ngày tạo |
| ngay_duyet | TIMESTAMP | Ngày duyệt |
| nguoi_duyet | VARCHAR(255) | Người duyệt |

## 🔗 Relationships

```
nhan_vien (ma_nv)
├── bang_cham_cong (ma_nv) [1:N]
├── luong_san_pham (ma_nv) [1:N]
└── phieu_luong (ma_nv) [1:N]
```

## 📈 Indexes

- **nhan_vien**: ma_nv, phong_ban, is_active
- **bang_cham_cong**: ma_nv, ky_tinh_luong, (ma_nv, ky_tinh_luong)
- **luong_san_pham**: ma_nv, ky_tinh_luong, san_pham_id, (ma_nv, ky_tinh_luong)
- **phieu_luong**: ma_nv, ky_tinh_luong, trang_thai, (ma_nv, ky_tinh_luong)

## 🔄 Triggers

- **updated_at**: Tự động cập nhật timestamp khi record thay đổi

## 📝 Sample Data

File SQL bao gồm dữ liệu mẫu cho:
- 3 nhân viên
- Dữ liệu chấm công tháng 9/2024
- Dữ liệu lương sản phẩm

## ⚠️ Lưu ý

1. **Foreign Keys**: Các bảng con tham chiếu đến `nhan_vien.ma_nv`
2. **Unique Constraints**: `phieu_luong` có unique trên (ma_nv, ky_tinh_luong)
3. **Generated Columns**: `luong_san_pham.thanh_tien` tự động tính
4. **JSONB Fields**: `phieu_luong.chi_tiet_*` lưu dữ liệu JSON

## 🛠️ Maintenance

### Thêm nhân viên mới
```sql
INSERT INTO nhan_vien (ma_nv, ho_ten, luong_hop_dong, muc_luong_dong_bhxh)
VALUES ('NV004', 'Tên nhân viên', 15000000, 12000000);
```

### Thêm dữ liệu chấm công
```sql
INSERT INTO bang_cham_cong (ma_nv, ky_tinh_luong, ngay_cong_chuan, ngay_cong_thuc_te)
VALUES ('NV004', '2024-09', 22, 22);
```

### Tính lương
Sử dụng API endpoint `/api/v1/payroll/tinh-luong` để tính lương tự động.