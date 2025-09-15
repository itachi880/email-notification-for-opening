const Imap = require('node-imap');
const { simpleParser } = require('mailparser');

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  isRead: boolean;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

export class ImapClient {
  private imap: any;

  constructor(config: {
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
    tlsOptions?: any;
  }) {
    this.imap = new Imap(config);
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', resolve);
      this.imap.once('error', reject);
      this.imap.connect();
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.imap.once('end', resolve);
      this.imap.end();
    });
  }

  async getEmails(
    folder: string = 'INBOX',
    limit: number = 50,
    offset: number = 0
  ): Promise<{ emails: EmailMessage[]; total: number }> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folder, false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        const total = box.messages.total;
        
        if (total === 0) {
          resolve({ emails: [], total: 0 });
          return;
        }

        // Calculate range for pagination
        const start = Math.max(1, total - offset - limit + 1);
        const end = total - offset;
        
        if (start > end) {
          resolve({ emails: [], total });
          return;
        }

        const fetch = this.imap.seq.fetch(`${start}:${end}`, {
          bodies: '',
          struct: true,
          envelope: true,
        });

        const emails: EmailMessage[] = [];
        let processed = 0;
        let expectedCount = end - start + 1;

        fetch.on('message', (msg, seqno) => {
          let buffer = '';
          let envelope: any;
          let attributes: any;

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });

          msg.once('attributes', (attrs) => {
            attributes = attrs;
          });

          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(buffer);
              
              // Prefer HTML content if available, otherwise use text
              let emailBody = '';
              if (parsed.html) {
                emailBody = parsed.html;
              } else if (parsed.text) {
                emailBody = parsed.text;
              } else if (parsed.textAsHtml) {
                emailBody = parsed.textAsHtml;
              } else {
                emailBody = 'No content available';
              }
              
              emails.push({
                id: seqno.toString(),
                from: parsed.from?.text || 'Unknown',
                to: parsed.to?.text || '',
                subject: parsed.subject || 'No Subject',
                date: parsed.date?.toISOString() || new Date().toISOString(),
                body: emailBody,
                isRead: attributes.flags.includes('\\Seen'),
                attachments: parsed.attachments?.map(att => ({
                  filename: att.filename || 'untitled',
                  contentType: att.contentType || 'application/octet-stream',
                  size: att.size || 0,
                })),
              });
              
              processed++;
              
              if (processed === expectedCount) {
                // Sort by date (newest first)
                emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                resolve({ emails, total });
              }
            } catch (parseError) {
              console.error('Error parsing email:', parseError);
              processed++;
              
              if (processed === expectedCount) {
                emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                resolve({ emails, total });
              }
            }
          });
        });

        fetch.once('error', reject);
        
        fetch.once('end', () => {
          if (processed === 0) {
            resolve({ emails: [], total });
          }
        });
      });
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.imap.seq.addFlags(messageId, ['\\Seen'], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async markAsUnread(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.imap.seq.delFlags(messageId, ['\\Seen'], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }
}
