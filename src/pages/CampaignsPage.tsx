// File: src/pages/CampaignsPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns, createCampaign, deleteCampaign, updateCampaign, type Campaign } from '../utils/api';
import { Edit, Trash2, Send, X } from 'lucide-react';

/**
 * CampaignsPage
 * Fetches and displays a list of all email campaigns for the tenant.
 * Provides actions to create, edit, or delete campaigns.
 */
export const CampaignsPage = () => {
  // State for storing the list of campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  // State to manage loading status while fetching data
  const [loading, setLoading] = useState<boolean>(true);
  // State to hold any potential error messages
  const [error, setError] = useState<string | null>(null);

  // State for the campaign creation modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // A single state object to hold all form data
  const [formState, setFormState] = useState({ name: '', fromName: '', fromEmail: '' });
  // This will hold the ID of the campaign we're editing, or null if we're creating
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // This useEffect hook runs once when the component mounts to fetch campaigns
  useEffect(() => {
    getCampaigns()
      .then(setCampaigns) // On success, update the campaigns state
      .catch((err) => {
        console.error('Failed to fetch campaigns:', err);
        setError('Could not load campaigns. Please try again later.');
      })
      .finally(() => {
        setLoading(false); // Stop loading, whether successful or not
      });
  }, []); // The empty dependency array ensures this runs only once

/**
   * Handles the submission of the campaign form.
   * It intelligently calls either createCampaign or updateCampaign
   * based on whether an editingCampaignId is set.
   */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!formState.name || !formState.fromName || !formState.fromEmail) {
    setError('All fields are required.');
    return;
  }

  setIsSubmitting(true);
  try {
    if (editingCampaignId) {
      // --- UPDATE LOGIC ---
      const updatedCampaign = await updateCampaign(editingCampaignId, formState);
      // Find and replace the campaign in our local state for an instant UI update
      setCampaigns(prev => prev.map(c => c.id === editingCampaignId ? updatedCampaign : c));
    } else {
      // --- CREATE LOGIC ---
      const newCampaign = await createCampaign(formState);
      setCampaigns(prev => [newCampaign, ...prev]);
    }
    
    // Close the modal and reset form state
    closeModal();

  } catch (err: any) {
    console.error('Failed to save campaign:', err);
    setError(err.message || 'An unknown error occurred.');
  } finally {
    setIsSubmitting(false);
  }
};

const openCreateModal = () => {
  setEditingCampaignId(null);
  setFormState({ name: '', fromName: '', fromEmail: '' });
  setIsModalOpen(true);
};

/*
const openEditModal = (campaign: Campaign) => {
  setEditingCampaignId(campaign.id);
  setFormState({ name: campaign.name, fromName: campaign.fromName, fromEmail: campaign.fromEmail });
  setIsModalOpen(true);
};
*/

const closeModal = () => {
  setIsModalOpen(false);
  setError(null);
};

/**
   * Handles deleting a campaign after user confirmation.
   */
const handleDeleteCampaign = async (campaignId: string, campaignName: string) => {
  // It's critical to confirm destructive actions
  if (!window.confirm(`Are you sure you want to delete the campaign "${campaignName}"? This cannot be undone.`)) {
    return;
  }

  try {
    await deleteCampaign(campaignId);
    // For instant UI feedback, filter the deleted campaign out of the local state
    setCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== campaignId));
  } catch (err: any) {
    console.error('Failed to delete campaign:', err);
    setError(err.message || 'Could not delete the campaign.');
  }
};

  // --- Render Logic ---

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Campaigns</h1>
        <button 
          onClick={openCreateModal}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          + Create Campaign
        </button>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading campaigns...</p>}

      {/* Error State */}
      {error && <p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p>}

      {/* Content Area */}
      {!loading && !error && (
        <>
          {/* Empty State */}
          {campaigns.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
              <Send className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No campaigns yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first campaign.</p>
            </div>
          ) : (
            // Grid of Campaign Cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
              <Link key={campaign.id} to={`/campaigns/${campaign.id}/edit`}>
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 truncate">{campaign.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        From: {campaign.fromName} &lt;{campaign.fromEmail}&gt;
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // <-- prevent button from triggering navigation to campaign page editor
                          handleDeleteCampaign(campaign.id, campaign.name);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600" 
                        aria-label="Delete campaign">
                        <Trash2 size={18} />
                      </button>
                      <Link 
                        to={`/campaigns/${campaign.id}/edit`}
                        className="p-2 text-gray-400 hover:text-indigo-600" 
                        aria-label="Edit campaign">
                        <Edit size={18} />
                      </Link>
                    </div>
                </div>
              </Link>          
              ))}
            </div>
          )}
        </>
      )}

      {/* --- Modal for Creating/Editing Campaign --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingCampaignId ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Campaign Name</label>
                <input
                  id="name" name="name" type="text"
                  value={formState.name}
                  onChange={(e) => setFormState(s => ({...s, name: e.target.value}))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="fromName" className="block text-sm font-medium text-gray-700">"From" Name</label>
                  <input
                    id="fromName" name="fromName" type="text"
                    value={formState.fromName}
                    onChange={(e) => setFormState(s => ({...s, fromName: e.target.value}))}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">"From" Email</label>
                  <input
                    id="fromEmail" name="fromEmail" type="email"
                    value={formState.fromEmail}
                    onChange={(e) => setFormState(s => ({...s, fromEmail: e.target.value}))}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Saving...' : (editingCampaignId ? 'Save Changes' : 'Save Campaign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};