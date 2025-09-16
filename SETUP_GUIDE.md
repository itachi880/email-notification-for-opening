# Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-very-secret-key-change-this-in-production

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Turso Database Configuration
DATABASE_URL=libsql://your-database-name.turso.io
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token-here
```

## Quick Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Setup Turso database:**

   ```bash
   npm run setup:turso
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Production Setup

1. **Update environment variables** with your production domain
2. **Set up Turso database** with your credentials
3. **Deploy to your preferred platform** (Vercel, Docker, etc.)

For detailed deployment instructions, see `DEPLOYMENT.md`.

