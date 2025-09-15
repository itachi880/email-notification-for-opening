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
    if (databaseUrl.includes('postgresql://')) {
      console.log('✅ PostgreSQL database URL detected (recommended for production)');
    } else if (databaseUrl.includes('file:')) {
      console.log('⚠️  SQLite database detected (may not work in serverless environments)');
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
  
  console.log('📊 For Database Setup (PostgreSQL):');
  console.log('1. Create a PostgreSQL database (recommended: Supabase, PlanetScale, or Neon)');
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