"use client";

import { useState, useEffect } from "react";

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

interface Statistics {
  totalEmails: number;
  totalOpens: number;
  uniqueOpens: number;
  openRate: string;
}

export default function Dashboard() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [newEmail, setNewEmail] = useState({
    recipientEmail: "",
    subject: "",
    content: "",
  });

  useEffect(() => {
    fetchEmails();
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Email Tracking Dashboard
            </h1>
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {showGenerator ? "Hide Generator" : "Generate Tracking URL"}
            </button>
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
    </div>
  );
}
