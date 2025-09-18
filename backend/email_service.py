import yagmail
import os
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Email configuration - you can move these to environment variables
        self.sender_email = os.getenv('SMTP_USER', 'your-email@example.com')
        self.sender_password = os.getenv('SMTP_PASSWORD', 'your-password')
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))

        # Initialize yagmail
        try:
            self.yag = yagmail.SMTP(
                user=self.sender_email,
                password=self.sender_password,
                host=self.smtp_server,
                port=self.smtp_port,
                smtp_ssl=False,  # Disable SSL, use TLS instead
                smtp_starttls=True,  # Enable STARTTLS
                smtp_skip_login=False
            )
            logger.info("Email service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize email service: {str(e)}")
            self.yag = None

    def send_notification_email(self, recipient_emails: List[str], subject: str, content: str, priority: str = "normal") -> bool:
        """
        Send notification email to multiple recipients

        Args:
            recipient_emails: List of recipient email addresses
            subject: Email subject
            content: Email content (HTML or plain text)
            priority: Email priority (high, normal, low)

        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.yag:
            logger.error("Email service not initialized")
            return False

        if not recipient_emails:
            logger.warning("No recipient emails provided")
            return False

        try:
            # Set email priority
            priority_headers = {
                'high': '1',
                'normal': '3',
                'low': '5'
            }

            headers = {
                'X-Priority': priority_headers.get(priority.lower(), '3'),
                'X-Mailer': 'Department Notification System'
            }

            # Send email
            self.yag.send(
                to=recipient_emails,
                subject=subject,
                contents=content,
                headers=headers
            )

            logger.info(f"Email sent successfully to {len(recipient_emails)} recipients")
            return True

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

    def send_bulk_notification(self, notification_data: dict) -> dict:
        """
        Send notification to multiple recipients with detailed logging

        Args:
            notification_data: Dictionary containing notification details

        Returns:
            dict: Result with success status and details
        """
        recipient_emails = notification_data.get('recipient_emails', [])
        title = notification_data.get('title', 'Notification')
        content = notification_data.get('content', '')
        priority = notification_data.get('priority', 'normal')

        if not recipient_emails:
            return {
                'success': False,
                'message': 'No recipient emails provided',
                'sent_count': 0,
                'failed_count': 0
            }

        # Send email
        success = self.send_notification_email(
            recipient_emails=recipient_emails,
            subject=title,
            content=content,
            priority=priority
        )

        if success:
            return {
                'success': True,
                'message': f'Notification sent to {len(recipient_emails)} recipients',
                'sent_count': len(recipient_emails),
                'failed_count': 0,
                'sent_at': datetime.now().isoformat()
            }
        else:
            return {
                'success': False,
                'message': 'Failed to send notification',
                'sent_count': 0,
                'failed_count': len(recipient_emails)
            }

# Global email service instance
email_service = EmailService()