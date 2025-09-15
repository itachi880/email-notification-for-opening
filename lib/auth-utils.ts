import { getServerSession } from 'next-auth';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

export async function getUserGmailCredentials(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, gmailPassword: true },
  });

  if (!user?.email || !user?.gmailPassword) {
    return null;
  }

  return {
    user: user.email,
    password: user.gmailPassword, // This is already the raw app password (we'll store it plain for IMAP)
  };
}

export function createUserGmailConfig(credentials: { user: string; password: string }) {
  return {
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: credentials.user,
        pass: credentials.password, // nodemailer expects 'pass' not 'password'
      },
    },
    imap: {
      user: credentials.user,
      password: credentials.password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false
      }
    }
  };
}