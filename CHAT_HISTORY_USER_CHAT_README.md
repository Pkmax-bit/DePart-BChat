# Chat History với User Chat Integration

## Tổng quan

Hệ thống chat history đã được cập nhật để sử dụng bảng `user_chat` để kiểm soát quyền truy cập. Thay vì dựa vào `user_id` trong `chat_history`, hệ thống giờ đây sử dụng `user_chat` table để xác định conversations mà user có thể truy cập.

## Thay đổi chính

### 1. Authentication & Authorization
- **Tạm thời cho test**: Tất cả endpoints cho phép anonymous access (không yêu cầu authentication)
- User thường chỉ xem được chat của mình từ `user_chat`
- Admin có thể xem tất cả chat
- **Lưu ý**: Anonymous access chỉ để test, sẽ enable authentication đầy đủ sau

### 2. Sử dụng app_id thay vì name_id
- Đã thay đổi từ `name_id` sang `app_id` trong toàn bộ hệ thống
- `app_id` là ID của bot chat application

### 3. Logic truy cập dữ liệu
- **User thường**: Chỉ xem conversations có trong `user_chat` table của họ
- **Admin**: Xem tất cả conversations

## API Endpoints

### 1. `/chat-history/` - Lấy chat history
```http
GET /chat-history/?limit=100
Authorization: Bearer <token> (tạm thời optional)
```

**User thường**: Trả về chat history từ conversations trong `user_chat`
**Admin**: Trả về tất cả chat history
**Anonymous**: Trả về tất cả chat history (tạm thời cho test)

### 2. `/chat-history/my-apps` - Lấy apps của user
```http
GET /chat-history/my-apps
Authorization: Bearer <token> (tạm thời optional)
```

**User thường**: Trả về apps từ `user_chat`
**Admin**: Trả về tất cả apps
**Anonymous**: Trả về tất cả apps (tạm thời cho test)

### 3. `/chat-history/my-conversations` - Lấy conversations của user
```http
GET /chat-history/my-conversations
Authorization: Bearer <token> (tạm thời optional)
```

**User thường**: Trả về conversations từ `user_chat`
**Admin**: Trả về tất cả conversations
**Anonymous**: Trả về tất cả conversations (tạm thời cho test)

### 4. `/chat-history/user/{user_id}` - Lấy chat history của user cụ thể
```http
GET /chat-history/user/{user_id}
Authorization: Bearer <token> (tạm thời optional)
```

**User thường**: Chỉ xem được chat của chính mình
**Admin**: Có thể xem chat của bất kỳ user nào
**Anonymous**: Có thể xem chat của user được chỉ định (tạm thời cho test)

### 5. `/chat-history/app/{name_app}` - Lấy chat history theo app
```http
GET /chat-history/app/{name_app}
Authorization: Bearer <token> (tạm thời optional)
```

**User thường**: Chỉ xem chat của app đó từ `user_chat`
**Admin**: Xem tất cả chat của app
**Anonymous**: Xem tất cả chat của app (tạm thời cho test)

### 6. `/chat-history/conversation/{conversation_id}` - Lấy chat history theo conversation
```http
GET /chat-history/conversation/{conversation_id}
Authorization: Bearer <token> (tạm thời optional)
```

**User thường**: Chỉ xem nếu conversation có trong `user_chat`
**Admin**: Xem tất cả conversations
**Anonymous**: Xem conversation được chỉ định (tạm thời cho test)

## Cấu trúc Database

### user_chat table
```sql
CREATE TABLE user_chat (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL,
    user_id INTEGER,
    conversation_id VARCHAR NOT NULL,
    name_app VARCHAR,
    app_id VARCHAR,  -- Thay thế cho name_id
    created_at TIMESTAMP DEFAULT NOW()
);
```

### chat_history table
```sql
CREATE TABLE chat_history (
    log_id SERIAL PRIMARY KEY,
    conversation_id VARCHAR,
    user_message TEXT,
    assistant_message TEXT,
    name_app VARCHAR,
    email VARCHAR,
    user_id INTEGER,  -- Vẫn giữ nhưng không dùng để filter
    created_at TIMESTAMP
);
```

## Workflow

1. **Sync Process**: Email sync service tạo records trong `user_chat` khi có chat mới
2. **Authentication**: User đăng nhập và nhận JWT token
3. **Authorization**: Hệ thống kiểm tra `user_chat` để xác định quyền truy cập
4. **Data Filtering**: Chỉ trả về data mà user có quyền truy cập

## Testing

Chạy test script để kiểm tra authentication và authorization:
```bash
python test_chat_history_user_chat.py
```

Test anonymous access (tạm thời cho test):
```bash
python test_anonymous_endpoints.py
```

### Test Cases
1. **Anonymous Access**: Tất cả endpoints trả về data mà không cần authentication
2. **User Access**: User chỉ xem được data của mình từ `user_chat`
3. **Admin Access**: Admin xem được tất cả data
4. **Authorization Check**: User không thể xem data của user khác

## Migration Notes

- Đã thay đổi tất cả `name_id` thành `app_id`
- Logic filter dựa trên `user_chat` thay vì `user_id` trong `chat_history`
- Admin vẫn có quyền xem tất cả data
- User thường chỉ xem data của mình từ `user_chat`

## Security

- **Tạm thời cho test**: Tất cả endpoints cho phép anonymous access (không yêu cầu authentication)
- User không thể xem data của user khác (trừ admin)
- Data được filter ở application level dựa trên `user_chat` table
- **Lưu ý**: Anonymous access chỉ để test, sẽ enable authentication đầy đủ sau
