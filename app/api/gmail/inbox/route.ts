import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCurrentUser, getUserGmailCredentials, createUserGmailConfig } from '@/lib/auth-utils';
import { ImapClient, EmailMessage } from '@/lib/imap-client';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's Gmail credentials
    const credentials = await getUserGmailCredentials(user.id);
    if (!credentials) {
      return NextResponse.json(
        { error: 'Gmail credentials not found. Please log in again.' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'INBOX';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Create IMAP client
    const gmailConfig = createUserGmailConfig(credentials);
    const imapClient = new ImapClient(gmailConfig.imap);

    await imapClient.connect();
    
    try {
      const result = await imapClient.getEmails(folder, limit, offset);
      
      return NextResponse.json({
        success: true,
        emails: result.emails,
        folder,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } finally {
      await imapClient.disconnect();
    }

  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails. Please check your connection and try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const credentials = await getUserGmailCredentials(user.id);
    if (!credentials) {
      return NextResponse.json(
        { error: 'Gmail credentials not found. Please log in again.' },
        { status: 400 }
      );
    }

    const { action, emailId } = await request.json();

    // Create IMAP client
    const gmailConfig = createUserGmailConfig(credentials);
    const imapClient = new ImapClient(gmailConfig.imap);

    await imapClient.connect();

    try {
      if (action === 'mark_read' && emailId) {
        await imapClient.markAsRead(emailId);
        return NextResponse.json({ success: true });
      }

      if (action === 'mark_unread' && emailId) {
        await imapClient.markAsUnread(emailId);
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } finally {
      await imapClient.disconnect();
    }

  } catch (error) {
    console.error('Error processing email action:', error);
    return NextResponse.json(
      { error: 'Failed to process email action' },
      { status: 500 }
    );
  }
}
