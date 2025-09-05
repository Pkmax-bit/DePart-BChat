import yagmail
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

# Email configuration
SMTP_USER = os.getenv('SMTP_USER', 'your-email@gmail.com')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'your-app-password')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 465))

def send_verification_code(email: str, code: str) -> bool:
    """
    Send verification code to user's email using real email service
    """
    print(f"Attempting to send email to {email} using {SMTP_SERVER}:{SMTP_PORT}")

    # Try SMTPLib first (more reliable)
    try:
        return send_verification_code_smtplib(email, code)
    except Exception as e:
        print(f"SMTPLib failed, trying Yagmail: {str(e)}")
        try:
            return send_verification_code_yagmail(email, code)
        except Exception as yag_error:
            print(f"Yagmail also failed: {str(yag_error)}")
            return False

def send_verification_code_smtplib(email: str, code: str) -> bool:
    """
    Send verification code using smtplib with robust SSL configuration
    """
    try:
        print(f"Using SMTPLib with SSL context...")

        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USER
        msg['To'] = email
        msg['Subject'] = "🔐 Mã xác thực đổi mật khẩu - Department BotChat"

        # HTML Email Template
        html_body = f"""
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mã xác thực đổi mật khẩu</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #f8f9fa;
                    padding: 20px;
                }}
                .container {{
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    margin: 20px 0;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .verification-code {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 4px;
                    padding: 20px 40px;
                    border-radius: 8px;
                    display: inline-block;
                    margin: 20px 0;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                }}
                .message {{
                    font-size: 16px;
                    margin: 20px 0;
                    color: #666;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-size: 14px;
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    border-top: 1px solid #e9ecef;
                }}
                .footer p {{
                    margin: 5px 0;
                }}
                .brand {{
                    font-weight: bold;
                    color: #667eea;
                }}
                @media (max-width: 480px) {{
                    .container {{
                        margin: 10px;
                    }}
                    .content {{
                        padding: 30px 20px;
                    }}
                    .verification-code {{
                        font-size: 28px;
                        padding: 15px 30px;
                        letter-spacing: 3px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Department BotChat</h1>
                    <p>Mã xác thực đổi mật khẩu</p>
                </div>

                <div class="content">
                    <h2 style="color: #333; margin-bottom: 10px;">Chào bạn!</h2>

                    <p class="message">
                        Bạn đã yêu cầu đổi mật khẩu cho tài khoản của mình.<br>
                        Đây là mã xác thực của bạn:
                    </p>

                    <div class="verification-code">
                        {code}
                    </div>

                    <p class="message">
                        <strong>Mã này sẽ hết hạn trong 10 phút.</strong><br>
                        Vui lòng nhập mã vào ứng dụng để hoàn tất việc đổi mật khẩu.
                    </p>

                    <div class="warning">
                        ⚠️ <strong>Lưu ý:</strong> Nếu bạn không yêu cầu đổi mật khẩu,<br>
                        vui lòng bỏ qua email này để đảm bảo an toàn cho tài khoản.
                    </div>
                </div>

                <div class="footer">
                    <p class="brand">Department BotChat Team</p>
                    <p>Hệ thống quản lý và chatbot thông minh</p>
                    <p style="font-size: 11px; color: #999;">
                        Email này được gửi tự động, vui lòng không trả lời.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        text_body = f"""
        Chào bạn,

        Bạn đã yêu cầu đổi mật khẩu cho tài khoản của mình.

        Mã xác thực của bạn là: {code}

        Mã này sẽ hết hạn trong 10 phút.

        Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.

        Trân trọng,
        Department BotChat Team
        """

        # Attach both plain text and HTML versions
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        # Try different SSL configurations
        print(f"Connecting to {SMTP_SERVER}:{SMTP_PORT}...")

        # First try with default SSL context
        try:
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context, timeout=30)
        except Exception as ssl_error:
            print(f"SSL connection failed: {ssl_error}")
            # Try without SSL context
            try:
                server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=30)
            except Exception as no_ssl_error:
                print(f"No SSL connection also failed: {no_ssl_error}")
                raise ssl_error  # Re-raise the original error

        print("Logging in...")
        server.login(SMTP_USER, SMTP_PASSWORD)

        print("Sending email...")
        text = msg.as_string()
        server.sendmail(SMTP_USER, email, text)
        server.quit()

        print(f"Verification code sent to {email} using SMTPLib")
        return True
    except Exception as e:
        print(f"SMTPLib error details: {str(e)}")
        print(f"Error type: {type(e)}")
        return False

def send_verification_code_yagmail(email: str, code: str) -> bool:
    """
    Send verification code using yagmail as fallback
    """
    try:
        print(f"Using Yagmail fallback...")

        # Use yagmail with minimal configuration
        yag = yagmail.SMTP(SMTP_USER, SMTP_PASSWORD)

        subject = "🔐 Mã xác thực đổi mật khẩu - Department BotChat"

        # HTML Email Template
        html_body = f"""
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mã xác thực đổi mật khẩu</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #f8f9fa;
                    padding: 20px;
                }}
                .container {{
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    margin: 20px 0;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .verification-code {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 4px;
                    padding: 20px 40px;
                    border-radius: 8px;
                    display: inline-block;
                    margin: 20px 0;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                }}
                .message {{
                    font-size: 16px;
                    margin: 20px 0;
                    color: #666;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-size: 14px;
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    border-top: 1px solid #e9ecef;
                }}
                .footer p {{
                    margin: 5px 0;
                }}
                .brand {{
                    font-weight: bold;
                    color: #667eea;
                }}
                @media (max-width: 480px) {{
                    .container {{
                        margin: 10px;
                    }}
                    .content {{
                        padding: 30px 20px;
                    }}
                    .verification-code {{
                        font-size: 28px;
                        padding: 15px 30px;
                        letter-spacing: 3px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Department BotChat</h1>
                    <p>Mã xác thực đổi mật khẩu</p>
                </div>

                <div class="content">
                    <h2 style="color: #333; margin-bottom: 10px;">Chào bạn!</h2>

                    <p class="message">
                        Bạn đã yêu cầu đổi mật khẩu cho tài khoản của mình.<br>
                        Đây là mã xác thực của bạn:
                    </p>

                    <div class="verification-code">
                        {code}
                    </div>

                    <p class="message">
                        <strong>Mã này sẽ hết hạn trong 10 phút.</strong><br>
                        Vui lòng nhập mã vào ứng dụng để hoàn tất việc đổi mật khẩu.
                    </p>

                    <div class="warning">
                        ⚠️ <strong>Lưu ý:</strong> Nếu bạn không yêu cầu đổi mật khẩu,<br>
                        vui lòng bỏ qua email này để đảm bảo an toàn cho tài khoản.
                    </div>
                </div>

                <div class="footer">
                    <p class="brand">Department BotChat Team</p>
                    <p>Hệ thống quản lý và chatbot thông minh</p>
                    <p style="font-size: 11px; color: #999;">
                        Email này được gửi tự động, vui lòng không trả lời.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        yag.send(to=email, subject=subject, contents=html_body)
        print(f"Verification code sent to {email} using Yagmail")
        return True
    except Exception as e:
        print(f"Yagmail error details: {str(e)}")
        return False
