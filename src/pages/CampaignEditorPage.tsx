// File: src/pages/CampaignEditorPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaign, type Campaign } from '../utils/api'; // We will need to create getCampaign soon
import { ArrowLeft } from 'lucide-react';

/**
 * CampaignEditorPage
 * A dedicated page for editing the details and email sequence of a single campaign.
 */
export const CampaignEditorPage = () => {
  // Get the campaignId from the URL, e.g., /campaigns/xyz-123/edit -> "xyz-123"
  const { campaignId } = useParams<{ campaignId: string }>();

  // State for the campaign data being edited
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  // Standard loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // This useEffect hook runs when the component mounts or if the campaignId changes
  useEffect(() => {
    if (!campaignId) {
      setError("No campaign ID provided.");
      setLoading(false);
      return;
    }

    // NOTE: We need to implement getCampaign in api.ts next.
    // For now, this will fail, which is expected.
    getCampaign(campaignId)
      .then(setCampaign)
      .catch((err) => {
        console.error('Failed to fetch campaign:', err);
        setError('Could not load the campaign. It might have been deleted.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [campaignId]); // The hook re-runs if the campaignId in the URL changes

  // --- Render Logic ---

  // Loading State
  if (loading) {
    return <div className="p-8">Loading campaign editor...</div>;
  }

  // Error State
  if (error || !campaign) {
    return (
      <div className="p-8">
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error || 'Campaign not found.'}</p>
        <Link to="/campaigns" className="text-indigo-600 hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to all campaigns
        </Link>
      </div>
    );
  }

  // Main Editor Layout
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <Link to="/campaigns" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center mb-2">
          <ArrowLeft size={16} className="mr-1" />
          Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{campaign.name}</h1>
        <p className="text-gray-500">Editing email sequence</p>
      </div>
      
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Email Sequence List (Placeholder) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Sequence</h2>
          <p className="text-sm text-gray-400">Email steps will be listed here.</p>
        </div>

        {/* Right Column: Email Editor (Placeholder) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Email Editor</h2>
          <p className="text-sm text-gray-400">Form to edit the selected email's subject, body, and delay will go here.</p>
        </div>

      </div>
    </div>
  );
};