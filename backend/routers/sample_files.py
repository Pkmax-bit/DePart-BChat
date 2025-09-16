import pandas as pd
import os
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import tempfile
import io

router = APIRouter(
    prefix="/sample-files",
    tags=["Sample Files"]
)

def remove_file(path: str):
    """Remove the file at the given path."""
    try:
        os.unlink(path)
    except Exception as e:
        print(f"Error removing file {path}: {e}")

@router.get("/bulk-upload-template")
def download_bulk_upload_template(background_tasks: BackgroundTasks):
    """
    Tải file mẫu Excel cho việc upload nhân viên hàng loạt.
    """
    try:
        # Kiểm tra các thư viện cần thiết
        try:
            import pandas as pd
            import openpyxl
        except ImportError as e:
            print(f"Missing required library: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Thiếu thư viện cần thiết: {str(e)}")

        # Tạo dữ liệu mẫu với đầy đủ các cột cho nhân viên
        sample_data = {
            'username': ['nguyenvana', 'tranthib', 'levanc', 'phamthid'],
            'email': ['nguyenvana@company.com', 'tranthib@company.com', 'levanc@company.com', 'phamthid@company.com'],
            'password': ['123456', '123456', '123456', '123456'],
            'full_name': ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'],
            'department': ['Kỹ thuật', 'Kinh doanh', 'Nhân sự', 'Tài chính'],
            'ma_nv': ['NV0001', 'NV0002', 'NV0003', 'NV0004'],
            'chuc_vu': ['Developer', 'Sales Manager', 'HR Specialist', 'Accountant'],
            'phong_ban': ['IT', 'Sales', 'HR', 'Finance'],
            'luong_hop_dong': [15000000, 18000000, 12000000, 14000000],
            'muc_luong_dong_bhxh': [15000000, 18000000, 12000000, 14000000],
            'so_nguoi_phu_thuoc': [0, 1, 2, 0],
            'dien_thoai': ['0987654321', '0987654322', '0987654323', '0987654324'],
            'dia_chi': ['123 Đường ABC, Quận 1, TP.HCM', '456 Đường DEF, Quận 2, TP.HCM', '789 Đường GHI, Quận 3, TP.HCM', '101 Đường JKL, Quận 4, TP.HCM'],
            'ngay_vao_lam': ['2024-01-15', '2024-02-01', '2024-01-20', '2024-03-01']
        }

        df = pd.DataFrame(sample_data)

        # Tạo file tạm thời với cách an toàn hơn
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx', mode='w+b') as tmp_file:
                # Sử dụng BytesIO để tạo file trong memory trước
                buffer = io.BytesIO()
                df.to_excel(buffer, index=False, engine='openpyxl')
                buffer.seek(0)

                # Ghi vào file tạm thời
                tmp_file.write(buffer.getvalue())
                tmp_file_path = tmp_file.name

        except Exception as e:
            print(f"Error creating temporary file: {str(e)}")
            raise HTTPException(status_code=500, detail="Không thể tạo file tạm thời")

        # Thêm task để xóa file sau khi response được gửi
        background_tasks.add_task(remove_file, tmp_file_path)

        # Trả về file
        return FileResponse(
            path=tmp_file_path,
            filename="bulk_upload_template.xlsx",
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating sample file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Không thể tạo file mẫu: {str(e)}")
