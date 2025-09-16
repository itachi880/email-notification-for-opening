# Email Received Verification

A Next.js application that tracks whether emails have been opened using tracking pixels with Gmail integration and Turso database.

## Features

- **Gmail Integration**: Real Gmail IMAP access with authentication
- **Email Tracking**: Track email opens with detailed analytics
- **User Authentication**: Secure Gmail-based login system
- **Turso Database**: Scalable cloud database with libsql
- **Real-time Tracking**: Track when emails are opened with IP and user agent info
- **Email Sending**: Send emails with automatic tracking pixel insertion

## How It Works

1. **Gmail Authentication**: Login with your Gmail credentials and App Password
2. **Email Management**: View your real Gmail inbox with pagination
3. **Generate Tracking URLs**: Create unique tracking URLs for emails you want to track
4. **Send Emails**: Send emails with automatic tracking pixel insertion
5. **Track Opens**: When recipients open emails, detailed analytics are recorded
6. **View Statistics**: Check the dashboard for comprehensive email analytics

## Installation

1. Install dependencies:

```bash
npm install
```

2. Setup your database:

**Turso Database (Recommended)**

```bash
npm run setup:turso
# This will:
# - Configure your Turso database
# - Set up environment variables
# - Test the connection
# - Push the schema
```

**Manual setup**

```bash
npx prisma generate
npx prisma db push
```

3. Run the development server:

```bash
npm run dev
```

4. Open your browser and navigate to your app URL

## 📜 Available Scripts

```bash
npm run dev                 # Start development server
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Run ESLint
npm run setup:production   # Validate production setup
npm run setup:turso        # Setup Turso database (automated)
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:studio         # Open Prisma Studio
```

## Usage

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click **2-Step Verification** → **App passwords**
   - Select **Mail** and **Other (custom name)**
   - Enter "Email Tracker" as device name
   - Copy the 16-character password

### Using the Application

1. **Login**: Use your Gmail address and App Password
2. **Gmail Client**: View your real Gmail inbox with pagination
3. **Generate Tracking URLs**: Create unique tracking URLs for emails
4. **Send Emails**: Send emails with automatic tracking pixel insertion
5. **View Analytics**: Check detailed email open statistics

### Email Tracking

The system automatically inserts tracking pixels when sending emails. For manual tracking, add this HTML to your email:

```html
<img src="YOUR_TRACKING_URL" width="1" height="1" style="display:none;" />
```

## API Endpoints

- `POST /api/generate-tracking-url` - Generate a new tracking URL
- `GET /api/track/[trackingId]` - Tracking pixel endpoint
- `GET /api/emails` - Get all emails and statistics

## Database Schema

- **users**: User authentication and Gmail credentials
- **emails**: Email information and tracking IDs
- **email_opens**: Records each time an email is opened
- **sent_emails**: Records of sent emails with tracking

## 🚀 Production Deployment

**Your app is now ready for production deployment!**

### Quick Start

```bash
# Validate your production setup
npm run setup:production

# Check for any issues before deploying
npm run lint
```

### Deployment Options

#### 📦 Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel dashboard
3. Set environment variables (see DEPLOYMENT.md)
4. Deploy automatically!

#### 🐳 Docker

```bash
docker-compose up --build
```

#### ⚙️ Other Platforms

See `DEPLOYMENT.md` for detailed instructions for all platforms.

### 🔑 Required Environment Variables

- `NEXTAUTH_SECRET`: Secure random string (64+ characters)
- `NEXTAUTH_URL`: Your app's production URL
- `NEXT_PUBLIC_BASE_URL`: Same as NEXTAUTH_URL
- `DATABASE_URL`: Turso database connection string
- `TURSO_DATABASE_URL`: Your Turso database URL
- `TURSO_AUTH_TOKEN`: Your Turso authentication token

**📖 Full deployment guide:** See `DEPLOYMENT.md`

## Environment Variables

- `NEXT_PUBLIC_BASE_URL`: The base URL for your application (for generating tracking URLs)

## Technical Details

- **Framework**: Next.js 14 with App Router
- **Database**: Turso (libsql) with Prisma ORM
- **Authentication**: NextAuth.js with Gmail credentials
- **Email**: Gmail IMAP integration with nodemailer
- **Styling**: Tailwind CSS
- **Tracking**: Custom tracking pixel system
- **Unique IDs**: Generated using nanoid

## Security Considerations

- Tracking pixels are logged with IP addresses and user agents
- Consider implementing rate limiting for production use
- The tracking pixel returns even for invalid tracking IDs to avoid detection
