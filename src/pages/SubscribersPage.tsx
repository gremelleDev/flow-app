// File: src/pages/SubscribersPage.tsx

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getSubscribers, createSubscriber, deleteSubscriber, type Subscriber } from '../utils/api';
import { X, Trash2 } from 'lucide-react';

/**
 * SubscribersPage
 *
 * Fetches and displays a list of subscribers in a responsive table.
 * Includes functionality to manually add new subscribers via a modal form.
 * The table includes placeholder columns for "Form" and "Campaign" for future use.
 */
export const SubscribersPage = () => {
  // ───────────────────────────────────────────────────────────────────────────────
  // State Definitions
  // ───────────────────────────────────────────────────────────────────────────────

  // Holds the array of subscribers once fetched
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  // Flag to indicate whether the fetch is in progress
  const [loading, setLoading] = useState<boolean>(true);

  // State for the modal and form
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState<string>('');
  const [newSubscriberFullName, setNewSubscriberFullName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────────────────────────
  // Data Fetching & Business Logic
  // ───────────────────────────────────────────────────────────────────────────────

  /**
   * useEffect hook to run fetch logic exactly once on mount.
   * getSubscribers() is our API call that returns a Promise<Subscriber[]>.
   */
  useEffect(() => {
    getSubscribers()
      .then((data) => {
        // When data arrives, update the subscribers state
        setSubscribers(data);
      })
      .catch((err) => {
        console.error('Failed to fetch subscribers:', err);
        setError('Could not load subscribers. Please try refreshing the page.');
      })
      .finally(() => {
        // Hide loading indicator whether fetch succeeded or failed
        setLoading(false);
      });
  }, []); // Empty dependency array → run once

  /**
   * Handles the submission of the new subscriber form.
   */
  const handleCreateSubscriber = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newSubscriberEmail) {
      setError('Email address is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newSubscriber = await createSubscriber({
        email: newSubscriberEmail,
        fullName: newSubscriberFullName,
      });

      setSubscribers(prev => [newSubscriber, ...prev]);
      
      // Close modal and reset form
      setIsModalOpen(false);
      setNewSubscriberEmail('');
      setNewSubscriberFullName('');

    } catch (err: any) {
      console.error('Failed to create subscriber:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles the deleting of a subscriber from the list on screen
   */
const handleDeleteSubscriber = async (subscriberId: string, subscriberEmail: string) => {
  // A confirmation dialog is crucial for destructive actions
  if (!window.confirm(`Are you sure you want to delete ${subscriberEmail}? This cannot be undone.`)) {
    return;
  }

  try {
    await deleteSubscriber(subscriberId);
    // On success, filter out the deleted subscriber from local state for instant UI feedback
    setSubscribers(prev => prev.filter(sub => sub.id !== subscriberId));
  } catch (err: any) {
    console.error('Failed to delete subscriber:', err);
    setError(err.message || 'Could not delete subscriber.');
  }
};

  // ───────────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page Title & Actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Subscribers
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + New Subscriber
        </button>
      </div>

      {/* Page-level error display */}
      {error && !isModalOpen && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

      {/* Loading State */}
      {loading ? (
        // While loading, show a subtle placeholder message
        <p className="text-gray-600">Loading subscribers…</p>
      ) : (
        // Data Loaded → Render Table
        // overflow-x-auto allows horizontal scroll on narrow viewports
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
                {/* NEW: Actions column */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.length > 0 ? (
                subscribers.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.fullName || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{sub.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.createdAt).toLocaleString()}</td>
                    {/* NEW: Delete button cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete ${sub.email}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    No subscribers found. Click "+ New Subscriber" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding a new subscriber */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Subscriber</h2>
            
            <form onSubmit={handleCreateSubscriber} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name (Optional)</label>
                <input
                  id="fullName"
                  type="text"
                  value={newSubscriberFullName}
                  onChange={(e) => setNewSubscriberFullName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={newSubscriberEmail}
                  onChange={(e) => setNewSubscriberEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="jane.doe@example.com"
                  required
                />
              </div>
              
              {error && isModalOpen && <p className="text-sm text-red-600">{error}</p>}
              
              <div className="flex justify-end pt-4 space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(null); }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};