const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Gmail Email Test Setup');
console.log('========================\n');

console.log('This script will help you set up the Gmail email test.');
console.log('You need a Gmail App Password to send emails securely.\n');

console.log('📋 Step-by-step setup:');
console.log('1. Go to: https://myaccount.google.com/security');
console.log('2. Enable 2-Step Verification (if not already enabled)');
console.log('3. Go to "App Passwords" section');
console.log('4. Generate a new app password for "Mail"');
console.log('5. Copy the generated password (format: abcd efgh ijkl mnop)\n');

rl.question('Do you have your Gmail App Password ready? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n✅ Great! Now let\'s set up the test...\n');
    
    rl.question('Enter your Gmail App Password: ', (appPassword) => {
      if (appPassword.trim()) {
        console.log('\n🔐 Setting up environment variable...');
        
        // Create a .env file for the test
        const fs = require('fs');
        const envContent = `GMAIL_APP_PASSWORD=${appPassword.trim()}\n`;
        
        try {
          fs.writeFileSync('.env.test', envContent);
          console.log('✅ Environment variable saved to .env.test');
          console.log('\n📧 Ready to send test email!');
          console.log('Run one of these commands:');
          console.log('  node simple-email-test.js');
          console.log('  node test-email-sender.js');
          console.log('\n⚠️  Remember to delete .env.test after testing for security!');
        } catch (error) {
          console.error('❌ Error saving environment variable:', error.message);
          console.log('\n💡 You can manually set the environment variable:');
          console.log(`set GMAIL_APP_PASSWORD=${appPassword.trim()}`);
        }
      } else {
        console.log('❌ No password provided. Please run the script again with a valid password.');
      }
      
      rl.close();
    });
  } else {
    console.log('\n📖 Please follow the steps above to get your Gmail App Password.');
    console.log('Then run this script again when you\'re ready.');
    rl.close();
  }
});

rl.on('close', () => {
  console.log('\n👋 Setup complete! Happy testing!');
});


