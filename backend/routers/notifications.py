# routers/notifications.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import sys
import os

# Add backend directory to path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from models import (
    NotificationCreate, NotificationUpdate, NotificationResponse,
    NotificationSendRequest, NotificationLogResponse
)
from supabase_client import supabase
from email_service import email_service
from notification_scheduler import notification_scheduler
from datetime import datetime, timezone
import pytz
import logging

logger = logging.getLogger(__name__)

# Timezone utilities - Simplified for Vietnam local time
def local_to_utc(local_datetime_str: str) -> str:
    """Convert local datetime string to UTC ISO string"""
    if not local_datetime_str or not local_datetime_str.strip():
        return None

    try:
        # Parse the datetime string (from datetime-local input, it's already in Vietnam local time)
        local_dt = datetime.fromisoformat(local_datetime_str.replace('Z', '+00:00'))

        # Since user says Vietnam local time doesn't add hours, treat it as UTC
        if local_dt.tzinfo is None:
            local_dt = local_dt.replace(tzinfo=timezone.utc)

        return local_dt.isoformat()
    except Exception as e:
        logger.error(f"Error converting local to UTC: {str(e)}")
        return local_datetime_str  # Return as-is if conversion fails

def utc_to_local(utc_datetime_str: str) -> str:
    """Convert UTC datetime string to local timezone ISO string"""
    if not utc_datetime_str or not utc_datetime_str.strip():
        return None

    try:
        # Parse UTC datetime
        utc_dt = datetime.fromisoformat(utc_datetime_str.replace('Z', '+00:00'))
        if utc_dt.tzinfo is None:
            utc_dt = utc_dt.replace(tzinfo=timezone.utc)

        # Since user says Vietnam local time doesn't add hours, return as-is without timezone info
        # This prevents JavaScript from interpreting it as UTC and adding 7 hours
        return utc_dt.strftime('%Y-%m-%dT%H:%M')
    except Exception as e:
        logger.error(f"Error converting UTC to local: {str(e)}")
        return utc_datetime_str  # Return as-is if conversion fails

router = APIRouter()

