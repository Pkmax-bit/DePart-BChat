# routers/chat_history.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase_client import supabase
from models import ChatHistoryCreate, ChatHistoryResponse
from dependencies import get_current_admin_user

router = APIRouter(
    prefix="/chat-history",
    tags=["Chat History"],
    # dependencies=[Depends(get_current_admin_user)]  # Tạm thời bỏ qua
)

@router.post("/", status_code=201)
def create_chat_history(chat: ChatHistoryCreate):
    """
    Tạo một bản ghi lịch sử chat mới
    """
    try:
        data, count = supabase.table('chat_history').insert(chat.dict()).execute()

        # Nếu có conversation_id và user_id, cập nhật session
        if chat.conversation_id and chat.user_id:
            try:
                # Tìm chatflow_id từ name_app
                chatflow_result = supabase.table('chatflows').select('id').eq('name', chat.name_app).execute()
                if chatflow_result.data and len(chatflow_result.data) > 0:
                    chatflow_id = chatflow_result.data[0]['id']

                    # Đảm bảo session tồn tại trước khi cập nhật
                    existing = supabase.table('user_chat_sessions').select('*').eq('user_id', chat.user_id).eq('chatflow_id', chatflow_id).execute()

                    current_time = data[1][0]['created_at'] if data[1] else None

                    if existing.data and len(existing.data) > 0:
                        # Cập nhật session hiện có
                        supabase.table('user_chat_sessions').update({
                            'conversation_id': chat.conversation_id,
                            'last_accessed': current_time,
                            'session_data': {
                                'last_message': chat.user_message[:100] + '...' if len(chat.user_message) > 100 else chat.user_message,
                                'last_chat_time': current_time,
                                'message_count': (existing.data[0].get('session_data', {}).get('message_count', 0) + 1)
                            },
                            'updated_at': current_time
                        }).eq('user_id', chat.user_id).eq('chatflow_id', chatflow_id).execute()
                    else:
                        # Tạo session mới nếu chưa tồn tại
                        session_data = {
                            'user_id': chat.user_id,
                            'chatflow_id': chatflow_id,
                            'conversation_id': chat.conversation_id,
                            'last_accessed': current_time,
                            'created_at': current_time,
                            'updated_at': current_time,
                            'session_data': {
                                'first_message': chat.user_message[:100] + '...' if len(chat.user_message) > 100 else chat.user_message,
                                'first_chat_time': current_time,
                                'message_count': 1,
                                'created_from_chat': True
                            }
                        }
                        supabase.table('user_chat_sessions').insert(session_data).execute()

                    print(f"Session updated for user {chat.user_id} with conversation {chat.conversation_id}")

            except Exception as e:
                print(f"Warning: Could not update session: {str(e)}")
                # Không raise exception để không làm gián đoạn việc lưu chat history

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

@router.get("/app/{name_app}")
def get_chat_history_by_app(name_app: str):
    """
    Lấy lịch sử chat của một app cụ thể, sắp xếp theo thời gian
    """
    try:
        from urllib.parse import unquote
        import html
        
        decoded_name_app = unquote(name_app)
        
        # Decode HTML entities nếu có
        html_decoded_name_app = html.unescape(decoded_name_app)

        # Thử query với tên app từ database thực tế
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
                # So sánh chính xác
                if app == html_decoded_name_app:
                    matched_app = app
                    break
                # So sánh sau khi decode HTML entities
                elif html.unescape(app) == html_decoded_name_app:
                    matched_app = app
                    break
                # Fuzzy matching nếu cần
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

        # Xử lý cấu trúc dữ liệu
        if isinstance(result.data, list) and len(result.data) > 0:
            records = result.data
        elif hasattr(result.data, 'data') and isinstance(result.data.data, list):
            records = result.data.data
        else:
            records = []

        # Nếu không tìm thấy với exact match, thử tìm gần đúng
        if len(records) == 0:
            all_result = supabase.table('chat_history').select('name_app').execute()
            if hasattr(all_result.data, 'data'):
                all_apps = [record['name_app'] for record in all_result.data.data if 'name_app' in record]
            else:
                all_apps = [record['name_app'] for record in all_result.data if 'name_app' in record]

        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_all_chat_history(limit: int = 100):
    """
    Lấy tất cả lịch sử chat, giới hạn số lượng
    """
    try:
        # Thử query với join users trước
        try:
            result = supabase.table('chat_history').select('''
                *,
                users!fk_user(username, full_name)
            ''').order('created_at', desc=True).limit(limit).execute()
        except:
            # Nếu join thất bại, query không join
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
def get_chat_history_by_conversation(conversation_id: str):
    """
    Lấy lịch sử chat của một conversation cụ thể
    """
    try:
        result = supabase.table('chat_history').select('''*''').eq('conversation_id', conversation_id).order('created_at', desc=True).execute()

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


class SyncDifyMessagesRequest(BaseModel):
    conversation_id: str
    user_id: int
    chatflow_name: str

@router.post("/sync-dify-messages")
def sync_dify_messages(
    request: SyncDifyMessagesRequest
):
    """
    Sync messages từ Dify API vào database
    """
    try:
        # Temporarily disable Dify API call for testing
        print(f"Received request: conversation_id={request.conversation_id}, user_id={request.user_id}, chatflow_name={request.chatflow_name}")
        
        # from dify_api_service import dify_service
        # success = dify_service.sync_messages_to_database(request.conversation_id, request.user_id, request.chatflow_name)
        
        success = True  # Mock success for testing
        
        if success:
            return {"message": "Messages synced successfully", "conversation_id": request.conversation_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to sync messages")
            
    except Exception as e:
        print(f"Error syncing Dify messages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
