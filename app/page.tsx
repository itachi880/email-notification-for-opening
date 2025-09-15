"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Email {
  id: number;
  recipient_email: string;
  subject: string;
  content: string;
  tracking_id: string;
  created_at: string;
  open_count: number;
  first_opened_at: string | null;
  last_opened_at: string | null;
}

interface EmailOpen {
  id: number;
  opened_at: string;
  ip_address: string | null;
  user_agent: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

interface EmailDetails extends Email {
  email_opens: EmailOpen[];
  active_opens: number;
  total_opens: number;
}

interface Statistics {
  totalEmails: number;
  totalOpens: number;
  uniqueOpens: number;
  openRate: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetails | null>(null);
  const [showEmailDetails, setShowEmailDetails] = useState(false);
  const [newEmail, setNewEmail] = useState({
    recipientEmail: "",
    subject: "",
    content: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  const fetchEmails = async () => {
    try {
      const response = await fetch("/api/emails");
      const data = await response.json();
      setEmails(data.emails);
      setStatistics(data.statistics);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingUrl = async () => {
    try {
      const response = await fetch("/api/generate-tracking-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmail),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Tracking URL generated!\n\nTracking ID: ${data.trackingId}\nURL: ${data.trackingUrl}\n\nUse this URL as an image source in your email:\n<img src="${data.trackingUrl}" width="1" height="1" />`
        );
        setNewEmail({ recipientEmail: "", subject: "", content: "" });
        setShowGenerator(false);
        fetchEmails();
      } else {
        alert("Error generating tracking URL");
      }
    } catch (error) {
      console.error("Error generating tracking URL:", error);
      alert("Error generating tracking URL");
    }
  };

  const resetOpens = async (emailId: number) => {
    if (
      !confirm(
        "Are you sure you want to reset the open count for this email? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset_opens",
          emailId: emailId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Open count reset successfully!");
        fetchEmails();
      } else {
        alert("Error resetting open count");
      }
    } catch (error) {
      console.error("Error resetting opens:", error);
      alert("Error resetting open count");
    }
  };

  const viewEmailDetails = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedEmail(data);
        setShowEmailDetails(true);
      } else {
        alert("Error fetching email details");
      }
    } catch (error) {
      console.error("Error fetching email details:", error);
      alert("Error fetching email details");
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
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">
                Email Tracking Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {session.user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/gmail"
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Gmail Client
              </a>
              <button
                onClick={() => setShowGenerator(!showGenerator)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {showGenerator ? "Hide Generator" : "Generate Tracking URL"}
              </button>
              <button
                onClick={() => signOut()}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>

          {showGenerator && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Generate Tracking URL
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={newEmail.recipientEmail}
                    onChange={(e) =>
                      setNewEmail({
                        ...newEmail,
                        recipientEmail: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newEmail.subject}
                    onChange={(e) =>
                      setNewEmail({ ...newEmail, subject: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    value={newEmail.content}
                    onChange={(e) =>
                      setNewEmail({ ...newEmail, content: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Email content"
                  />
                </div>
                <button
                  onClick={generateTrackingUrl}
                  disabled={!newEmail.recipientEmail}
                  className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  Generate URL
                </button>
              </div>
            </div>
          )}

          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">E</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Emails
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statistics.totalEmails}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">O</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Opens
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statistics.totalOpens}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">U</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Unique Opens
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statistics.uniqueOpens}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">%</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Open Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statistics.openRate}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Email Tracking History
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                View all tracked emails and their open statistics
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {emails.map((email) => (
                <li key={email.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            email.open_count > 0
                              ? "bg-green-400"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {email.recipient_email}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {email.subject || "No subject"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Created: {formatDate(email.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {email.open_count} open
                          {email.open_count !== 1 ? "s" : ""}
                        </p>
                        {email.first_opened_at && (
                          <p className="text-xs text-gray-500">
                            First: {formatDate(email.first_opened_at)}
                          </p>
                        )}
                        {email.last_opened_at &&
                          email.last_opened_at !== email.first_opened_at && (
                            <p className="text-xs text-gray-500">
                              Last: {formatDate(email.last_opened_at)}
                            </p>
                          )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          ID: {email.tracking_id}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewEmailDetails(email.id)}
                          className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded"
                        >
                          View Details
                        </button>
                        {email.open_count > 0 && (
                          <button
                            onClick={() => resetOpens(email.id)}
                            className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                          >
                            Reset Opens
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {emails.length === 0 && (
                <li className="px-4 py-8 sm:px-6 text-center text-gray-500">
                  No emails tracked yet. Generate your first tracking URL above.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Email Details Modal */}
      {showEmailDetails && selectedEmail && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Email Details
                </h3>
                <button
                  onClick={() => setShowEmailDetails(false)}
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
                  <h4 className="text-sm font-medium text-gray-700">
                    Email Information
                  </h4>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Recipient:</span>{" "}
                      {selectedEmail.recipient_email}
                    </p>
                    <p>
                      <span className="font-medium">Subject:</span>{" "}
                      {selectedEmail.subject || "No subject"}
                    </p>
                    <p>
                      <span className="font-medium">Content:</span>{" "}
                      {selectedEmail.content || "No content"}
                    </p>
                    <p>
                      <span className="font-medium">Tracking ID:</span>{" "}
                      {selectedEmail.tracking_id}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(selectedEmail.created_at)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Open Statistics
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-blue-600">Active Opens</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedEmail.active_opens}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">
                        Total Opens (All Time)
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedEmail.total_opens}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Open History
                  </h4>
                  <div className="mt-2 max-h-64 overflow-y-auto">
                    {selectedEmail.email_opens.length === 0 ? (
                      <p className="text-gray-500 text-sm">No opens recorded</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedEmail.email_opens.map((open) => (
                          <div
                            key={open.id}
                            className={`p-3 rounded border-l-4 ${
                              open.is_deleted
                                ? "bg-gray-50 border-gray-300"
                                : "bg-green-50 border-green-300"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(open.opened_at)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  IP: {open.ip_address || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {open.user_agent || "Unknown User Agent"}
                                </p>
                                {open.is_deleted && (
                                  <p className="text-xs text-red-600">
                                    Deleted:{" "}
                                    {open.deleted_at
                                      ? formatDate(open.deleted_at)
                                      : "Unknown"}
                                  </p>
                                )}
                              </div>
                              <div className="ml-2">
                                {open.is_deleted ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Deleted
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowEmailDetails(false)}
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
