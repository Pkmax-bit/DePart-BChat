#!/usr/bin/env python3
"""
Test script for email functionality
"""
import os
import sys
import smtplib
import ssl

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from email_utils import send_verification_code

def test_email_connection():
    """Test basic SMTP connection to Gmail"""
    try:
        print("Testing SMTP connection to Gmail...")

        # Test basic connection
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.quit()

        print("✅ Basic SMTP connection successful")

        # Test SSL connection
        context = ssl.create_default_context()
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context)
        server.quit()

        print("✅ SSL SMTP connection successful")

    except Exception as e:
        print(f"❌ SMTP connection failed: {e}")

def test_send_email():
    """Test sending actual email"""
    try:
        print("Testing email sending...")
        result = send_verification_code('phannguyendangkhoa0915@gmail.com', '123456')
        if result:
            print("✅ Email sent successfully")
        else:
            print("❌ Email sending failed")
    except Exception as e:
        print(f"❌ Email test failed: {e}")

if __name__ == "__main__":
    print("=== Email Testing Script ===")
    test_email_connection()
    print()
    test_send_email()
