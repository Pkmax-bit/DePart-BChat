import requests
import time
import threading
from datetime import datetime, timedelta

class AutoEmailSyncService:
    """Service tự động sync email khi có dữ liệu mới trong chat_history"""

    def __init__(self, api_base_url="http://localhost:8001"):
        self.api_base_url = api_base_url
        self.last_check_time = datetime.now()
        self.is_running = False

    def check_new_chat_history_records(self):
        """Kiểm tra chat_history records mới có email"""
        try:
            # Lấy records từ lần check cuối
            since_time = self.last_check_time.isoformat()

            # Query chat_history records mới
            response = requests.get(
                f"{self.api_base_url}/api/v1/chat-history/",
                params={"limit": 100}  # Lấy 100 records gần nhất
            )

            if response.status_code != 200:
                print(f"Failed to fetch chat_history: {response.status_code}")
                return

            records = response.json()

            # Filter records mới có email
            new_records_with_email = []
            for record in records:
                created_at = record.get('created_at')
                if created_at:
                    # Parse created_at string to datetime
                    if isinstance(created_at, str):
                        record_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    else:
                        record_time = datetime.now()  # fallback

                    # Nếu record mới hơn lần check cuối và có email
                    if record_time > self.last_check_time and record.get('Email'):
                        new_records_with_email.append(record)

            if new_records_with_email:
                print(f"Found {len(new_records_with_email)} new records with email")

                # Trigger sync cho từng record
                for record in new_records_with_email:
                    self.trigger_sync_for_record(record)

            # Cập nhật thời gian check cuối
            self.last_check_time = datetime.now()

        except Exception as e:
            print(f"Error checking new records: {e}")

    def trigger_sync_for_record(self, record):
        """Trigger sync cho một record cụ thể"""
        try:
            # Gọi API để sync record này
            response = requests.post(
                f"{self.api_base_url}/api/v1/chat-history/detect-new-emails"
            )

            if response.status_code == 200:
                result = response.json()
                print(f"Auto sync triggered: {result}")
            else:
                print(f"Auto sync failed: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"Error triggering sync: {e}")

    def start_auto_sync(self, interval_seconds=30):
        """Bắt đầu auto sync service"""
        if self.is_running:
            print("Auto sync service is already running")
            return

        self.is_running = True
        print(f"Starting auto email sync service (check every {interval_seconds}s)...")

        def run_service():
            while self.is_running:
                self.check_new_chat_history_records()
                time.sleep(interval_seconds)

        # Chạy service trong background thread
        service_thread = threading.Thread(target=run_service, daemon=True)
        service_thread.start()

        print("Auto sync service started successfully")

    def stop_auto_sync(self):
        """Dừng auto sync service"""
        self.is_running = False
        print("Auto sync service stopped")

# Global service instance
auto_sync_service = AutoEmailSyncService()

def start_auto_email_sync(interval_seconds=30):
    """Hàm tiện ích để khởi động auto sync"""
    auto_sync_service.start_auto_sync(interval_seconds)

def stop_auto_email_sync():
    """Hàm tiện ích để dừng auto sync"""
    auto_sync_service.stop_auto_email_sync()

if __name__ == "__main__":
    print("=== AUTO EMAIL SYNC SERVICE ===")

    # Khởi động service
    start_auto_email_sync(interval_seconds=30)  # Check mỗi 30 giây

    print("Service is running... Press Ctrl+C to stop")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping service...")
        stop_auto_email_sync()
        print("Service stopped")
