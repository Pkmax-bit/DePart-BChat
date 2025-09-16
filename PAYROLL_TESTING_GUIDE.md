# Payroll Management Testing Guide

## 🎯 Test Overview
Hệ thống quản lý tính lương đã được tích hợp đầy đủ với dữ liệu mẫu. Bạn có thể test tất cả các chức năng CRUD thông qua giao diện web.

## 📊 Dữ liệu mẫu có sẵn:
- **4 nhân viên**: NV001, NV002, NV003, NV004
- **4 bảng chấm công**: Tháng 2025-09
- **4 bản ghi lương sản phẩm**: Các sản phẩm khác nhau
- **Tổng OT**: 50 giờ
- **Tổng giá trị sản phẩm**: 27,500,000 VND

## 🧪 Test Cases

### 1. **Tab Nhân viên (Employees)**
- ✅ **Xem danh sách**: Hiển thị 4 nhân viên với thông tin đầy đủ
- ✅ **Tìm kiếm**: Test tìm theo tên, mã NV, email
- ✅ **Thêm nhân viên**: Click "Thêm nhân viên" → Điền form → Lưu
- ✅ **Sửa nhân viên**: Click icon edit → Thay đổi thông tin → Cập nhật
- ✅ **Xóa nhân viên**: Click icon delete → Xác nhận xóa

### 2. **Tab Chấm công (Timesheets)**
- ✅ **Xem danh sách**: Hiển thị dữ liệu chấm công tháng 2025-09
- ✅ **Thay đổi kỳ lương**: Chọn tháng khác trong dropdown
- ✅ **Tìm kiếm**: Test tìm theo tên nhân viên
- ✅ **Thêm chấm công**: Click "Thêm chấm công" → Chọn nhân viên → Điền dữ liệu
- ✅ **Sửa chấm công**: Click edit → Thay đổi số công/OT
- ✅ **Xóa chấm công**: Click delete → Xác nhận

### 3. **Tab Lương sản phẩm (Product Salary)**
- ✅ **Xem danh sách**: Hiển thị 4 bản ghi với tổng tiền tự động tính
- ✅ **Tìm kiếm**: Test tìm theo tên nhân viên hoặc tháng
- ✅ **Thêm lương sản phẩm**: Click "Thêm lương sản phẩm" → Điền form
- ✅ **Tự động tính tổng**: Kiểm tra tổng tiền = số lượng × đơn giá
- ✅ **Xóa bản ghi**: Click delete → Xác nhận

### 4. **Tab Tính lương (Salary Calculation)**
- ✅ **Chọn nhân viên**: Dropdown hiển thị 4 nhân viên
- ✅ **Tính lương**: Chọn nhân viên → Click "Tính lương"
- ✅ **Xem phiếu lương**: Hiển thị chi tiết thu nhập/khấu trừ
- ✅ **Lưu lịch sử**: Tự động tạo phiếu lương trong database

### 5. **Tab Tổng quan (Overview)**
- ✅ **Thống kê**: Hiển thị tổng lương, số nhân viên, lương TB
- ✅ **Biểu đồ**: Bar chart lương theo nhân viên
- ✅ **Thay đổi tháng**: Test với các tháng khác nhau

### 6. **Tab Báo cáo (Reports)**
- ✅ **Xuất Excel**: Click "Xuất Excel" → Download file lương tháng hiện tại
- ✅ **Bảng lương**: Hiển thị tất cả phiếu lương đã tính

## 🚀 Cách test:

1. **Truy cập**: http://localhost:3001/dashboard/payroll/salary
2. **Login**: Nếu cần đăng nhập
3. **Navigate tabs**: Click từng tab để test
4. **Test CRUD**: Thêm/sửa/xóa dữ liệu
5. **Test tính lương**: Chọn nhân viên và tính lương
6. **Test export**: Xuất báo cáo Excel

## 🔧 Troubleshooting:

- **Không thấy dữ liệu**: Chạy lại `python reset_sample_payroll_data.py`
- **Frontend không load**: Restart `npm run dev`
- **API lỗi**: Kiểm tra backend chạy trên port 8001

## ✅ Expected Results:

- Tất cả tabs hiển thị dữ liệu mẫu
- CRUD operations hoạt động bình thường
- Tính lương tạo phiếu lương mới
- Export Excel tải file thành công
- UI/UX consistent với các trang tài chính khác

## 🎉 Success Criteria:

- [ ] Xem được danh sách nhân viên, chấm công, lương sản phẩm
- [ ] Thêm/sửa/xóa dữ liệu thành công
- [ ] Tính lương cho nhân viên hoạt động
- [ ] Xuất báo cáo Excel thành công
- [ ] Giao diện đồng nhất và responsive