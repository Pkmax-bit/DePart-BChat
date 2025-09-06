#!/usr/bin/env python3
"""
Cron job script: Định kỳ sync email từ chat_history vào user_chat
Chạy script này bằng cron job để tự động sync
"""
import requests
import json
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    filename='email_sync.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def sync_recent_emails():
    """Sync email từ chat_history trong 24h qua"""
    try:
        print("🔄 Bắt đầu sync email từ chat_history...")
        response = requests.post('http://localhost:8001/api/v1/chat-history/check-and-sync-email')

        if response.status_code == 200:
            result = response.json()
            synced = result.get('synced_records', 0)
            skipped = result.get('skipped_records', 0)
            total = result.get('total_checked', 0)

            message = f"✅ Sync hoàn thành: {synced} synced, {skipped} skipped, {total} checked"
            print(message)
            logging.info(message)

            return synced > 0  # Return True if any records were synced
        else:
            error_msg = f"❌ Sync thất bại: {response.status_code} - {response.text}"
            print(error_msg)
            logging.error(error_msg)
            return False

    except Exception as e:
        error_msg = f"❌ Lỗi khi sync: {str(e)}"
        print(error_msg)
        logging.error(error_msg)
        return False

def sync_all_pending():
    """Sync tất cả records pending (dùng khi cần sync lại toàn bộ)"""
    try:
        print("🔄 Bắt đầu sync tất cả pending records...")
        response = requests.post('http://localhost:8001/api/v1/chat-history/sync-all-pending')

        if response.status_code == 200:
            result = response.json()
            synced = result.get('synced_records', 0)
            skipped = result.get('skipped_records', 0)
            total = result.get('total_processed', 0)

            message = f"✅ Full sync hoàn thành: {synced} synced, {skipped} skipped, {total} processed"
            print(message)
            logging.info(message)

            return True
        else:
            error_msg = f"❌ Full sync thất bại: {response.status_code} - {response.text}"
            print(error_msg)
            logging.error(error_msg)
            return False

    except Exception as e:
        error_msg = f"❌ Lỗi khi full sync: {str(e)}"
        print(error_msg)
        logging.error(error_msg)
        return False

def check_backend_status():
    """Kiểm tra backend có hoạt động không"""
    try:
        response = requests.get('http://localhost:8001/api/v1/chat-history/', timeout=10)
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    print(f"🚀 Email Sync Job - {datetime.now()}")

    # Kiểm tra backend
    if not check_backend_status():
        print("❌ Backend không hoạt động!")
        exit(1)

    # Chạy sync định kỳ (24h)
    success = sync_recent_emails()

    # Nếu không có gì để sync, có thể chạy full sync 1 lần/tuần
    # Uncomment dòng dưới nếu muốn chạy full sync
    # if not success:
    #     print("📅 Chạy full sync...")
    #     sync_all_pending()

    print("✅ Job hoàn thành!")
