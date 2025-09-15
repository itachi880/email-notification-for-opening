# Gmail SMTP Troubleshooting Guide

## 🚨 Common Error: "Missing credentials for PLAIN"

This error occurs when Gmail SMTP authentication fails. Here's how to fix it:

### ✅ **Solution Steps:**

#### 1. **Verify 2-Factor Authentication is Enabled**
- Go to [Google Account Security](https://myaccount.google.com/security)
- Ensure **2-Step Verification** is **ON**
- Without 2FA, App Passwords won't work

#### 2. **Generate a New App Password**
- Go to [Google Account Security](https://myaccount.google.com/security)
- Click **2-Step Verification**
- Scroll down to **App passwords**
- Click **Select app** → **Mail**
- Click **Select device** → **Other (custom name)**
- Enter: **"Email Tracker"**
- **Copy the 16-character password** (format: `abcd efgh ijkl mnop`)

#### 3. **Test Your Credentials**
- **Log out** of the email tracker completely
- **Visit** http://localhost:3000/auth/signin
- **Enter your Gmail address** (e.g., `yourname@gmail.com`)
- **Enter the 16-character App Password** (not your regular Gmail password)
- **Click Sign in**

#### 4. **Verify Login Success**
- You should be redirected to the dashboard
- Your Gmail address should appear in the header
- Try accessing the Gmail client to verify IMAP works

### 🔧 **Additional Troubleshooting:**

#### Check Your App Password Format:
- ✅ **Correct:** `abcd efgh ijkl mnop` (16 characters with spaces)
- ❌ **Incorrect:** Your regular Gmail password
- ❌ **Incorrect:** Old/expired App Password

#### Common Issues:
1. **"Not authenticated"** → You need to log in first
2. **"Gmail credentials not found"** → Log out and log back in
3. **"Invalid login"** → Wrong App Password - generate a new one
4. **"Connection failed"** → Check internet connection

#### Debug Steps:
1. **Clear browser cookies** and try logging in again
2. **Generate a fresh App Password** (old ones may expire)
3. **Check the browser console** for additional error details
4. **Try a different browser** to rule out browser issues

### 📋 **Quick Checklist:**
- [ ] 2-Factor Authentication enabled on Google Account
- [ ] Fresh App Password generated (less than 1 hour old)
- [ ] Using Gmail address (not display name)  
- [ ] Using 16-character App Password (not regular password)
- [ ] Logged out and back in to refresh credentials
- [ ] Browser cookies cleared if issues persist

### 🎯 **Success Indicators:**
When everything is working correctly, you should see:
- ✅ **Login successful** - redirected to dashboard
- ✅ **Gmail client loads** with your real emails
- ✅ **Email sending works** without authentication errors
- ✅ **INBOX shows actual emails** with proper formatting

If you're still having issues after following these steps, the problem might be:
- **Gmail security settings** blocking the connection
- **Network/firewall issues** preventing SMTP connection
- **Temporary Gmail service issues**

### 🔐 **Security Notes:**
- App Passwords are **safer** than using your main password
- Each App Password is **app-specific** and can be revoked
- App Passwords **don't expire** unless you change your main password
- You can have **multiple App Passwords** for different apps