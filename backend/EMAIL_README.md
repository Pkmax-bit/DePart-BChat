# Email Configuration - Department BotChat

## Current Status
Currently using **mock implementation** for testing due to SSL issues with Gmail SMTP.

## To Switch to Real Email Sending

### Option 1: Fix Gmail SMTP SSL Issues
1. Update SSL configuration in `email_utils.py`
2. Replace mock implementation with:
   ```python
   return send_verification_code_smtplib(email, code)
   ```

### Option 2: Use Alternative Email Service
Consider using professional email services for better reliability:

#### SendGrid
- More reliable than Gmail SMTP
- Better deliverability
- Easy API integration

#### AWS SES
- Scalable and cost-effective
- High deliverability rates
- Good for production use

#### Mailgun
- Excellent for transactional emails
- Good API and SMTP support
- Reliable delivery

## Configuration
Update your `.env` file with the appropriate SMTP settings:

```env
# For Gmail (current)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=465

# For SendGrid
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
```

## Testing
The current mock implementation will:
- Log the verification code to server console
- Return success for testing password reset flow
- Show the code in API response for development

Remove the `test_code` field from API response before production deployment.
