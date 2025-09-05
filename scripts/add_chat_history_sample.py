#!/usr/bin/env python3
"""
Script để thêm dữ liệu mẫu vào bảng chat_history
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.supabase_client import supabase
from datetime import datetime, timedelta
import random

def add_sample_chat_history():
    """Thêm dữ liệu mẫu vào bảng chat_history"""

    # Dữ liệu mẫu
    sample_data = [
        {
            "name_app": "Hỗ trợ IT",
            "user_message": "Máy tính của tôi bị chậm, bạn có thể giúp tôi không?",
            "bot_response": "Chào bạn! Để tôi giúp bạn khắc phục vấn đề máy tính chậm. Trước tiên, bạn có thể cho tôi biết cấu hình máy tính của bạn không?",
            "user_id": 1,
            "session_id": "session_001"
        },
        {
            "name_app": "Hỗ trợ IT",
            "user_message": "Tôi có Windows 10, RAM 8GB, ổ cứng SSD 256GB",
            "bot_response": "Cảm ơn bạn đã cung cấp thông tin. Với cấu hình này, máy tính của bạn khá tốt. Bạn có thể thử các bước sau:\n\n1. Khởi động lại máy tính\n2. Dọn dẹp disk (Disk Cleanup)\n3. Tắt các chương trình không cần thiết\n4. Cập nhật Windows\n\nNếu vẫn chậm, bạn có thể mang máy đến phòng IT để kiểm tra thêm.",
            "user_id": 1,
            "session_id": "session_001"
        },
        {
            "name_app": "Chatbot HR",
            "user_message": "Tôi muốn xin nghỉ phép 3 ngày",
            "bot_response": "Chào bạn! Để xin nghỉ phép, bạn cần làm theo quy trình sau:\n\n1. Gửi email cho quản lý trực tiếp với lý do nghỉ phép\n2. CC cho bộ phận HR\n3. Chờ phê duyệt từ quản lý\n\nBạn đã làm những bước nào rồi?",
            "user_id": 2,
            "session_id": "session_002"
        },
        {
            "name_app": "Chatbot HR",
            "user_message": "Tôi đã gửi email cho quản lý rồi, giờ phải làm sao?",
            "bot_response": "Tuyệt vời! Bạn đã hoàn thành bước đầu tiên. Bây giờ:\n\n1. Chờ phản hồi từ quản lý (thường trong vòng 24h)\n2. Nếu được phê duyệt, HR sẽ cập nhật vào hệ thống\n3. Bạn sẽ nhận được xác nhận qua email\n\nNếu cần gấp, bạn có thể liên hệ trực tiếp với quản lý qua điện thoại.",
            "user_id": 2,
            "session_id": "session_002"
        },
        {
            "name_app": "Chatbot Sales",
            "user_message": "Tôi cần báo giá cho khách hàng ABC Corp",
            "bot_response": "Chào bạn! Để báo giá cho khách hàng, bạn cần cung cấp thông tin sau:\n\n1. Tên công ty và người liên hệ\n2. Sản phẩm/dịch vụ yêu cầu\n3. Số lượng và yêu cầu đặc biệt\n4. Thời hạn cần báo giá\n\nBạn có thể cho tôi biết chi tiết không?",
            "user_id": 3,
            "session_id": "session_003"
        },
        {
            "name_app": "Chatbot Sales",
            "user_message": "Khách hàng ABC Corp cần báo giá cho 50 máy tính laptop, giao trong tháng này",
            "bot_response": "Cảm ơn bạn đã cung cấp thông tin chi tiết! Tôi sẽ tạo báo giá cho bạn:\n\n📋 Báo giá cho ABC Corp:\n- Sản phẩm: Laptop Dell Latitude 5420\n- Số lượng: 50 chiếc\n- Đơn giá: 25,000,000 VND/chiếc\n- Tổng cộng: 1,250,000,000 VND\n- Thời hạn giao: Trong tháng 9/2025\n- Bảo hành: 3 năm\n\nBạn có muốn tôi gửi báo giá này qua email không?",
            "user_id": 3,
            "session_id": "session_003"
        },
        {
            "name_app": "Chatbot Marketing",
            "user_message": "Tôi cần ý tưởng cho chiến dịch marketing tháng 10",
            "bot_response": "Tuyệt vời! Tháng 10 là thời điểm tốt cho các chiến dịch marketing. Dưới đây là một số ý tưởng:\n\n🎯 Chiến dịch Halloween:\n- Theme: 'Trick or Treat with Technology'\n- Nội dung: Khuyến mãi spooky cho sản phẩm công nghệ\n- Kênh: Social media, email, website\n\n📈 Chiến dịch Back-to-School:\n- Mục tiêu: Sinh viên và phụ huynh\n- Khuyến mãi: Giảm giá laptop, tablet\n- Thời gian: Đầu tháng 10\n\nBạn muốn tập trung vào ý tưởng nào?",
            "user_id": 4,
            "session_id": "session_004"
        },
        {
            "name_app": "Chatbot Marketing",
            "user_message": "Tôi thích ý tưởng Halloween, bạn có thể chi tiết hơn không?",
            "bot_response": "Tuyệt vời! Đây là kế hoạch chi tiết cho chiến dịch Halloween:\n\n🎃 CHIẾN DỊCH 'TECH HALLOWEEN 2025'\n\n📅 Thời gian: 15/10 - 31/10/2025\n\n🎯 Mục tiêu:\n- Tăng doanh số 30%\n- Tăng tương tác social media 50%\n- Thu thập 1000 email mới\n\n💡 Ý tưởng chính:\n- 'Trick or Treat': Mua 1 tặng 1 với sản phẩm công nghệ\n- 'Ghost in the Machine': Khuyến mãi bất ngờ\n- 'Witch's Brew': Combo sản phẩm đặc biệt\n\n📢 Kế hoạch thực hiện:\n1. Thiết kế banner và content\n2. Setup landing page\n3. Quảng bá trên social media\n4. Email marketing\n5. Sự kiện offline\n\nBạn cần hỗ trợ gì thêm không?",
            "user_id": 4,
            "session_id": "session_004"
        }
    ]

    try:
        # Thêm dữ liệu vào bảng chat_history
        for i, data in enumerate(sample_data):
            # Thêm created_at (giảm dần để có thứ tự thời gian)
            data['created_at'] = (datetime.now() - timedelta(minutes=i*5)).isoformat()

            result = supabase.table('chat_history').insert(data).execute()
            print(f"✅ Đã thêm chat history {i+1}: {data['name_app']} - {data['user_message'][:50]}...")

        print("\n🎉 Đã thêm thành công tất cả dữ liệu mẫu vào bảng chat_history!")
        print("📊 Bạn có thể xem dữ liệu trong Admin Panel > Lịch sử Chat")

    except Exception as e:
        print(f"❌ Lỗi khi thêm dữ liệu: {str(e)}")

if __name__ == "__main__":
    print("🚀 Bắt đầu thêm dữ liệu mẫu vào bảng chat_history...")
    add_sample_chat_history()
