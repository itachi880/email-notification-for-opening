"use client";

import { useState, useEffect } from "react";

export default function TestTracking() {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      const response = await fetch('/api/test-track');
      const data = await response.json();
      setTestData(data);
    } catch (error) {
      console.error('Error fetching test data:', error);
      setTestData({ error: 'Failed to fetch test data' });
    } finally {
      setLoading(false);
    }
  };

  const testTrackingUrl = () => {
    if (testData?.trackingUrl) {
      // Open tracking URL in a new tab
      window.open(testData.trackingUrl, '_blank');
      
      // Show instructions
      alert('Tracking URL opened in new tab. Check the browser console for tracking logs, then refresh this page to see if tracking worked.');
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchTestData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Email Tracking Test</h1>
            <div className="space-x-4">
              <button
                onClick={refreshData}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Refresh
              </button>
              <a
                href="/"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Dashboard
              </a>
            </div>
          </div>

          {testData?.error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{testData.error}</p>
              {testData.error.includes('No tracking emails') && (
                <p className="mt-2 text-sm text-red-600">
                  Go to the Gmail client and send an email with tracking enabled first.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Most Recent Tracking Email</h3>
                <div className="text-sm text-blue-700">
                  <p><strong>Tracking ID:</strong> {testData?.recentEmail?.trackingId}</p>
                  <p><strong>Recipient:</strong> {testData?.recentEmail?.recipientEmail}</p>
                  <p><strong>Subject:</strong> {testData?.recentEmail?.subject}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">Tracking URL</h3>
                <div className="bg-white p-3 rounded border text-sm font-mono break-all">
                  {testData?.trackingUrl}
                </div>
                <button
                  onClick={testTrackingUrl}
                  className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Test Tracking URL
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Test Instructions</h3>
                <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                  {testData?.testInstructions?.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">How Tracking Works</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>1. Email Sent:</strong> When you send an email with tracking enabled, a unique tracking ID is generated.</p>
                  <p><strong>2. Tracking Pixel:</strong> An invisible 1x1 pixel image is embedded in the email with the tracking URL.</p>
                  <p><strong>3. Email Opened:</strong> When the recipient opens the email, their email client loads the tracking pixel.</p>
                  <p><strong>4. Open Recorded:</strong> The tracking URL is accessed, recording the open in your database.</p>
                  <p><strong>5. Statistics Updated:</strong> The open appears in your dashboard statistics.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}