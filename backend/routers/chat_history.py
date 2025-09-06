# routers/chat_history.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase_client import supabase
from models import ChatHistoryCreate, ChatHistoryResponse
from dependencies import get_current_admin_user, get_current_user_optional

def _is_admin_user(current_user):
    """Kiểm tra xem user hiện tại có phải admin không"""
    if not current_user:
        return False
    try:
        # Kiểm tra vai trò admin từ database users table
        result = supabase.table('users').select('role_id').eq('email', current_user.email).execute()
        if result.data and len(result.data) > 0:
            user_data = result.data[0]
            return user_data['role_id'] == 1
        return False
    except:
        return False

def _get_user_chat_conversations(user_email):
    """Lấy danh sách conversation_id và app_id từ user_chat table cho user cụ thể"""
    try:
        result = supabase.table('user_chat').select('conversation_id, app_id, name_app').eq('email', user_email).execute()
        if result.data:
            return result.data
        return []
    except:
        return []

def _filter_chat_history_by_user_chat(chat_records, user_conversations):
    """Filter chat history records dựa trên user_chat data"""
    if not user_conversations:
        return []
    
    # Tạo set của (conversation_id, name_app) để filter nhanh
    allowed_conversations = set()
    for conv in user_conversations:
        allowed_conversations.add((conv['conversation_id'], conv['name_app']))
    
    # Filter records
    filtered_records = []
    for record in chat_records:
        conv_id = record.get('conversation_id')
        name_app = record.get('name_app')
        if (conv_id, name_app) in allowed_conversations:
            filtered_records.append(record)
    
    return filtered_records
from datetime import datetime

def _auto_sync_email_to_user_chat(record):
    """
    Tự động sync email từ chat_history record mới vào user_chat
    Chỉ tạo user_chat record nếu cột email có dữ liệu hợp lệ
    """
    try:
        conversation_id = record.get('conversation_id')
        if not conversation_id:
            print(f"Skip sync: No conversation_id for record {record.get('log_id')}")
            return

        # Chỉ kiểm tra cột email
        email = record.get('email')

        # Kiểm tra điều kiện: chỉ sync nếu có email hợp lệ trong cột email
        if not email or email.strip() == '':
            print(f"Skip sync: No valid email in email column for record {record.get('log_id')}")
            return

        print(f"Processing sync for email: {email}, conversation: {conversation_id}")

        # Tìm user theo email
        user_result = supabase.table('users').select('*').eq('email', email).execute()

        if not user_result.data or len(user_result.data) == 0:
            print(f"Skip sync: No user found for email {email}")
            return

        user = user_result.data[0]
        user_id = user['id']
        print(f"Found user {user_id} for email {email}")

        # Cập nhật chat_history với user_id
        supabase.table('chat_history').update({
            'user_id': user_id
        }).eq('log_id', record['log_id']).execute()
        print(f"Updated chat_history record {record['log_id']} with user_id {user_id}")

        # Tạo user_chat record nếu chưa tồn tại
        existing_user_chat = supabase.table('user_chat').select('*').eq('email', email).eq('conversation_id', conversation_id).execute()

        if not existing_user_chat.data or len(existing_user_chat.data) == 0:
            user_chat_data = {
                'email': email,
                'user_id': user_id,
                'conversation_id': conversation_id,
                'name_app': record.get('name_app'),
                'app_id': record.get('name_app')
            }
            supabase.table('user_chat').insert(user_chat_data).execute()
            print(f"Created user_chat record for email {email}, user {user_id}")
        else:
            print(f"User_chat record already exists for email {email}, conversation {conversation_id}")

    except Exception as e:
        print(f"Auto sync error for record {record.get('log_id')}: {str(e)}")

router = APIRouter(
    prefix="/chat-history",
    tags=["Chat History"]
    # dependencies=[Depends(get_current_user_optional)]  # Tạm thời bỏ qua để test
)

