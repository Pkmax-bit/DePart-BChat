"""
Email Sync Service - Kiểm tra liê                    if (email and email.strip() and 
                        (user_id is None or str(user_id).strip() == '' or str(user_id) == 'None')):tục chat_history và sync email vào user_chat
"""
import threading
import time
from datetime import datetime
from backend.supabase_client import supabase

class EmailSyncService:
    """Service kiểm tra liên tục chat_history và sync email vào user_chat"""

    def __init__(self):
        self.is_running = False
        self.last_check_time = datetime.now()
        self.check_interval = 1  # Kiểm tra mỗi 1 giây

    def get_new_chat_records(self):
        """Lấy records mới từ chat_history"""
        try:
            # Lấy records gần đây và filter trong Python
            result = supabase.table('chat_history').select('*').order('created_at', desc=True).limit(50).execute()

            if result.data:
                # Filter records có email và chưa có user_id
                filtered_records = []
                for record in result.data:
                    email = record.get('email')
                    user_id = record.get('user_id')

                    # Kiểm tra email từ input_text nếu không có trong cột email
                    if not email and record.get('input_text'):
                        try:
                            import json
                            input_data = json.loads(record.get('input_text'))
                            email = input_data.get('Email')
                        except:
                            pass

                    if email and email.strip():
                        # Kiểm tra xem đã có user_chat record chưa
                        existing_chat = supabase.table('user_chat').select('id').eq('email', email).eq('conversation_id', record.get('conversation_id')).execute()
                        if not existing_chat.data:  # Chỉ sync nếu chưa có user_chat
                            record['email'] = email
                            filtered_records.append(record)
                return filtered_records
            return []
        except Exception as e:
            print(f"Error getting chat records: {e}")
            return []

    def sync_email_to_user_chat(self, record):
        """Sync email từ chat_history record vào user_chat"""
        try:
            conversation_id = record.get('conversation_id')
            if not conversation_id:
                return

            email = record.get('email')
            if not email or email.strip() == '':
                return

            # Removed: Kiểm tra xem đã sync chưa
            # if record.get('user_id') is not None and str(record.get('user_id')).strip():
            #     return

            print(f"🔄 Syncing email: {email} for conversation: {conversation_id}")

            # Tìm user theo email
            user_result = supabase.table('users').select('*').eq('email', email).execute()

            if not user_result.data:
                print(f"⚠️  No user found for email: {email}")
                return

            user = user_result.data[0]
            user_id = user['id']

            print(f"📋 Found user ID: {user_id} for email: {email}")

            # Kiểm tra xem đã có record trong user_chat chưa
            existing = supabase.table('user_chat').select('*').eq('email', email).eq('conversation_id', conversation_id).execute()

            if not existing.data:
                # Tạo record mới trong user_chat
                user_chat_data = {
                    'email': email,
                    'user_id': user_id,
                    'conversation_id': conversation_id,
                    'name_app': record.get('name_app'),
                    'app_id': record.get('name_app')
                }

                print(f"📝 Inserting user_chat data: {user_chat_data}")
                insert_result = supabase.table('user_chat').insert(user_chat_data).execute()
                print(f"✅ Created user_chat record for user {user_id}: {insert_result.data}")

            # Removed: Cập nhật user_id trong chat_history
            # update_result = supabase.table('chat_history').update({
            #     'user_id': user_id
            # }).eq('log_id', record['log_id']).execute()

            # print(f"✅ Updated chat_history record {record['log_id']} with user_id {user_id}")
            # print(f"   Update result: {update_result.data}")

        except Exception as e:
            print(f"❌ Error syncing record {record.get('log_id')}: {e}")
            import traceback
            traceback.print_exc()

    def process_new_records(self):
        """Xử lý records mới"""
        records = self.get_new_chat_records()

        print(f"🔍 Found {len(records)} new records to process")

        for record in records:
            # Kiểm tra xem đã xử lý record này chưa
            if record.get('email') and record.get('email').strip():
                print(f"📧 Processing record {record.get('log_id')} with email: {record.get('email')}")
                self.sync_email_to_user_chat(record)
            else:
                print(f"⚠️  Skipping record {record.get('log_id')} - no email")

    def start_service(self):
        """Bắt đầu service kiểm tra liên tục"""
        if self.is_running:
            print("Email sync service is already running")
            return

        self.is_running = True
        print("🚀 Starting Email Sync Service")
        print(f"🔄 Checking for new records every {self.check_interval} second(s)")

        def run_service():
            while self.is_running:
                try:
                    self.process_new_records()
                except Exception as e:
                    print(f"❌ Service error: {e}")
                    import traceback
                    traceback.print_exc()
                time.sleep(self.check_interval)

        # Chạy service trong background thread
        service_thread = threading.Thread(target=run_service, daemon=True)
        service_thread.start()

        print("✅ Email sync service started successfully!")

    def stop_service(self):
        """Dừng service"""
        self.is_running = False
        print("🛑 Email sync service stopped")

# Global service instance
email_sync_service = EmailSyncService()

def start_email_sync_service():
    """Hàm tiện ích để khởi động service"""
    email_sync_service.start_service()

def stop_email_sync_service():
    """Hàm tiện ích để dừng service"""
    email_sync_service.stop_service()
