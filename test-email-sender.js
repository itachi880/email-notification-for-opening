const esayMailer = require('esay_mailer');

// Email configuration for Gmail
const emailConfig = {
  service: 'gmail',
  auth: {
    user: 'jamaaoui.business@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your_app_password_here' // Use environment variable for security
  }
};

// Function to generate a tracking URL using http module
async function generateTrackingUrl() {
  const http = require('http');
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      recipientEmail: 'badortiana880@gmail.com',
      subject: 'Test Email with Tracking',
      content: 'This is a test email to verify the tracking system is working properly.'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/generate-tracking-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log('Tracking URL generated successfully!');
            console.log('Tracking ID:', result.trackingId);
            console.log('Tracking URL:', result.trackingUrl);
            resolve(result.trackingUrl);
          } else {
            reject(new Error('Failed to generate tracking URL'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error generating tracking URL:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Function to send email with tracking
async function sendTestEmail() {
  try {
    // First, generate a tracking URL
    const trackingUrl = await generateTrackingUrl();
    
    // Compose the email with tracking pixel
    const mailOptions = {
      from: 'jamaaoui.business@gmail.com',
      to: 'badortiana880@gmail.com',
      subject: 'Test Email with Tracking - Email Verification System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Tracking Test</h2>
          <p>Hello!</p>
          <p>This is a test email to verify that our email tracking system is working correctly.</p>
          <p>When you open this email, it will be tracked and you can view the details in our dashboard.</p>
          
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0066cc; margin-top: 0;">Tracking Information</h3>
            <p><strong>From:</strong> jamaaoui.business@gmail.com</p>
            <p><strong>To:</strong> badortiana880@gmail.com</p>
            <p><strong>Subject:</strong> Test Email with Tracking - Email Verification System</p>
            <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>You can view the tracking details by visiting our dashboard at: <a href="http://localhost:3001">http://localhost:3001</a></p>
          
          <p>Best regards,<br>Email Tracking System</p>
          
          <!-- Tracking pixel - this will be loaded when the email is opened -->
          <img src="${trackingUrl}" width="1" height="1" style="display: none;" alt="" />
        </div>
      `,
      text: `
        Email Tracking Test
        
        Hello!
        
        This is a test email to verify that our email tracking system is working correctly.
        When you open this email, it will be tracked and you can view the details in our dashboard.
        
        Tracking Information:
        - From: jamaaoui.business@gmail.com
        - To: badortiana880@gmail.com
        - Subject: Test Email with Tracking - Email Verification System
        - Sent: ${new Date().toLocaleString()}
        
        You can view the tracking details by visiting our dashboard at: http://localhost:3001
        
        Best regards,
        Email Tracking System
      `
    };

    // Send the email
    console.log('Sending email...');
    esayMailer.sendMail(emailConfig, mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\n📧 Email Details:');
        console.log('From: jamaaoui.business@gmail.com');
        console.log('To: badortiana880@gmail.com');
        console.log('Subject: Test Email with Tracking - Email Verification System');
        console.log('\n🔗 Tracking URL:', trackingUrl);
        console.log('\n📊 You can view the tracking details at: http://localhost:3001');
      }
    });

  } catch (error) {
    console.error('Error in sendTestEmail:', error);
  }
}

// Check if Gmail App Password is provided
if (!process.env.GMAIL_APP_PASSWORD && emailConfig.auth.pass === 'your_app_password_here') {
  console.log('⚠️  WARNING: Gmail App Password not provided!');
  console.log('Please set the GMAIL_APP_PASSWORD environment variable or update the script.');
  console.log('\nTo get your Gmail App Password:');
  console.log('1. Go to https://myaccount.google.com/security');
  console.log('2. Enable 2-Step Verification if not already enabled');
  console.log('3. Go to "App Passwords" and generate a new password');
  console.log('4. Use that password in the script or set it as an environment variable');
  console.log('\nExample: GMAIL_APP_PASSWORD=your_app_password node test-email-sender.js');
  process.exit(1);
}

// Run the test
console.log('🚀 Starting email tracking test...');
console.log('📧 Sending test email from jamaaoui.business@gmail.com to badortiana880@gmail.com');
console.log('');

sendTestEmail();