@router.post("/", status_code=201)
def create_chat_history(chat: ChatHistoryCreate):
    """
    Tạo một bản ghi lịch sử chat mới
    """
    try:
        data, count = supabase.table('chat_history').insert(chat.dict()).execute()

        # Tự động sync email nếu có
        try:
            record = data[1][0] if data[1] else None
            if record:
                _auto_sync_email_to_user_chat(record)
        except Exception as e:
            print(f"Warning: Auto sync failed: {str(e)}")

        return data[1][0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/apps")
def get_unique_app_names():
    """
    Lấy danh sách các name_app duy nhất từ bảng chat_history
    Trả về số lượng conversation duy nhất đã diễn ra với mỗi app
    """
    try:
        # Lấy danh sách name_app và conversation_id duy nhất
        result = supabase.table('chat_history').select('name_app, conversation_id').execute()

        # Kiểm tra cấu trúc dữ liệu trả về

        # Xử lý dữ liệu dựa trên cấu trúc thực tế
        if isinstance(result.data, list) and len(result.data) > 0:
            # Nếu là list trực tiếp
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            # Nếu có nested data
            records = result.data.data
        else:
            records = []

        # Đếm số lượng conversation duy nhất cho mỗi app
        app_conversation_counts = {}
        for record in records:
            if isinstance(record, dict) and 'name_app' in record and 'conversation_id' in record:
                app_name = record['name_app']
                conversation_id = record['conversation_id']
                
                if app_name not in app_conversation_counts:
                    app_conversation_counts[app_name] = set()
                
                app_conversation_counts[app_name].add(conversation_id)        # Chuyển thành format dễ sử dụng
        apps = []
        for app_name, conversation_ids in app_conversation_counts.items():
            apps.append({
                "name": app_name,
                "chat_count": len(conversation_ids)  # Số lượng conversation duy nhất
            })

        return apps
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-apps")
def get_my_apps(current_user = Depends(get_current_user_optional)):
    """
    Lấy danh sách apps mà user hiện tại có thể truy cập từ user_chat table
    """
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Kiểm tra quyền admin
        is_admin = _is_admin_user(current_user)
        
        if is_admin:
            # Admin xem tất cả apps
            result = supabase.table('chat_history').select('name_app, conversation_id').execute()
            
            # Xử lý dữ liệu
            if isinstance(result.data, list) and len(result.data) > 0:
                records = result.data
            elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
                records = result.data.data
            else:
                records = []
            
            # Đếm số lượng conversation duy nhất cho mỗi app
            app_conversation_counts = {}
            for record in records:
                if isinstance(record, dict) and 'name_app' in record and 'conversation_id' in record:
                    app_name = record['name_app']
                    conversation_id = record['conversation_id']
                    
                    if app_name not in app_conversation_counts:
                        app_conversation_counts[app_name] = set()
                    
                    app_conversation_counts[app_name].add(conversation_id)
            
            apps = []
            for app_name, conversation_ids in app_conversation_counts.items():
                apps.append({
                    "name": app_name,
                    "chat_count": len(conversation_ids)
                })
        else:
            # User thường: chỉ xem apps của mình từ user_chat
            user_conversations = _get_user_chat_conversations(current_user.email)
            
            if not user_conversations:
                return {"message": "No apps found", "apps": []}
            
            # Group by app
            app_counts = {}
            for conv in user_conversations:
                app_name = conv['name_app']
                if app_name not in app_counts:
                    app_counts[app_name] = 0
                app_counts[app_name] += 1
            
            apps = []
            for app_name, count in app_counts.items():
                apps.append({
                    "name": app_name,
                    "chat_count": count
                })
        
        return {"apps": apps}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
def get_chat_history_by_app(name_app: str, current_user = Depends(get_current_user_optional)):
    """
    Lấy lịch sử chat của một app cụ thể, sắp xếp theo thời gian
    - User thường: chỉ xem chat của mình từ user_chat
    - Admin: xem tất cả chat của app
    - Anonymous: xem tất cả chat của app (tạm thời cho test)
    """
    try:
        from urllib.parse import unquote
        import html

        decoded_name_app = unquote(name_app)
        html_decoded_name_app = html.unescape(decoded_name_app)

        # Kiểm tra quyền admin
        is_admin = _is_admin_user(current_user) if current_user else False

        if is_admin:
            # Admin xem tất cả chat của app
            try:
                # Lấy tất cả tên app có sẵn
                all_apps_result = supabase.table('chat_history').select('name_app').execute()
                available_apps = []
                if hasattr(all_apps_result.data, 'data'):
                    available_apps = list(set([record['name_app'] for record in all_apps_result.data.data if 'name_app' in record]))
                else:
                    available_apps = list(set([record['name_app'] for record in all_apps_result.data if 'name_app' in record]))

                # Tìm app name chính xác nhất
                matched_app = None
                for app in available_apps:
                    if app == html_decoded_name_app:
                        matched_app = app
                        break
                    elif html.unescape(app) == html_decoded_name_app:
                        matched_app = app
                        break
                    elif html_decoded_name_app.lower() in app.lower() or app.lower() in html_decoded_name_app.lower():
                        matched_app = app
                        break

                if matched_app:
                    result = supabase.table('chat_history').select('''
                        *,
                        users!fk_user(username, full_name)
                    ''').eq('name_app', matched_app).order('created_at', desc=True).execute()
                else:
                    result = {"data": []}
            except:
                # Nếu join thất bại, query không join
                result = supabase.table('chat_history').select('*').eq('name_app', html_decoded_name_app).order('created_at', desc=True).execute()
        else:
            # User thường hoặc anonymous: xem tất cả chat của app (tạm thời cho test)
            result = supabase.table('chat_history').select('*').eq('name_app', html_decoded_name_app).order('created_at', desc=True).execute()

        # Xử lý cấu trúc dữ liệu
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_all_chat_history(limit: int = 100, current_user = Depends(get_current_user_optional)):
    """
    Lấy tất cả lịch sử chat, giới hạn số lượng
    - User thường: chỉ xem chat của mình từ user_chat
    - Admin: xem tất cả chat
    - Anonymous: xem tất cả chat (tạm thời cho test)
    """
    try:
        # Kiểm tra quyền admin
        is_admin = _is_admin_user(current_user) if current_user else False

        if is_admin:
            # Admin xem tất cả
            try:
                result = supabase.table('chat_history').select('''
                    *,
                    users!fk_user(username, full_name)
                ''').order('created_at', desc=True).limit(limit).execute()
            except:
                # Nếu join thất bại, query không join
                result = supabase.table('chat_history').select('*').order('created_at', desc=True).limit(limit).execute()
        else:
            # User thường hoặc anonymous: xem tất cả chat (tạm thời cho test)
            result = supabase.table('chat_history').select('*').order('created_at', desc=True).limit(limit).execute()

        # Xử lý cấu trúc dữ liệu
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversation/{conversation_id}")
def get_chat_history_by_conversation(conversation_id: str, current_user = Depends(get_current_user_optional)):
    """
    Lấy lịch sử chat của một conversation cụ thể
    - User thường: chỉ xem conversation của mình từ user_chat
    - Admin: xem tất cả conversations
    - Anonymous: có thể xem conversation được chỉ định (tạm thời cho test)
    """
    try:
        # Kiểm tra quyền admin
        is_admin = _is_admin_user(current_user) if current_user else False

        if is_admin:
            # Admin xem tất cả
            result = supabase.table('chat_history').select('*').eq('conversation_id', conversation_id).order('created_at', desc=True).execute()
        else:
            # User thường: kiểm tra xem conversation có thuộc về user không
            if not current_user:
                # Cho phép anonymous access - trả về data nếu conversation tồn tại
                result = supabase.table('chat_history').select('*').eq('conversation_id', conversation_id).order('created_at', desc=True).execute()
            else:
                # Kiểm tra conversation có trong user_chat của user không
                user_conversations = _get_user_chat_conversations(current_user.email)
                conversation_ids = [conv['conversation_id'] for conv in user_conversations]

                if conversation_id not in conversation_ids:
                    raise HTTPException(status_code=403, detail="Not authorized to view this conversation")

                # Lấy chat history cho conversation này
                result = supabase.table('chat_history').select('*').eq('conversation_id', conversation_id).order('created_at', desc=True).execute()

        # Xử lý cấu trúc dữ liệu
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        return records
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/parse-email/{conversation_id}")
def parse_email_from_chat_history(conversation_id: str):
    """
    Parse email từ chat history và tìm user tương ứng
    """
    try:
        # Lấy chat history của conversation
        result = supabase.table('chat_history').select('*').eq('conversation_id', conversation_id).order('created_at', desc=True).execute()

        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        if not records:
            return {"message": "Không tìm thấy chat history cho conversation này"}

        # Parse email từ user_message (format: {"Email":"email@example.com"})
        email = None
        for record in records:
            user_message = record.get('user_message', '')
            if user_message.startswith('{"Email":"') and '"}' in user_message:
                try:
                    # Parse JSON string
                    import json
                    message_data = json.loads(user_message)
                    if 'Email' in message_data:
                        email = message_data['Email']
                        break
                except:
                    # Nếu không parse được JSON, thử regex
                    import re
                    email_match = re.search(r'{"Email":"([^"]+)"}', user_message)
                    if email_match:
                        email = email_match.group(1)
                        break

        if not email:
            return {"message": "Không tìm thấy email trong chat history"}

        # Tìm user theo email
        user_result = supabase.table('users').select('*').eq('email', email).execute()

        if not user_result.data or len(user_result.data) == 0:
            return {
                "message": f"Tìm thấy email: {email} nhưng không tìm thấy user tương ứng",
                "email": email,
                "user": None
            }

        user = user_result.data[0]

        return {
            "message": f"Tìm thấy user cho email: {email}",
            "email": email,
            "user": user,
            "chat_history_count": len(records)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}")
def get_user_chat_history(user_id: int, limit: int = 50, current_user = Depends(get_current_user_optional)):
    """
    Lấy lịch sử chat của một user cụ thể
    - User thường: chỉ xem chat của mình
    - Admin: có thể xem chat của user khác
    - Anonymous: có thể xem chat của user được chỉ định (tạm thời cho test)
    """
    try:
        # Kiểm tra quyền admin
        is_admin = _is_admin_user(current_user) if current_user else False

        # Nếu không phải admin và user_id không phải của chính mình
        if not is_admin and current_user:
            # Lấy user_id của current_user
            user_result = supabase.table('users').select('id').eq('email', current_user.email).execute()
            if user_result.data and len(user_result.data) > 0:
                current_user_id = user_result.data[0]['id']
                if current_user_id != user_id:
                    raise HTTPException(status_code=403, detail="Not authorized to view other user's chat history")
            else:
                raise HTTPException(status_code=403, detail="User not found")
        elif not current_user:
            # Cho phép anonymous access (tạm thời cho test)
            pass

        # Lấy thông tin user
        user_result = supabase.table('users').select('*').eq('id', user_id).execute()
        user = user_result.data[0] if user_result.data else None

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Lấy conversations của user từ user_chat table
        user_conversations = _get_user_chat_conversations(user['email'])

        if not user_conversations:
            return {
                "user": user,
                "total_messages": 0,
                "conversations": {},
                "conversation_count": 0,
                "message": "No chat history found in user_chat table"
            }

        # Lấy conversation_ids
        conversation_ids = [conv['conversation_id'] for conv in user_conversations]

        # Lấy chat history cho các conversation này
        result = supabase.table('chat_history').select('*').in_('conversation_id', conversation_ids).order('created_at', desc=True).limit(limit).execute()

        # Xử lý cấu trúc dữ liệu
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        # Filter theo user_chat data để đảm bảo chỉ lấy đúng conversations
        records = _filter_chat_history_by_user_chat(records, user_conversations)

        # Group by conversation
        conversations = {}
        for record in records:
            conv_id = record.get('conversation_id', 'unknown')
            if conv_id not in conversations:
                conversations[conv_id] = []
            conversations[conv_id].append(record)

        return {
            "user": user,
            "total_messages": len(records),
            "conversations": conversations,
            "conversation_count": len(conversations)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SyncDifyMessagesRequest(BaseModel):
    conversation_id: str
    user_id: int
    chatflow_name: str

@router.post("/sync-email-to-user-chat")
def sync_email_to_user_chat():
    """
    Sync chat history data to user chat table based on email parsing
    """
    try:
        # Lấy tất cả chat history records chưa có user_id
        result = supabase.table('chat_history').select('*').execute()
        
        # Filter records chưa có user_id trong Python
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []
            
        # Filter records chưa có user_id
        records = [r for r in records if r.get('user_id') is None]

        synced_count = 0
        skipped_count = 0
        
        for record in records:
            conversation_id = record.get('conversation_id')
            if not conversation_id:
                continue
                
            # Chỉ lấy email từ cột email
            email = record.get('email')
            
            if not email or email.strip() == '':
                continue
                
            # Tìm user theo email
            user_result = supabase.table('users').select('*').eq('email', email).execute()
            
            if not user_result.data or len(user_result.data) == 0:
                skipped_count += 1
                continue
                
            user = user_result.data[0]
            user_id = user['id']
            
            # Cập nhật chat_history với user_id
            supabase.table('chat_history').update({
                'user_id': user_id
            }).eq('log_id', record['log_id']).execute()
            
            # Tạo hoặc cập nhật user chat record
            existing_user_chat = supabase.table('user_chat').select('*').eq('email', email).eq('conversation_id', conversation_id).execute()
            
            if existing_user_chat.data and len(existing_user_chat.data) > 0:
                # Cập nhật record hiện có
                supabase.table('user_chat').update({
                    'user_id': user_id,
                    'name_app': record.get('name_app'),
                    'app_id': record.get('name_app')  # Sử dụng name_app làm app_id
                }).eq('email', email).eq('conversation_id', conversation_id).execute()
            else:
                # Tạo record mới
                user_chat_data = {
                    'email': email,
                    'user_id': user_id,
                    'conversation_id': conversation_id,
                    'name_app': record.get('name_app'),
                    'app_id': record.get('name_app')  # Sử dụng name_app làm app_id
                }
                supabase.table('user_chat').insert(user_chat_data).execute()
            
            synced_count += 1
        
        return {
            "message": f"Sync completed successfully",
            "synced_records": synced_count,
            "skipped_records": skipped_count,
            "total_processed": len(records)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-and-sync-email")
def check_and_sync_email():
    """
    Kiểm tra chat_history mới và sync email vào user_chat
    """
    try:
        # Lấy chat_history records trong 24 giờ qua chưa có user_id
        from datetime import datetime, timedelta
        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        
        result = supabase.table('chat_history').select('*').gte('created_at', yesterday).execute()
        
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []
            
        # Filter records chưa có user_id
        records = [r for r in records if r.get('user_id') is None]
        
        synced_count = 0
        skipped_count = 0
        
        for record in records:
            conversation_id = record.get('conversation_id')
            if not conversation_id:
                continue
                
            # Chỉ lấy email từ cột email
            email = record.get('email')
            
            if not email or email.strip() == '':
                continue
                
            # Tìm user theo email
            user_result = supabase.table('users').select('*').eq('email', email).execute()
            
            if not user_result.data or len(user_result.data) == 0:
                skipped_count += 1
                continue
                
            user = user_result.data[0]
            user_id = user['id']
            
            # Cập nhật chat_history với user_id
            supabase.table('chat_history').update({
                'user_id': user_id
            }).eq('log_id', record['log_id']).execute()
            
            # Tạo user_chat record nếu chưa tồn tại
            existing_user_chat = supabase.table('user_chat').select('*').eq('email', email).eq('conversation_id', conversation_id).execute()
            
            if not existing_user_chat.data or len(existing_user_chat.data) == 0:
                user_chat_data = {
                    'email': email,
                    'user_id': user_id,
                    'conversation_id': conversation_id,
                    'name_app': record.get('name_app'),
                    'app_id': record.get('name_app')
                }
                supabase.table('user_chat').insert(user_chat_data).execute()
                synced_count += 1
        
        return {
            "message": f"Checked and synced recent chat history",
            "synced_records": synced_count,
            "skipped_records": skipped_count,
            "total_checked": len(records)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync-all-pending")
def sync_all_pending_emails():
    """
    Sync tất cả chat_history records chưa có user_id (không giới hạn thời gian)
    """
    try:
        # Lấy tất cả chat_history records chưa có user_id
        result = supabase.table('chat_history').select('*').execute()
        
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []
        
        # Filter records chưa có user_id trong Python
        records = [r for r in records if r.get('user_id') is None]
        
        for record in records:
            conversation_id = record.get('conversation_id')
            if not conversation_id:
                continue
                
            # Chỉ lấy email từ cột email
            email = record.get('email')
            
            if not email or email.strip() == '':
                continue
                
            # Tìm user theo email
            user_result = supabase.table('users').select('*').eq('email', email).execute()
            
            if not user_result.data or len(user_result.data) == 0:
                skipped_count += 1
                continue
                
            user = user_result.data[0]
            user_id = user['id']
            
            # Cập nhật chat_history với user_id
            supabase.table('chat_history').update({
                'user_id': user_id
            }).eq('log_id', record['log_id']).execute()
            
            # Tạo user_chat record nếu chưa tồn tại
            existing_user_chat = supabase.table('user_chat').select('*').eq('email', email).eq('conversation_id', conversation_id).execute()
            
            if not existing_user_chat.data or len(existing_user_chat.data) == 0:
                user_chat_data = {
                    'email': email,
                    'user_id': user_id,
                    'conversation_id': conversation_id,
                    'name_app': record.get('name_app'),
                    'app_id': record.get('name_app')
                }
                supabase.table('user_chat').insert(user_chat_data).execute()
                synced_count += 1
        
        return {
            "message": f"Synced all pending chat history records",
            "synced_records": synced_count,
            "skipped_records": skipped_count,
            "total_processed": len(records)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-new-emails")
def detect_new_emails():
    """
    Phát hiện chat_history records mới có email và sync ngay lập tức
    """
    try:
        # Lấy chat_history records trong 1 giờ qua có email nhưng chưa có user_id
        from datetime import datetime, timedelta
        one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
        
        # Sử dụng query đơn giản hơn
        result = supabase.table('chat_history').select('*').gte('created_at', one_hour_ago).execute()
        
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []
            
        # Filter records có email nhưng chưa có user_id
        records = [r for r in records if r.get('email') and r.get('email').strip() and r.get('user_id') is None]
        
        synced_count = 0
        skipped_count = 0
        
        for record in records:
            conversation_id = record.get('conversation_id')
            if not conversation_id:
                continue
                
            email = record.get('email').strip()
            
            # Tìm user theo email
            user_result = supabase.table('users').select('*').eq('email', email).execute()
            
            if not user_result.data or len(user_result.data) == 0:
                skipped_count += 1
                continue
                
            user = user_result.data[0]
            user_id = user['id']
            
            # Cập nhật chat_history với user_id
            supabase.table('chat_history').update({
                'user_id': user_id
            }).eq('log_id', record['log_id']).execute()
            
            # Tạo user_chat record nếu chưa tồn tại
            existing_user_chat = supabase.table('user_chat').select('*').eq('email', email).eq('conversation_id', conversation_id).execute()
            
            if not existing_user_chat.data or len(existing_user_chat.data) == 0:
                user_chat_data = {
                    'email': email,
                    'user_id': user_id,
                    'conversation_id': conversation_id,
                    'name_app': record.get('name_app'),
                    'app_id': record.get('name_app')
                }
                supabase.table('user_chat').insert(user_chat_data).execute()
                synced_count += 1
        
        return {
            "message": f"Detected and synced new email records",
            "synced_records": synced_count,
            "skipped_records": skipped_count,
            "total_detected": len(records)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trigger-auto-sync")
def trigger_auto_sync():
    """
    Trigger tự động sync cho tất cả records mới có email
    """
    try:
        # Lấy tất cả chat_history records
        result = supabase.table('chat_history').select('*').execute()
        
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []
            
        # Filter records có email nhưng chưa có user_id
        records_to_sync = [r for r in records if r.get('email') and r.get('email').strip() and r.get('user_id') is None]
        
        synced_count = 0
        skipped_count = 0
        
        for record in records_to_sync:
            # Gọi hàm auto sync
            _auto_sync_email_to_user_chat(record)
            synced_count += 1
        
        return {
            "message": f"Auto sync triggered for {len(records_to_sync)} records",
            "synced_records": synced_count,
            "skipped_records": skipped_count,
            "total_processed": len(records_to_sync)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-conversations")
def get_my_conversations(current_user = Depends(get_current_user_optional)):
    """
    Lấy danh sách conversations mà user hiện tại có thể truy cập từ user_chat table
    - User thường: chỉ xem conversations của mình
    - Admin: xem tất cả conversations
    - Anonymous: xem tất cả conversations (tạm thời cho test)
    """
    try:
        if not current_user:
            # Cho phép anonymous access - trả về tất cả conversations (tạm thời cho test)
            result = supabase.table('chat_history').select('conversation_id, name_app, created_at').order('created_at', desc=True).execute()
            
            # Xử lý dữ liệu
            if isinstance(result.data, list) and len(result.data) > 0:
                records = result.data
            elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
                records = result.data.data
            else:
                records = []
            
            # Loại bỏ duplicate conversations
            seen = set()
            conversations = []
            for record in records:
                conv_id = record.get('conversation_id')
                if conv_id and conv_id not in seen:
                    seen.add(conv_id)
                    conversations.append({
                        "conversation_id": conv_id,
                        "name_app": record.get('name_app'),
                        "last_message": record.get('created_at')
                    })
            
            return {"conversations": conversations}
        
        # Kiểm tra quyền admin
        is_admin = _is_admin_user(current_user)
        
        if is_admin:
            # Admin xem tất cả conversations
            result = supabase.table('chat_history').select('conversation_id, name_app, created_at').order('created_at', desc=True).execute()
            
            # Xử lý dữ liệu
            if isinstance(result.data, list) and len(result.data) > 0:
                records = result.data
            elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
                records = result.data.data
            else:
                records = []
            
            # Loại bỏ duplicate conversations
            seen = set()
            conversations = []
            for record in records:
                conv_id = record.get('conversation_id')
                if conv_id and conv_id not in seen:
                    seen.add(conv_id)
                    conversations.append({
                        "conversation_id": conv_id,
                        "name_app": record.get('name_app'),
                        "last_message": record.get('created_at')
                    })
        else:
            # User thường: chỉ xem conversations của mình từ user_chat
            user_conversations = _get_user_chat_conversations(current_user.email)
            
            if not user_conversations:
                return {"message": "No conversations found", "conversations": []}
            
            conversations = []
            for conv in user_conversations:
                conversations.append({
                    "conversation_id": conv['conversation_id'],
                    "name_app": conv['name_app'],
                    "app_id": conv.get('app_id')
                })
        
        return {"conversations": conversations}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
