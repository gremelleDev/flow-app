// File: src/pages/CampaignEditorPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaign, updateCampaign, type Campaign } from '../utils/api'; // We will need to create getCampaign soon
import { ArrowLeft } from 'lucide-react';
import { EmailSequenceList } from '../components/EmailSequenceList';
import { EmailEditorForm } from '../components/EmailEditorForm';

/**
 * CampaignEditorPage
 * A dedicated page for editing the details and email sequence of a single campaign.
 */
export const CampaignEditorPage = () => {
  // This will track when an API call to save is in progress
  const [isSaving, setIsSaving] = useState(false);
  // Get the campaignId from the URL, e.g., /campaigns/xyz-123/edit -> "xyz-123"
  const { campaignId } = useParams<{ campaignId: string }>();
  const [isSequenceCollapsed, setIsSequenceCollapsed] = useState(false);
  // State for the campaign data being edited
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  // This will hold the ID of the email currently being edited in the right-hand form
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  // This will store a snapshot of the campaign data as it was on page load
  const [initialCampaign, setInitialCampaign] = useState<Campaign | null>(null);
  // Add this line with your other useState hooks
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(true);
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
      .then(data => {
        // Set both the editable state AND the pristine initial state
        setCampaign(data);
        setInitialCampaign(data);
      })
      .catch((err) => {
        console.error('Failed to fetch campaign:', err);
        setError('Could not load the campaign. It might have been deleted.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [campaignId]); // The hook re-runs if the campaignId in the URL changes

  // Function that updates our campaign state
  const handleAddNewEmail = () => {
    if (!campaign) return;

    // --- Enforce the maximum limit ---
    if (campaign.emails.length >= 8) {
        // You can replace this with a more user-friendly toast notification later
        alert("You have reached the maximum of 8 emails for this campaign.");
        return; // Stop the function from proceeding
      }

    const newEmail = {
      id: crypto.randomUUID(), // A temporary ID for the new step
      subject: 'New Email Subject',
      body: '<p>Start writing your email content here.</p>',
      delayInHours: 24, // A sensible default
    };

    setCampaign({
      ...campaign,
      emails: [...campaign.emails, newEmail],
    });
  };

  const handleDeleteEmail = (emailIdToDelete: string) => {
    if (!campaign) return;

    // We use window.confirm for now, as per our roadmap.
    if (!window.confirm("Are you sure you want to delete this email step?")) {
      return;
    }

    const updatedEmails = campaign.emails.filter(email => email.id !== emailIdToDelete);

    // If the email being deleted is the one currently selected, we need to deselect it.
    if (selectedEmailId === emailIdToDelete) {
      // A simple approach is to select the first email if one exists, otherwise null.
      setSelectedEmailId(updatedEmails.length > 0 ? updatedEmails[0].id : null);
    }

    setCampaign({
      ...campaign,
      emails: updatedEmails,
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedEmailId || !campaign) return;

    const { name, value } = e.target;
    
    const updatedEmails = campaign.emails.map(email => {
      if (email.id === selectedEmailId) {
        // For the delay field, ensure the value is a number
        const updatedValue = name === 'delayInHours' ? parseInt(value, 10) || 0 : value;
        return { ...email, [name]: updatedValue };
      }
      return email;
    });

    setCampaign({
      ...campaign,
      emails: updatedEmails,
    });
  };

  const handleSaveChanges = async () => {
    // Guard clauses: Do nothing if there's no campaign or no changes to save.
    if (!campaign || !hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);

    try {
      // Call our existing API function to send the entire updated campaign object
      const updatedCampaign = await updateCampaign(campaign.id, campaign);
      
      // On success, update the "initial" state to match the newly saved state.
      // This will make hasUnsavedChanges false again, disabling the save button.
      setInitialCampaign(updatedCampaign);
      // Also update the main campaign state, just in case the backend returned any transformations
      setCampaign(updatedCampaign);

      alert("Campaign saved successfully!");

    } catch (err) {
      console.error("Failed to save campaign:", err);
      alert("Error: Could not save campaign. Please try again.");
    } finally {
      // No matter what happens, always set isSaving back to false.
      setIsSaving(false);
    }
  };

  // Add this new function inside the CampaignEditorPage component

  const handleCampaignDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!campaign) return;

    const { name, value } = e.target;
    setCampaign({
      ...campaign,
      [name]: value,
    });
  };

  // Find the full email object that corresponds to the selectedEmailId
  const selectedEmail = campaign?.emails.find(e => e.id === selectedEmailId);
    // Compare the current campaign state with the initial state to detect changes
  const hasUnsavedChanges = JSON.stringify(campaign) !== JSON.stringify(initialCampaign);

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
    {/* --- HEADER --- */}
    <div className="flex justify-between items-center mb-6">
      <Link to="/campaigns" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center">
        <ArrowLeft size={16} className="mr-1" />
        Back to Campaigns
      </Link>
      <button
        onClick={handleSaveChanges}
        disabled={!hasUnsavedChanges || isSaving}
        className="px-5 py-2 text-center bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>

     {/* --- NEW: Main Two-Column Layout for the Entire Page Content --- */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">

{/* --- NEW: Left Column Wrapper --- */}
<div className="space-y-8 lg:col-span-1">
  
  {/* Collapsible Campaign Details Section (Now inside the left column) */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center">
      {/* This div now holds the conditional label and the title */}
      <div>
        {isDetailsCollapsed && (
          <label className="text-sm font-medium text-gray-500">Campaign Details</label>
        )}
      <h1 className="text-xl font-bold text-gray-800">
        {isDetailsCollapsed ? campaign.name : 'Editing Campaign Details'}
      </h1>
      </div>
      <button 
        onClick={() => setIsDetailsCollapsed(prev => !prev)}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        {isDetailsCollapsed ? 'Edit' : 'Collapse'}
      </button>
    </div>

    {isDetailsCollapsed ? (
      <p className="text-sm text-gray-500 mt-2 pt-4 border-t border-gray-200">
        From: {campaign.fromName} &lt;{campaign.fromEmail}&gt;
      </p>
    ) : (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input
              type="text" id="name" name="name" value={campaign.name}
              onChange={handleCampaignDetailsChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="fromName" className="block text-sm font-medium text-gray-700">"From" Name</label>
            <input
              type="text" id="fromName" name="fromName" value={campaign.fromName}
              onChange={handleCampaignDetailsChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">"From" Email</label>
            <input
              type="email" id="fromEmail" name="fromEmail" value={campaign.fromEmail}
              onChange={handleCampaignDetailsChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    )}
  </div>

  {/* EmailSequenceList component (Also inside the left column) */}
  <EmailSequenceList
    emails={campaign.emails}
    selectedEmailId={selectedEmailId}
    isSequenceCollapsed={isSequenceCollapsed}
    onAddNewEmail={handleAddNewEmail}
    onDeleteEmail={handleDeleteEmail}
    onSelectEmail={setSelectedEmailId}
    setIsSequenceCollapsed={setIsSequenceCollapsed}
  />
</div>

{/* Right Column for the Email Editor Form */}
<div className="lg:col-span-2">
  <EmailEditorForm
    selectedEmail={selectedEmail}
    onChange={handleEmailChange}
  />
</div>

</div>
</div>
  );
};