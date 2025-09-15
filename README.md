# Email Received Verification

A Next.js application that tracks whether emails have been opened using tracking pixels.

## Features

- **URL Generator**: Create unique tracking URLs for each email
- **Tracking Pixel**: Custom image.png that logs email opens
- **Dashboard**: View email statistics and open rates
- **Database**: SQLite database to store email and open data
- **Real-time Tracking**: Track when emails are opened with IP and user agent info

## How It Works

1. **Generate Tracking URL**: Use the dashboard to create a unique tracking URL for an email
2. **Embed in Email**: Add the tracking URL as an image source in your email HTML
3. **Track Opens**: When the recipient opens the email, the image loads and logs the open
4. **View Statistics**: Check the dashboard to see which emails were opened and when

## Installation

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client and setup database:

```bash
npx prisma generate
npx prisma db push
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📜 Available Scripts

```bash
npm run dev                 # Start development server
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Run ESLint
npm run setup:production   # Validate production setup
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:studio         # Open Prisma Studio
```

## Usage

### Generating Tracking URLs

1. Go to the dashboard
2. Click "Generate Tracking URL"
3. Enter the recipient email (required)
4. Optionally add subject and content
5. Click "Generate URL"
6. Copy the generated URL and use it in your email

### Using in Emails

Add this HTML to your email (replace `YOUR_TRACKING_URL` with the generated URL):

```html
<img src="YOUR_TRACKING_URL" width="1" height="1" style="display:none;" />
```

### Example Email HTML

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Your Email Subject</h1>
    <p>Your email content here...</p>

    <!-- Tracking pixel -->
    <img
      src="http://localhost:3000/api/track/abc123def4"
      width="1"
      height="1"
      style="display:none;"
    />
  </body>
</html>
```

## API Endpoints

- `POST /api/generate-tracking-url` - Generate a new tracking URL
- `GET /api/track/[trackingId]` - Tracking pixel endpoint
- `GET /api/emails` - Get all emails and statistics

## Database Schema

- **emails**: Stores email information and tracking IDs
- **email_opens**: Records each time an email is opened

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
- `DATABASE_URL`: PostgreSQL connection string (recommended)

**📖 Full deployment guide:** See `DEPLOYMENT.md`

## Environment Variables

- `NEXT_PUBLIC_BASE_URL`: The base URL for your application (for generating tracking URLs)

## Technical Details

- **Framework**: Next.js 14 with App Router
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Tracking**: Custom image.png file
- **Unique IDs**: Generated using nanoid

## Security Considerations

- Tracking pixels are logged with IP addresses and user agents
- Consider implementing rate limiting for production use
- The tracking pixel returns even for invalid tracking IDs to avoid detection
