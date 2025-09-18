import schedule
import time
import threading
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
import sys
import os
import pytz

# Add backend directory to path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from supabase_client import supabase
from email_service import email_service

logger = logging.getLogger(__name__)

class NotificationScheduler:
    def __init__(self):
        self.is_running = False
        self.scheduler_thread = None
        self.scheduled_jobs: Dict[int, schedule.Job] = {}

    def start_scheduler(self):
        """Start the notification scheduler in a background thread"""
        if self.is_running:
            logger.warning("Scheduler is already running")
            return

        self.is_running = True
        self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.scheduler_thread.start()
        logger.info("Notification scheduler started")

    def stop_scheduler(self):
        """Stop the notification scheduler"""
        self.is_running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("Notification scheduler stopped")

    def _run_scheduler(self):
        """Main scheduler loop"""
        logger.info("Scheduler loop started")

        while self.is_running:
            try:
                # Check for new scheduled notifications every minute
                self._check_scheduled_notifications()

                # Run pending scheduled jobs
                schedule.run_pending()

                # Sleep for 60 seconds
                time.sleep(60)

            except Exception as e:
                logger.error(f"Error in scheduler loop: {str(e)}")
                time.sleep(60)  # Wait before retrying

        logger.info("Scheduler loop ended")

    def _check_scheduled_notifications(self):
        """Check for notifications that need to be scheduled"""
        try:
            # Get notifications that are published but not yet sent and have a scheduled time
            now_utc = datetime.now(timezone.utc)
            current_time_utc = now_utc.isoformat()

            result = supabase.table('notifications').select('*').eq('status', 'published').lt('scheduled_send_at', current_time_utc).execute()

            if result.data:
                for notification in result.data:
                    self._schedule_notification(notification)

        except Exception as e:
            logger.error(f"Error checking scheduled notifications: {str(e)}")
            # Don't crash the scheduler, just log the error and continue

    def _schedule_notification(self, notification: dict):
        """Schedule a notification for sending"""
        try:
            notification_id = notification['id']
            scheduled_time_str = notification['scheduled_send_at']

            # Parse the scheduled time (stored as UTC)
            if scheduled_time_str.endswith('Z'):
                scheduled_time_str = scheduled_time_str[:-1] + '+00:00'

            scheduled_time_utc = datetime.fromisoformat(scheduled_time_str)
            if scheduled_time_utc.tzinfo is None:
                scheduled_time_utc = scheduled_time_utc.replace(tzinfo=timezone.utc)

            # Get current UTC time
            now_utc = datetime.now(timezone.utc)

            # Calculate delay in seconds
            delay_seconds = max(0, (scheduled_time_utc - now_utc).total_seconds())

            if delay_seconds > 0:
                # Schedule the job using local time for the schedule library
                # Since user says Vietnam local time doesn't add hours, convert UTC to local time
                scheduled_time_local = scheduled_time_utc.replace(tzinfo=None)  # Remove timezone info, treat as local
                job = schedule.every().day.at(scheduled_time_local.strftime("%H:%M")).do(
                    self._send_scheduled_notification,
                    notification_id=notification_id
                )

                self.scheduled_jobs[notification_id] = job
                logger.info(f"Scheduled notification {notification_id} for {scheduled_time_local} (local time)")
            else:
                # Send immediately if the scheduled time has passed
                self._send_scheduled_notification(notification_id)

        except Exception as e:
            logger.error(f"Error scheduling notification {notification['id']}: {str(e)}")

    def _send_scheduled_notification(self, notification_id: int):
        """Send a scheduled notification"""
        try:
            # Get notification details
            result = supabase.table('notifications').select('*').eq('id', notification_id).execute()

            if not result.data:
                logger.error(f"Notification {notification_id} not found")
                return

            notification = result.data[0]

            if notification['status'] != 'published':
                logger.warning(f"Notification {notification_id} status is not 'published'")
                return

            # Get recipient emails
            recipient_emails = self._get_recipient_emails(notification)

            if not recipient_emails:
                logger.warning(f"No recipients found for notification {notification_id}")
                # Still mark as sent to avoid repeated attempts
                supabase.table('notifications').update({
                    'status': 'sent',
                    'sent_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }).eq('id', notification_id).execute()
                return

            # Send the notification
            notification_data = {
                'recipient_emails': recipient_emails,
                'title': notification['title'],
                'content': notification['content'],
                'priority': notification.get('priority', 'normal')
            }

            result = email_service.send_bulk_notification(notification_data)

            # Update notification status
            update_data = {
                'status': 'sent' if result['success'] else 'cancelled',
                'sent_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

            supabase.table('notifications').update(update_data).eq('id', notification_id).execute()

            # Log the result
            log_data = {
                'notification_id': notification_id,
                'action': 'scheduled_send',
                'status': 'success' if result['success'] else 'failed',
                'details': result,
                'created_at': datetime.now().isoformat()
            }

            # TODO: Save to notification_logs table if it exists
            logger.info(f"Scheduled notification {notification_id} sent: {result}")

            # Remove from scheduled jobs
            if notification_id in self.scheduled_jobs:
                schedule.cancel_job(self.scheduled_jobs[notification_id])
                del self.scheduled_jobs[notification_id]

        except Exception as e:
            logger.error(f"Error sending scheduled notification {notification_id}: {str(e)}")

    def _get_recipient_emails(self, notification: dict) -> List[str]:
        """Get all recipient email addresses for a notification"""
        recipient_emails = set()

        try:
            # Direct email recipients
            if notification.get('recipient_emails'):
                recipient_emails.update(notification['recipient_emails'])

            # Employee recipients
            if notification.get('recipient_employees'):
                try:
                    for emp_id in notification['recipient_employees']:
                        emp_result = supabase.table('employees').select('email').eq('id', emp_id).execute()
                        if emp_result.data and emp_result.data[0].get('email'):
                            recipient_emails.add(emp_result.data[0]['email'])
                except Exception as e:
                    logger.error(f"Error getting employee emails: {str(e)}")

            # Department recipients
            if notification.get('recipient_departments'):
                try:
                    for dept_id in notification['recipient_departments']:
                        emp_result = supabase.table('employees').select('email').eq('department_id', dept_id).execute()
                        for emp in emp_result.data or []:
                            if emp.get('email'):
                                recipient_emails.add(emp['email'])
                except Exception as e:
                    logger.error(f"Error getting department emails: {str(e)}")

            # Role recipients
            if notification.get('recipient_roles'):
                try:
                    for role_id in notification['recipient_roles']:
                        emp_result = supabase.table('employees').select('email').eq('role_id', role_id).execute()
                        for emp in emp_result.data or []:
                            if emp.get('email'):
                                recipient_emails.add(emp['email'])
                except Exception as e:
                    logger.error(f"Error getting role emails: {str(e)}")

            # Send to all
            if notification.get('send_to_all'):
                try:
                    emp_result = supabase.table('employees').select('email').execute()
                    for emp in emp_result.data or []:
                        if emp.get('email'):
                            recipient_emails.add(emp['email'])
                except Exception as e:
                    logger.error(f"Error getting all employee emails: {str(e)}")

        except Exception as e:
            logger.error(f"Error getting recipient emails: {str(e)}")

        return list(recipient_emails)

    def send_notification_now(self, notification_id: int) -> dict:
        """Manually send a notification immediately"""
        try:
            # Get notification details
            result = supabase.table('notifications').select('*').eq('id', notification_id).execute()

            if not result.data:
                return {'success': False, 'message': 'Notification not found'}

            notification = result.data[0]

            # Get recipient emails
            recipient_emails = self._get_recipient_emails(notification)

            if not recipient_emails:
                return {'success': False, 'message': 'No recipients found'}

            # Send the notification
            notification_data = {
                'recipient_emails': recipient_emails,
                'title': notification['title'],
                'content': notification['content'],
                'priority': notification.get('priority', 'normal')
            }

            result = email_service.send_bulk_notification(notification_data)

            # Update notification status
            update_data = {
                'status': 'sent' if result['success'] else 'cancelled',
                'sent_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

            supabase.table('notifications').update(update_data).eq('id', notification_id).execute()

            return result

        except Exception as e:
            logger.error(f"Error sending notification now: {str(e)}")
            return {'success': False, 'message': str(e)}

# Global scheduler instance
notification_scheduler = NotificationScheduler()