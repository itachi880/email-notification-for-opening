#!/usr/bin/env node

/**
 * Production Environment Setup and Validation Script
 * Run this script to validate your production environment configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Email Verification App - Production Setup Validator\n');

// Required environment variables
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_BASE_URL',
  'DATABASE_URL'
];

// Turso-specific environment variables
const tursoEnvVars = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN'
];

// Optional but recommended environment variables
const recommendedEnvVars = [
  'NODE_ENV'
];

function checkEnvironmentVariables() {
  console.log('📋 Checking Environment Variables...\n');
  
  const missing = [];
  const present = [];
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      present.push(envVar);
      console.log(`✅ ${envVar}: Set`);
    } else {
      missing.push(envVar);
      console.log(`❌ ${envVar}: Missing`);
    }
  });
  
  console.log('\n📌 Recommended Variables:');
  recommendedEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: ${process.env[envVar]}`);
    } else {
      console.log(`⚠️  ${envVar}: Not set (recommended: "production")`);
    }
  });
  
  if (missing.length > 0) {
    console.log(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
    console.log('Please set these variables in your deployment platform or .env.local file');
    return false;
  }
  
  console.log('\n✅ All required environment variables are set!');
  return true;
}

function validateConfiguration() {
  console.log('\n🔧 Validating Configuration...\n');
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.log('❌ package.json not found');
    return false;
  }
  console.log('✅ package.json found');
  
  // Check if prisma schema exists
  if (!fs.existsSync('prisma/schema.prisma')) {
    console.log('❌ prisma/schema.prisma not found');
    return false;
  }
  console.log('✅ Prisma schema found');
  
  // Check if next.config.js exists
  if (!fs.existsSync('next.config.js')) {
    console.log('❌ next.config.js not found');
    return false;
  }
  console.log('✅ Next.js config found');
  
  // Check database URL format
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    if (databaseUrl.includes('libsql://')) {
      console.log('✅ Turso (libSQL) database URL detected (excellent for production!)');
      
      // Check for Turso-specific env vars
      const tursoUrl = process.env.TURSO_DATABASE_URL;
      const tursoToken = process.env.TURSO_AUTH_TOKEN;
      
      if (tursoUrl && tursoToken) {
        console.log('✅ Turso configuration complete');
      } else {
        console.log('⚠️  Missing Turso-specific environment variables:');
        if (!tursoUrl) console.log('   - TURSO_DATABASE_URL');
        if (!tursoToken) console.log('   - TURSO_AUTH_TOKEN');
      }
    } else if (databaseUrl.includes('postgresql://')) {
      console.log('✅ PostgreSQL database URL detected');
    } else if (databaseUrl.includes('file:')) {
      console.log('⚠️  Local SQLite database detected (for development only)');
    } else {
      console.log('⚠️  Unknown database type detected');
    }
  }
  
  return true;
}

function generateSecrets() {
  console.log('\n🔐 Security Recommendations...\n');
  
  const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  console.log('🔑 Generate a secure NEXTAUTH_SECRET:');
  console.log(`   ${generateRandomString(64)}\n`);
  
  console.log('💡 Production Environment Variables Template:');
  console.log('   NEXTAUTH_SECRET=your-generated-secret-above');
  console.log('   NEXTAUTH_URL=https://your-domain.vercel.app');
  console.log('   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app');
  console.log('   DATABASE_URL=postgresql://user:password@host:port/database');
}

function displayDeploymentInstructions() {
  console.log('\n🚀 Deployment Instructions...\n');
  
  console.log('📦 For Vercel Deployment:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect repository to Vercel');
  console.log('3. Set environment variables in Vercel dashboard');
  console.log('4. Deploy!\n');
  
  console.log('🐳 For Docker Deployment:');
  console.log('1. Update docker-compose.yml with your environment variables');
  console.log('2. Run: docker-compose up --build');
  console.log('3. Access app at http://localhost:3000\n');
  
  console.log('📊 For Turso Database Setup (Recommended):');
  console.log('1. Install Turso CLI: npm install -g @libsql/cli');
  console.log('2. Get your auth token: turso auth token');
  console.log('3. Set TURSO_DATABASE_URL=libsql://emailclient-itachi880.aws-eu-west-1.turso.io');
  console.log('4. Set TURSO_AUTH_TOKEN=your-auth-token');
  console.log('5. Set DATABASE_URL=libsql://emailclient-itachi880.aws-eu-west-1.turso.io');
  console.log('6. Run: npx prisma db push');
  console.log('');
  console.log('📊 Alternative: PostgreSQL Database:');
  console.log('1. Create a PostgreSQL database (Supabase, PlanetScale, or Neon)');
  console.log('2. Copy the connection string to DATABASE_URL');
  console.log('3. Run: npx prisma db push');
}

// Main execution
async function main() {
  const envValid = checkEnvironmentVariables();
  const configValid = validateConfiguration();
  
  generateSecrets();
  displayDeploymentInstructions();
  
  console.log('\n' + '='.repeat(60));
  if (envValid && configValid) {
    console.log('🎉 Your app appears ready for production deployment!');
  } else {
    console.log('⚠️  Please address the issues above before deploying.');
  }
  console.log('='.repeat(60));
}

if (require.main === module) {
  main().catch(console.error);
}