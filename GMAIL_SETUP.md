# Gmail Client Setup Instructions

Your email tracking app now includes a built-in Gmail client! Follow these steps to configure it:

## 1. Enable Gmail App Passwords

Since you'll be connecting a third-party application to Gmail, you need to create an App Password:

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification" (you must have 2FA enabled)
4. Scroll down and click on "App passwords"
5. Select "Mail" as the app and "Other" as the device
6. Enter "Email Tracker" as the device name
7. Copy the generated 16-character password

## 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Edit `.env.local` and add your Gmail credentials:
   ```
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

## 3. Features Available

### ✅ Email Sending (Working)
- Compose and send emails through Gmail SMTP
- Support for both plain text and HTML emails
- Automatic email tracking pixel insertion
- Integration with the tracking dashboard

### ⚠️ Email Receiving (Demo Mode)
- Currently shows sample emails for demonstration
- Ready for IMAP integration (commented code provided)
- Mark emails as read/unread
- Email detail view

## 4. Start the Application

```bash
npm run dev
```

Visit http://localhost:3000 and click the "Gmail Client" button to access your email interface.

## 5. IMAP Implementation (Optional)

For full email receiving functionality, you can implement the IMAP code in `/app/api/gmail/inbox/route.ts`. The basic structure is already provided but commented out for safety.

## Security Notes

- Never commit your `.env.local` file to version control
- Use App Passwords instead of your regular Gmail password
- The tracking functionality respects user privacy by using invisible 1x1 pixel images
- All email data is stored locally in your SQLite database

## Troubleshooting

- **Authentication Error**: Check that your Gmail credentials are correct
- **Connection Timeout**: Verify your internet connection and Gmail settings
- **Permission Denied**: Make sure 2FA is enabled and you're using an App Password
- **Build Errors**: Run `npm install` to ensure all dependencies are installed

## Next Steps

1. Test sending an email with tracking enabled
2. Check the main dashboard to see tracking statistics
3. Customize the email templates and styling as needed
4. Consider implementing the full IMAP functionality for production use