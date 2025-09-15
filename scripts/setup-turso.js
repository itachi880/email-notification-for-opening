#!/usr/bin/env node

/**
 * Turso Database Setup Script
 * Sets up and tests Turso database connection
 */

const fs = require('fs');

console.log('🗄️  Turso Database Setup for Email Verification App\n');

async function setupTursoEnvironment() {
  console.log('📋 Setting up Turso environment...\n');
  
  const tursoUrl = 'libsql://emailclient-itachi880.aws-eu-west-1.turso.io';
  
  console.log('🔧 Your Turso Database Configuration:');
  console.log(`   Database URL: ${tursoUrl}`);
  console.log('\n📝 Required Environment Variables:');
  console.log('   TURSO_DATABASE_URL=' + tursoUrl);
  console.log('   TURSO_AUTH_TOKEN=your-auth-token-here');
  console.log('   DATABASE_URL=' + tursoUrl);
  
  // Check if .env.local exists
  const envLocalExists = fs.existsSync('.env.local');
  
  if (!envLocalExists) {
    console.log('\n📄 Creating .env.local from template...');
    
    const envTemplate = `# Turso Database Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Turso Database
TURSO_DATABASE_URL=${tursoUrl}
TURSO_AUTH_TOKEN=your-turso-auth-token-here
DATABASE_URL=${tursoUrl}
`;
    
    fs.writeFileSync('.env.local', envTemplate);
    console.log('✅ Created .env.local file');
    console.log('⚠️  Please update TURSO_AUTH_TOKEN with your actual token!');
  } else {
    console.log('\n⚠️  .env.local already exists. Please update it manually with:');
    console.log(`   TURSO_DATABASE_URL=${tursoUrl}`);
    console.log('   TURSO_AUTH_TOKEN=your-auth-token');
    console.log(`   DATABASE_URL=${tursoUrl}`);
  }
}

async function testTursoConnection() {
  console.log('\n🔌 Testing Turso Connection...\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!tursoUrl || !tursoToken) {
    console.log('❌ Missing required environment variables:');
    if (!tursoUrl) console.log('   - TURSO_DATABASE_URL');
    if (!tursoToken) console.log('   - TURSO_AUTH_TOKEN');
    console.log('\nPlease update your .env.local file and try again.');
    return false;
  }
  
  try {
    // Test with the Turso client
    const { createClient } = require('@libsql/client');
    
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    
    const result = await client.execute('SELECT 1 as test');
    console.log('✅ Turso connection successful!');
    console.log(`   Result: ${JSON.stringify(result.rows)}`);
    
    return true;
  } catch (error) {
    console.log('❌ Turso connection failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('UNAUTHORIZED')) {
      console.log('\n💡 Tips:');
      console.log('   - Check if your TURSO_AUTH_TOKEN is correct');
      console.log('   - Make sure the token has access to this database');
      console.log('   - Get a new token with: turso auth token');
    }
    
    return false;
  }
}

async function setupDatabase() {
  console.log('\n🏗️  Setting up database schema...\n');
  
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    console.log('Running: npx prisma db push...');
    
    const process = spawn('npx', ['prisma', 'db', 'push'], {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database schema pushed successfully!');
        resolve(true);
      } else {
        console.log('❌ Failed to push database schema');
        reject(false);
      }
    });
  });
}

async function displayNextSteps() {
  console.log('\n🎉 Turso Setup Complete!\n');
  
  console.log('📋 Next Steps:');
  console.log('1. ✅ Update .env.local with your actual TURSO_AUTH_TOKEN');
  console.log('2. ✅ Run: npm run setup:production (to validate setup)');
  console.log('3. ✅ Run: npm run dev (to start development)');
  console.log('4. ✅ Deploy to production with the same environment variables');
  
  console.log('\n🚀 Production Deployment:');
  console.log('   Set these variables in your deployment platform:');
  console.log('   - NEXTAUTH_SECRET=your-secure-secret');
  console.log('   - NEXTAUTH_URL=https://your-domain.com');
  console.log('   - NEXT_PUBLIC_BASE_URL=https://your-domain.com');
  console.log('   - TURSO_DATABASE_URL=libsql://emailclient-itachi880.aws-eu-west-1.turso.io');
  console.log('   - TURSO_AUTH_TOKEN=your-production-token');
  console.log('   - DATABASE_URL=libsql://emailclient-itachi880.aws-eu-west-1.turso.io');
}

// Main execution
async function main() {
  try {
    await setupTursoEnvironment();
    
    const connectionTest = await testTursoConnection();
    
    if (connectionTest) {
      try {
        await setupDatabase();
      } catch (error) {
        console.log('\n⚠️  Database setup failed, but you can try manually with:');
        console.log('   npx prisma db push');
      }
    }
    
    displayNextSteps();
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}