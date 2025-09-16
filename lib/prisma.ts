import { createClient } from "@libsql/client";

// Turso client configuration
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Database operations using Turso client
export const db = {
  // User operations
  async createUser(data: {
    email: string;
    name?: string;
    image?: string;
    gmailPassword?: string;
  }) {
    const result = await tursoClient.execute({
      sql: `INSERT INTO users (email, name, image, gmailPassword) VALUES (?, ?, ?, ?)`,
      args: [
        data.email,
        data.name || null,
        data.image || null,
        data.gmailPassword || null,
      ],
    });
    return result;
  },

  async findUserByEmail(email: string) {
    const result = await tursoClient.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: [email],
    });
    return result.rows[0] || null;
  },

  async findUserById(id: string) {
    const result = await tursoClient.execute({
      sql: `SELECT * FROM users WHERE id = ?`,
      args: [id],
    });
    return result.rows[0] || null;
  },

  // Account operations
  async createAccount(data: any) {
    const result = await tursoClient.execute({
      sql: `INSERT INTO accounts (userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.userId,
        data.type,
        data.provider,
        data.providerAccountId,
        data.refresh_token,
        data.access_token,
        data.expires_at,
        data.token_type,
        data.scope,
        data.id_token,
        data.session_state,
      ],
    });
    return result;
  },

  async findAccount(provider: string, providerAccountId: string) {
    const result = await tursoClient.execute({
      sql: `SELECT * FROM accounts WHERE provider = ? AND providerAccountId = ?`,
      args: [provider, providerAccountId],
    });
    return result.rows[0] || null;
  },

  // Session operations
  async createSession(data: any) {
    const result = await tursoClient.execute({
      sql: `INSERT INTO sessions (sessionToken, userId, expires) VALUES (?, ?, ?)`,
      args: [data.sessionToken, data.userId, data.expires],
    });
    return result;
  },

  async findSession(sessionToken: string) {
    const result = await tursoClient.execute({
      sql: `SELECT * FROM sessions WHERE sessionToken = ?`,
      args: [sessionToken],
    });
    return result.rows[0] || null;
  },

  async deleteSession(sessionToken: string) {
    const result = await tursoClient.execute({
      sql: `DELETE FROM sessions WHERE sessionToken = ?`,
      args: [sessionToken],
    });
    return result;
  },

  // Email operations
  async createEmail(data: {
    recipientEmail: string;
    subject?: string;
    content?: string;
    trackingId: string;
    userId: string;
  }) {
    const result = await tursoClient.execute({
      sql: `INSERT INTO emails (recipientEmail, subject, content, trackingId, userId) VALUES (?, ?, ?, ?, ?)`,
      args: [
        data.recipientEmail,
        data.subject || null,
        data.content || null,
        data.trackingId,
        data.userId,
      ],
    });
    return result;
  },

  async findEmailByTrackingId(trackingId: string) {
    const result = await tursoClient.execute({
      sql: `SELECT * FROM emails WHERE trackingId = ?`,
      args: [trackingId],
    });
    return result.rows[0] || null;
  },

  async findEmailsByUserId(userId: string) {
    const result = await tursoClient.execute({
      sql: `SELECT * FROM emails WHERE userId = ? ORDER BY createdAt DESC`,
      args: [userId],
    });
    return result.rows;
  },

  // Email open operations
  async createEmailOpen(data: {
    emailId: number;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const result = await tursoClient.execute({
      sql: `INSERT INTO email_opens (emailId, ipAddress, userAgent) VALUES (?, ?, ?)`,
      args: [data.emailId, data.ipAddress || null, data.userAgent || null],
    });
    return result;
  },

  async findEmailOpensByEmailId(emailId: number) {
    const result = await tursoClient.execute({
      sql: `SELECT * FROM email_opens WHERE emailId = ? ORDER BY openedAt DESC`,
      args: [emailId],
    });
    return result.rows;
  },

  // Sent email operations
  async createSentEmail(data: {
    recipientEmail: string;
    subject?: string;
    content?: string;
    messageId?: string;
    trackingId?: string;
    userId: string;
  }) {
    const result = await tursoClient.execute({
      sql: `INSERT INTO sent_emails (recipientEmail, subject, content, messageId, trackingId, userId) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        data.recipientEmail,
        data.subject || null,
        data.content || null,
        data.messageId || null,
        data.trackingId || null,
        data.userId,
      ],
    });
    return result;
  },

  async findSentEmailsByUserId(userId: string) {
    const result = await tursoClient.execute({
      sql: `SELECT * FROM sent_emails WHERE userId = ? ORDER BY sentAt DESC`,
      args: [userId],
    });
    return result.rows;
  },
};

// For backward compatibility, export as prisma
export const prisma = db;
