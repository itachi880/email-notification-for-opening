"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { sanitizeHTML, isHTMLContent, extractTextFromHTML, formatPlainTextEmail } from "@/lib/html-sanitizer";

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  isRead: boolean;
}

interface ComposeEmail {
  to: string;
  subject: string;
  content: string;
  isHtml: boolean;
  includeTracking: boolean;
}

export default function GmailClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [composeEmail, setComposeEmail] = useState<ComposeEmail>({
    to: "",
    subject: "",
    content: "",
    isHtml: false,
    includeTracking: true,
  });
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showRawHTML, setShowRawHTML] = useState(false);
  const limit = 20;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch emails when session is ready
  useEffect(() => {
    if (session) {
      fetchEmails(1);
    }
  }, [session, fetchEmails]);

  const fetchEmails = useCallback(async (page: number = currentPage) => {
    try {
      const response = await fetch(`/api/gmail/inbox?page=${page}&limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setEmails(data.emails);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
      } else {
        console.error("Failed to fetch emails:", data.error);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  const sendEmail = async () => {
    if (!composeEmail.to || !composeEmail.subject || !composeEmail.content) {
      alert("Please fill in all required fields");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/gmail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(composeEmail),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Email sent successfully! ${data.trackingId ? `Tracking ID: ${data.trackingId}` : ""}`);
        setComposeEmail({
          to: "",
          subject: "",
          content: "",
          isHtml: false,
          includeTracking: true,
        });
        setShowCompose(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const response = await fetch("/api/gmail/inbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "mark_read",
          emailId,
        }),
      });

      if (response.ok) {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, isRead: true } : email
        ));
      }
    } catch (error) {
      console.error("Error marking email as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle loading and authentication states
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading Gmail...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // This will be handled by the redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gmail Client</h1>
              <p className="text-sm text-gray-600 mt-1">
                {session.user?.email} • {total} emails
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCompose(!showCompose)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {showCompose ? "Hide Compose" : "Compose Email"}
              </button>
              <a
                href="/"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Dashboard
              </a>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Compose Email Panel */}
          {showCompose && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Compose Email</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    To *
                  </label>
                  <input
                    type="email"
                    value={composeEmail.to}
                    onChange={(e) =>
                      setComposeEmail({ ...composeEmail, to: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={composeEmail.subject}
                    onChange={(e) =>
                      setComposeEmail({ ...composeEmail, subject: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content *
                  </label>
                  <textarea
                    value={composeEmail.content}
                    onChange={(e) =>
                      setComposeEmail({ ...composeEmail, content: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={8}
                    placeholder="Email content"
                  />
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={composeEmail.isHtml}
                      onChange={(e) =>
                        setComposeEmail({ ...composeEmail, isHtml: e.target.checked })
                      }
                      className="mr-2"
                    />
                    HTML Email
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={composeEmail.includeTracking}
                      onChange={(e) =>
                        setComposeEmail({ ...composeEmail, includeTracking: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Include Email Tracking
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={sendEmail}
                    disabled={sending}
                    className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                  >
                    {sending ? "Sending..." : "Send Email"}
                  </button>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mb-4 rounded-md shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => currentPage > 1 && fetchEmails(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => currentPage < totalPages && fetchEmails(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * limit, total)}</span> of{' '}
                    <span className="font-medium">{total}</span> emails
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => currentPage > 1 && fetchEmails(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {(() => {
                      const maxVisiblePages = 10;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Adjust start page if we're near the end
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      const pages = [];
                      
                      // Add first page if not visible
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => fetchEmails(1)}
                            className="relative inline-flex items-center px-4 py-2 border bg-white border-gray-300 text-gray-500 hover:bg-gray-50 text-sm font-medium"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          );
                        }
                      }
                      
                      // Add visible page range
                      for (let page = startPage; page <= endPage; page++) {
                        pages.push(
                          <button
                            key={page}
                            onClick={() => fetchEmails(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      
                      // Add last page if not visible
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          );
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => fetchEmails(totalPages)}
                            className="relative inline-flex items-center px-4 py-2 border bg-white border-gray-300 text-gray-500 hover:bg-gray-50 text-sm font-medium"
                          >
                            {totalPages}
                          </button>
                        );
                      }
                      
                      return pages;
                    })()}
                    <button
                      onClick={() => currentPage < totalPages && fetchEmails(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Email List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Inbox (Page {currentPage} of {totalPages})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your received emails
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {emails.map((email) => (
                <li
                  key={email.id}
                  className={`px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 ${
                    !email.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    setSelectedEmail(email);
                    if (!email.isRead) {
                      markAsRead(email.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            email.isRead ? "bg-gray-300" : "bg-blue-500"
                          }`}
                        ></div>
                        <p className={`text-sm font-medium text-gray-900 truncate ${
                          !email.isRead ? "font-bold" : ""
                        }`}>
                          {email.from}
                        </p>
                      </div>
                      <p className={`mt-1 text-sm text-gray-600 truncate ${
                        !email.isRead ? "font-semibold" : ""
                      }`}>
                        {email.subject}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        {(() => {
                          const previewText = isHTMLContent(email.body) 
                            ? extractTextFromHTML(email.body)
                            : email.body;
                          // Clean up the preview text (remove multiple spaces, line breaks)
                          const cleanText = previewText.replace(/\s+/g, ' ').trim();
                          return cleanText.length > 100 
                            ? cleanText.substring(0, 100) + '...' 
                            : cleanText;
                        })()
                        }
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(email.date)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {emails.length === 0 && (
                <li className="px-4 py-8 sm:px-6 text-center text-gray-500">
                  No emails in your inbox yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Email Details Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Email Details
                </h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p><strong>From:</strong> {selectedEmail.from}</p>
                  <p><strong>Subject:</strong> {selectedEmail.subject}</p>
                  <p><strong>Date:</strong> {formatDate(selectedEmail.date)}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Content</h4>
                    <div className="flex items-center space-x-2">
                      {isHTMLContent(selectedEmail.body) && (
                        <button
                          onClick={() => setShowRawHTML(!showRawHTML)}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                        >
                          {showRawHTML ? 'Rendered' : 'Raw HTML'}
                        </button>
                      )}
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {isHTMLContent(selectedEmail.body) ? 'HTML' : 'Text'}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded p-3">
                    {isHTMLContent(selectedEmail.body) ? (
                      showRawHTML ? (
                        <pre className="whitespace-pre-wrap text-xs font-mono">
                          {selectedEmail.body}
                        </pre>
                      ) : (
                        <div 
                          className="email-content"
                          dangerouslySetInnerHTML={{ 
                            __html: sanitizeHTML(selectedEmail.body) 
                          }}
                          style={{
                            maxWidth: '100%',
                            overflow: 'auto'
                          }}
                        />
                      )
                    ) : (
                      <div 
                        className="email-content"
                        dangerouslySetInnerHTML={{ 
                          __html: formatPlainTextEmail(selectedEmail.body) 
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Debug Section - can be toggled */}
                  <details className="mt-4">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Debug Info (click to expand)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                      <p><strong>Is HTML:</strong> {isHTMLContent(selectedEmail.body) ? 'Yes' : 'No'}</p>
                      <p><strong>Content Length:</strong> {selectedEmail.body?.length || 0} characters</p>
                      <p><strong>Contains URLs:</strong> {/(https?:\/\/[^\s<>"'()\[\]]+)/i.test(selectedEmail.body || '') ? 'Yes' : 'No'}</p>
                      <p><strong>First 300 chars:</strong></p>
                      <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {selectedEmail.body?.substring(0, 300) || 'No content'}
                      </pre>
                      {isHTMLContent(selectedEmail.body) ? (
                        <>
                          <p className="mt-2"><strong>Sanitized HTML (first 300 chars):</strong></p>
                          <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto whitespace-pre-wrap">
                            {sanitizeHTML(selectedEmail.body)?.substring(0, 300) || 'No content'}
                          </pre>
                        </>
                      ) : (
                        <>
                          <p className="mt-2"><strong>Formatted Plain Text (first 300 chars):</strong></p>
                          <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto whitespace-pre-wrap">
                            {formatPlainTextEmail(selectedEmail.body)?.substring(0, 300) || 'No content'}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}