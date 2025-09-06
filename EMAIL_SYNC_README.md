# Email Sync Documentation

## 📋 TỔNG QUAN
Hệ thống tự động sync email từ `chat_history` vào bảng `user_chat` để dễ dàng tra cứu thông tin người dùng từ email.

## 🚀 CÁCH CHẠY

### 1. Chạy FastAPI Server (không có email sync)
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```

### 2. Chạy Email Sync Service (riêng biệt)
```bash
python run_email_sync.py
```

## 🔧 CHỨC NĂNG

### 1. Tự Động Sync
Khi tạo `chat_history` mới với email, hệ thống sẽ:
- ✅ Tự động parse email từ `input_text` hoặc cột `Email`
- ✅ Tìm user tương ứng với email
- ❌ ~~Cập nhật `user_id` vào `chat_history`~~ (Đã bỏ)
- ✅ Tạo record trong `user_chat` với thông tin đầy đủ

### 2. Sync Thủ Công
Có 3 endpoint để sync thủ công:

#### `/api/v1/chat-history/sync-email-to-user-chat` (POST)
- Sync tất cả records chưa có user_id
- Không giới hạn thời gian
- Sử dụng cho việc sync lại toàn bộ dữ liệu

#### `/api/v1/chat-history/check-and-sync-email` (POST)
- Sync records trong 24 giờ qua
- Phù hợp cho cron job định kỳ
- Ít tốn tài nguyên hơn

#### `/api/v1/chat-history/sync-all-pending` (POST)
- Sync tất cả records pending (user_id IS NULL)
- Tương tự như endpoint đầu tiên

## Cách sử dụng

### 1. Tự động (Recommended)
Hệ thống sẽ tự động sync khi tạo chat_history mới:
```python
chat_data = {
    'input_text': '{"Email":"user@example.com"}',
    'output_text': 'Hello!',
    'conversation_id': 'conv_123',
    'name_app': 'Bot Name'
}

response = requests.post('http://localhost:8001/api/v1/chat-history/', json=chat_data)
```

### 2. Cron Job (Định kỳ)
Chạy script `email_sync_job.py` bằng cron:
```bash
# Chạy mỗi giờ
0 * * * * cd /path/to/project && python scripts/email_sync_job.py

# Chạy mỗi 6 giờ
0 */6 * * * cd /path/to/project && python scripts/email_sync_job.py
```

### 3. Manual Sync
```python
# Sync records trong 24h qua
response = requests.post('http://localhost:8001/api/v1/chat-history/check-and-sync-email')

# Sync tất cả pending records
response = requests.post('http://localhost:8001/api/v1/chat-history/sync-all-pending')
```

## API Endpoints

### User Chat
- `GET /api/v1/user-chat/` - Lấy tất cả records
- `GET /api/v1/user-chat/user/{user_id}` - Lấy theo user ID
- `GET /api/v1/user-chat/email/{email}` - Lấy theo email

## Test
Chạy test script:
```bash
python test_auto_sync.py
```

## Logs
Logs được lưu trong `email_sync.log` khi chạy cron job.

## Schema

### Bảng user_chat
```sql
CREATE TABLE user_chat (
  id bigint PRIMARY KEY,
  app_id text,
  conversation_id text,
  email text,
  user_id bigint,
  name_app text,
  created_at timestamp
);
```

## Lợi ích
1. **Tự động**: Không cần can thiệp thủ công
2. **Real-time**: Sync ngay khi tạo chat_history
3. **Reliable**: Có fallback với cron job
4. **Scalable**: Xử lý được nhiều records cùng lúc
5. **Traceable**: Logs đầy đủ để debug
