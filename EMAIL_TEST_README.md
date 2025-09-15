# Email Tracking Test with esay_mailer

This guide will help you test the email tracking system using the `esay_mailer` package to send emails from `jamaaoui.business@gmail.com` to `badortiana880@gmail.com`.

## Prerequisites

1. **Gmail Account Setup**: You need a Gmail account with 2-Step Verification enabled
2. **App Password**: Generate a Gmail App Password for secure authentication
3. **Email Tracking System**: Make sure your Next.js app is running on `http://localhost:3001`

## Step 1: Set Up Gmail App Password

1. Go to [Google Account Security Settings](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords** section
4. Generate a new app password for "Mail"
5. Copy the generated password (it will look like: `abcd efgh ijkl mnop`)

## Step 2: Install Dependencies

The required packages are already installed:
- `esay_mailer` - For sending emails
- `node-fetch` - For HTTP requests (if using the advanced test)

## Step 3: Run the Email Test

### Option A: Simple Test (Recommended)

Run the simple email test that uses a predefined tracking URL:

```bash
# Set your Gmail App Password as an environment variable
set GMAIL_APP_PASSWORD=your_app_password_here

# Run the simple test
node simple-email-test.js
```

### Option B: Advanced Test with Dynamic Tracking URL

This test generates a real tracking URL from your system:

```bash
# Make sure your Next.js app is running first
npm run dev

# In another terminal, set your Gmail App Password
set GMAIL_APP_PASSWORD=your_app_password_here

# Run the advanced test
node test-email-sender.js
```

## Step 4: Verify the Test

1. **Check Email Delivery**: Look for the email in `badortiana880@gmail.com` inbox
2. **Open the Email**: Click to open the email (this triggers the tracking)
3. **View Tracking Data**: Visit `http://localhost:3001` to see the tracking information
4. **Check Details**: Click "View Details" on the email to see IP address, user agent, and open history

## Test Scripts Explained

### `simple-email-test.js`
- **Purpose**: Quick test with a predefined tracking URL
- **Use Case**: When you want to test email delivery without generating a new tracking URL
- **Tracking URL**: Uses `http://localhost:3001/api/track/test-tracking-123`

### `test-email-sender.js`
- **Purpose**: Full integration test that generates a real tracking URL
- **Use Case**: When you want to test the complete workflow
- **Requirements**: Next.js app must be running on port 3001

## Email Content

The test email includes:
- **HTML Version**: Styled email with tracking pixel
- **Text Version**: Plain text fallback
- **Tracking Pixel**: Hidden 1x1 image that triggers tracking when loaded
- **Sender**: jamaaoui.business@gmail.com
- **Recipient**: badortiana880@gmail.com
- **Subject**: "Test Email with Tracking - Email Verification System"

## Troubleshooting

### Common Issues

1. **"Invalid login" Error**
   - Make sure 2-Step Verification is enabled
   - Use App Password, not your regular Gmail password
   - Check that the App Password is correct

2. **"Connection timeout" Error**
   - Check your internet connection
   - Verify Gmail SMTP settings
   - Try again after a few minutes

3. **"Tracking not working"**
   - Make sure your Next.js app is running
   - Check that the tracking URL is accessible
   - Verify the email client loads images

4. **"Email not received"**
   - Check spam/junk folder
   - Verify the recipient email address
   - Wait a few minutes for delivery

### Debug Steps

1. **Test Gmail Connection**:
   ```bash
   # Test with a simple email first
   node -e "const esayMailer = require('esay_mailer'); esayMailer.sendMail({service: 'gmail', auth: {user: 'jamaaoui.business@gmail.com', pass: 'your_app_password'}}, {from: 'jamaaoui.business@gmail.com', to: 'badortiana880@gmail.com', subject: 'Test', text: 'Test'}, console.log);"
   ```

2. **Test Tracking URL**:
   - Visit the tracking URL directly in your browser
   - Check the Next.js app logs for any errors
   - Verify the database has the tracking record

3. **Check App Logs**:
   - Look at the Next.js console for any errors
   - Check the email sending logs
   - Verify database connections

## Security Notes

- **Never commit your Gmail App Password to version control**
- **Use environment variables for sensitive data**
- **Consider using a dedicated test Gmail account**
- **Regularly rotate your App Passwords**

## Next Steps

After successful testing:
1. **Integrate with your application**: Use the tracking system in your real emails
2. **Monitor performance**: Check the dashboard regularly for tracking data
3. **Customize tracking**: Modify the tracking pixel or add more tracking features
4. **Scale up**: Consider using a professional email service for production

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all prerequisites are met
3. Test with a simple email first
4. Check the Next.js app is running and accessible


