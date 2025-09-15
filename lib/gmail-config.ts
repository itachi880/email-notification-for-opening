export const gmailConfig = {
  user: process.env.GMAIL_USER || '',
  password: process.env.GMAIL_APP_PASSWORD || '',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER || '',
      pass: process.env.GMAIL_APP_PASSWORD || '',
    },
  },
  imap: {
    user: process.env.GMAIL_USER || '',
    password: process.env.GMAIL_APP_PASSWORD || '',
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT || '993'),
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    }
  }
};

export function validateGmailConfig(): boolean {
  return !!(gmailConfig.user && gmailConfig.password);
}