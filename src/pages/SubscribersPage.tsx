// File: src/pages/SubscribersPage.tsx

import { useEffect, useState } from 'react';
// CORRECTED: Update the import to use 'type' for the Subscriber interface.
import { getSubscribers, type Subscriber } from '../utils/api';

/**
 * SubscribersPage
 *
 * Fetches and displays a list of subscribers in a responsive table.
 * Now includes "Form" and "Campaign" columns to show each subscriber's origin.
 */
export const SubscribersPage = () => {
  // ───────────────────────────────────────────────────────────────────────────────
  // State Definitions
  // ───────────────────────────────────────────────────────────────────────────────

  // Holds the array of subscribers once fetched
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Flag to indicate whether the fetch is in progress
  const [loading, setLoading] = useState<boolean>(true);

  // ───────────────────────────────────────────────────────────────────────────────
  // Data Fetching
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * useEffect hook to run fetch logic exactly once on mount.
   * getSubscribers() is our stubbed API call that returns a Promise<Subscriber[]>.
   */
  useEffect(() => {
    getSubscribers()
      .then((data) => {
        // When data arrives, update the subscribers state
        setSubscribers(data);
      })
      .catch((err) => {
        console.error('Failed to fetch subscribers:', err);
      })
      .finally(() => {
        // Hide loading indicator whether fetch succeeded or failed
        setLoading(false);
      });
  }, []); // Empty dependency array → run once

  // ───────────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Subscribers
      </h1>

      {/* Loading State */}
      {loading ? (
        // While loading, show a subtle placeholder message
        <p className="text-gray-600">Loading subscribers…</p>
      ) : (
        // Data Loaded → Render Table
        // overflow-x-auto allows horizontal scroll on narrow viewports
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                {/* Column: Subscriber Name */}
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                {/* Column: Subscriber Email */}
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Email
                </th>
                {/* Column: Status (active/unsubscribed) */}
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                {/* Column: Subscription Date/Time */}
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Subscribed At
                </th>
                {/* Column: Form Name (origin of sign-up) */}
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Form
                </th>
                {/* Column: Campaign Name (sequence they’re in) */}
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Campaign
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Map over subscribers array and render each as a table row */}
              {subscribers.map((sub: Subscriber) => (
                <tr key={sub.email} className="border-t">
                  {/* Full Name Cell */}
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {sub.fullName}
                  </td>
                  {/* Email Address Cell */}
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {sub.email}
                  </td>
                  {/* Status Cell (capitalize for readability) */}
                  <td className="px-4 py-2 text-sm text-gray-800 capitalize">
                    {sub.status}
                  </td>
                  {/* SubscribedAt Cell: convert ISO string to localized format */}
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {new Date(sub.subscribedAt).toLocaleString()}
                  </td>
                  {/* Form Name Cell: fallback to '—' if undefined */}
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {sub.formName ?? '—'}
                  </td>
                  {/* Campaign Name Cell: fallback to '—' if undefined */}
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {sub.campaignName ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
