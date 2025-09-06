#!/usr/bin/env python3
"""
Email Sync Service Runner
Chạy email sync service độc lập với FastAPI server
"""
import sys
import os
import signal
import time

# Thêm backend vào path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.email_sync_service import start_email_sync_service, stop_email_sync_service

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print("\n🛑 Nhận tín hiệu shutdown...")
    stop_email_sync_service()
    print("✅ Email sync service đã dừng")
    sys.exit(0)

def main():
    """Main function để chạy email sync service"""
    print("🚀 Khởi động Email Sync Service độc lập")
    print("=" * 50)

    # Đăng ký signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        # Khởi động service
        start_email_sync_service()

        print("\n✅ Email Sync Service đang chạy...")
        print("📊 Service sẽ tự động sync email từ chat_history sang user_chat")
        print("🔄 Kiểm tra mỗi 1 giây")
        print("🛑 Nhấn Ctrl+C để dừng service")

        # Giữ service chạy
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Nhận tín hiệu dừng từ user...")
        stop_email_sync_service()
        print("✅ Email sync service đã dừng")

    except Exception as e:
        print(f"❌ Lỗi khi chạy service: {e}")
        import traceback
        traceback.print_exc()
        stop_email_sync_service()
        sys.exit(1)

if __name__ == "__main__":
    main()
