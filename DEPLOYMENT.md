# 🚀 Deployment Guide

## Email Received Verification App - Production Deployment

This guide provides step-by-step instructions for deploying your Email Verification App to production environments.

## 📋 Pre-Deployment Checklist

Run the pre-deployment validation:
```bash
npm run setup:production
```

This will check:
- ✅ Required environment variables
- ✅ Configuration files
- ✅ Database setup
- ✅ Security recommendations

## 🔑 Required Environment Variables

Set these variables in your deployment platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | JWT secret for NextAuth | `your-64-character-secret-key` |
| `NEXTAUTH_URL` | Full URL of your app | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_BASE_URL` | Public base URL for tracking | `https://your-domain.vercel.app` |
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host:port/db` |
| `NODE_ENV` | Environment mode | `production` |

### Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use the built-in generator
npm run setup:production
```

## 📦 Vercel Deployment (Recommended)

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXT_PUBLIC_BASE_URL
vercel env add DATABASE_URL
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Connect repository to Vercel dashboard
3. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables
4. Deploy automatically on push

### Vercel-Specific Configuration
The app includes `vercel.json` with optimizations:
- Custom build command with Prisma generation
- API route timeout configuration
- Headers for tracking pixels
- Image redirect handling

## 🐳 Docker Deployment

### Local Docker Testing
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:3000
```

### Production Docker
```bash
# Build image
docker build -t email-verification-app .

# Run container
docker run -p 3000:3000 \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  -e NEXT_PUBLIC_BASE_URL="https://your-domain.com" \
  -e DATABASE_URL="your-database-url" \
  email-verification-app
```

## 🗄️ Database Setup

### Turso (Recommended - SQLite-compatible, serverless)

#### Quick Setup with Your Database:
```bash
# Use the automated setup script
npm run setup:turso
```

Your Turso database URL: `libsql://emailclient-itachi880.aws-eu-west-1.turso.io`

#### Manual Setup:
1. Get your Turso auth token:
   ```bash
   # If you have Turso CLI installed
   turso auth token
   
   # Or get it from Turso dashboard
   ```
2. Set environment variables:
   ```bash
   TURSO_DATABASE_URL=libsql://emailclient-itachi880.aws-eu-west-1.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   DATABASE_URL=libsql://emailclient-itachi880.aws-eu-west-1.turso.io
   ```
3. Push schema: `npx prisma db push`

### Alternative: PostgreSQL

#### Option 1: Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Set as `DATABASE_URL`

#### Option 2: PlanetScale
1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Create branch and connection
4. Copy connection string
5. Set as `DATABASE_URL`

#### Option 3: Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create database
3. Copy connection string
4. Set as `DATABASE_URL`

### Database Migration
```bash
# After setting DATABASE_URL, run:
npx prisma db push

# Or for migrations:
npx prisma migrate deploy
```

## 🔧 Production Configuration

### Security Headers
The app includes security headers in `next.config.js`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

### Performance Optimizations
- Compression enabled
- Image optimization configured
- Cache headers for tracking endpoints

## 📊 Monitoring and Analytics

### Health Check Endpoint
Monitor your deployment with:
```
GET /api/health
```

### Tracking Pixel Performance
The tracking endpoints are optimized for:
- No caching (`Cache-Control: no-store`)
- CORS enabled for cross-origin requests
- Fast response times

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# If Prisma client issues:
npx prisma generate

# If TypeScript errors:
npm run lint
```

#### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database credentials
- Ensure database accepts connections

#### Environment Variables
```bash
# Verify all variables are set:
npm run setup:production
```

### Debugging Production

#### Enable Debug Logs
Set in your deployment:
```
DEBUG=true
NEXTAUTH_DEBUG=true
```

#### Check Database Connection
```bash
# Test database connectivity
npx prisma db pull
```

## 📈 Performance Monitoring

### Key Metrics to Monitor
- Response time for tracking pixels
- Database query performance
- Memory usage
- Error rates

### Recommended Tools
- Vercel Analytics (if using Vercel)
- Sentry for error tracking
- DataDog or New Relic for APM

## 🔄 Updates and Maintenance

### Deploying Updates
```bash
# Push to main branch (if using GitHub integration)
git push origin main

# Or deploy directly
vercel --prod
```

### Database Updates
```bash
# For schema changes:
npx prisma migrate deploy

# For data seeding:
npx prisma db seed
```

### Backup Recommendations
- Regular database backups
- Environment variable backups
- Code repository backups

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Verify all environment variables
3. Check deployment platform logs
4. Review database connection status

---

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)