@router.post("/notifications/", response_model=NotificationResponse)
async def create_notification(notification: NotificationCreate):
    """Tạo thông báo mới"""
    try:
        # Determine initial status
        if notification.scheduled_send_at and notification.scheduled_send_at.strip():
            status = 'published'  # Use 'published' instead of 'scheduled' to match DB constraint
        else:
            status = 'draft'

        # Handle scheduled_send_at - convert local time to UTC for storage
        scheduled_at = local_to_utc(notification.scheduled_send_at) if notification.scheduled_send_at and notification.scheduled_send_at.strip() else None

        result = supabase.table('notifications').insert({
            'title': notification.title,
            'content': notification.content,
            'type': notification.type,
            'priority': notification.priority,
            'status': status,
            'recipient_emails': notification.recipient_emails or [],
            'recipient_employees': notification.recipient_employees or [],
            'recipient_departments': notification.recipient_departments or [],
            'recipient_roles': notification.recipient_roles or [],
            'send_to_all': notification.send_to_all,
            'scheduled_send_at': scheduled_at
        }).execute()

        if result.data:
            created_notification = result.data[0]

            # Convert scheduled_send_at from UTC to local time for display
            if created_notification.get('scheduled_send_at'):
                created_notification['scheduled_send_at'] = utc_to_local(created_notification['scheduled_send_at'])

            # If no schedule is set, send immediately
            if not scheduled_at:
                send_result = notification_scheduler.send_notification_now(created_notification['id'])
                if send_result['success']:
                    # Update status to sent
                    supabase.table('notifications').update({
                        'status': 'sent',
                        'sent_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    }).eq('id', created_notification['id']).execute()
                    created_notification['status'] = 'sent'
                    created_notification['sent_at'] = datetime.now().isoformat()

            return created_notification
        else:
            raise HTTPException(status_code=500, detail="Không thể tạo thông báo")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo thông báo: {str(e)}")

@router.get("/notifications/", response_model=List[NotificationResponse])
async def get_notifications(status: Optional[str] = None, limit: int = 50, offset: int = 0):
    """Lấy danh sách thông báo"""
    try:
        query = supabase.table('notifications').select('*').order('created_at', desc=True).range(offset, offset + limit - 1)

        if status:
            query = query.eq('status', status)

        result = query.execute()

        # Convert scheduled_send_at from UTC to local time for display
        notifications = []
        for notification in result.data if result.data else []:
            if notification.get('scheduled_send_at'):
                notification['scheduled_send_at'] = utc_to_local(notification['scheduled_send_at'])
            notifications.append(notification)

        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy danh sách thông báo: {str(e)}")

@router.get("/notifications/{notification_id}", response_model=NotificationResponse)
async def get_notification(notification_id: int):
    """Lấy thông tin chi tiết thông báo"""
    try:
        result = supabase.table('notifications').select('*').eq('id', notification_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy thông báo")

        notification = result.data[0]

        # Convert scheduled_send_at from UTC to local time for display
        if notification.get('scheduled_send_at'):
            notification['scheduled_send_at'] = utc_to_local(notification['scheduled_send_at'])

        return notification
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy thông tin thông báo: {str(e)}")

@router.put("/notifications/{notification_id}", response_model=NotificationResponse)
async def update_notification(notification_id: int, notification: NotificationUpdate):
    """Cập nhật thông báo"""
    try:
        # Lấy thông báo hiện tại
        current_result = supabase.table('notifications').select('*').eq('id', notification_id).execute()
        if not current_result.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy thông báo")

        # Chuẩn bị dữ liệu cập nhật
        update_data = {}
        if notification.title is not None:
            update_data['title'] = notification.title
        if notification.content is not None:
            update_data['content'] = notification.content
        if notification.type is not None:
            update_data['type'] = notification.type
        if notification.priority is not None:
            update_data['priority'] = notification.priority
        if notification.status is not None:
            update_data['status'] = notification.status
        if notification.recipient_emails is not None:
            update_data['recipient_emails'] = notification.recipient_emails
        if notification.recipient_employees is not None:
            update_data['recipient_employees'] = notification.recipient_employees
        if notification.recipient_departments is not None:
            update_data['recipient_departments'] = notification.recipient_departments
        if notification.recipient_roles is not None:
            update_data['recipient_roles'] = notification.recipient_roles
        if notification.send_to_all is not None:
            update_data['send_to_all'] = notification.send_to_all
        if notification.scheduled_send_at is not None:
            update_data['scheduled_send_at'] = local_to_utc(notification.scheduled_send_at) if (notification.scheduled_send_at and notification.scheduled_send_at.strip()) else None

        update_data['updated_at'] = datetime.now().isoformat()

        if update_data:
            result = supabase.table('notifications').update(update_data).eq('id', notification_id).execute()
            updated_notification = result.data[0] if result.data else current_result.data[0]

            # Convert scheduled_send_at from UTC to local time for display
            if updated_notification.get('scheduled_send_at'):
                updated_notification['scheduled_send_at'] = utc_to_local(updated_notification['scheduled_send_at'])

            return updated_notification
        else:
            # Convert scheduled_send_at from UTC to local time for display
            if current_result.data[0].get('scheduled_send_at'):
                current_result.data[0]['scheduled_send_at'] = utc_to_local(current_result.data[0]['scheduled_send_at'])

            return current_result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật thông báo: {str(e)}")

@router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: int):
    """Xóa thông báo"""
    try:
        result = supabase.table('notifications').delete().eq('id', notification_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy thông báo")

        return {"message": "Đã xóa thông báo thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xóa thông báo: {str(e)}")

@router.post("/notifications/{notification_id}/send")
async def send_notification(notification_id: int):
    """Gửi thông báo ngay lập tức"""
    try:
        # Lấy thông báo
        notification_result = supabase.table('notifications').select('*').eq('id', notification_id).execute()

        if not notification_result.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy thông báo")

        notification = notification_result.data[0]

        if notification['status'] == 'sent':
            raise HTTPException(status_code=400, detail="Thông báo đã được gửi")

        # Send the notification using the scheduler service
        send_result = notification_scheduler.send_notification_now(notification_id)

        if send_result['success']:
            return {
                "message": f"Đã gửi thông báo thành công đến {send_result['sent_count']} người nhận",
                "notification_id": notification_id,
                "sent_count": send_result['sent_count']
            }
        else:
            raise HTTPException(status_code=500, detail=f"Lỗi gửi thông báo: {send_result['message']}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi gửi thông báo: {str(e)}")

@router.get("/notifications/{notification_id}/logs", response_model=List[NotificationLogResponse])
async def get_notification_logs(notification_id: int):
    """Lấy lịch sử gửi thông báo"""
    try:
        # Kiểm tra thông báo tồn tại
        notification_result = supabase.table('notifications').select('id').eq('id', notification_id).execute()
        if not notification_result.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy thông báo")

        # TODO: Implement notification logs table and logic
        # For now, return empty list
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy lịch sử gửi: {str(e)}")