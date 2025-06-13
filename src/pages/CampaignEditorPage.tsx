// File: src/pages/CampaignEditorPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaign, type Campaign } from '../utils/api'; // We will need to create getCampaign soon
import { ArrowLeft, Trash2 } from 'lucide-react';

/**
 * CampaignEditorPage
 * A dedicated page for editing the details and email sequence of a single campaign.
 */
export const CampaignEditorPage = () => {
  // Get the campaignId from the URL, e.g., /campaigns/xyz-123/edit -> "xyz-123"
  const { campaignId } = useParams<{ campaignId: string }>();
  const [isSequenceCollapsed, setIsSequenceCollapsed] = useState(false);
  // State for the campaign data being edited
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  // This will hold the ID of the email currently being edited in the right-hand form
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
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


  // Find the full email object that corresponds to the selectedEmailId
  const selectedEmail = campaign?.emails.find(e => e.id === selectedEmailId);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
        
        {/* Left Column: Email Sequence List */}
        {/* Left Column: Email Sequence List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sequence</h2>
            <button
              onClick={handleAddNewEmail} // This button is now separate from the collapse logic
              // --- Add disabled attribute and styling ---
              disabled={campaign.emails.length >= 8}
              className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              + Add Email
            </button>
          </div>
          {/* --- Informational message when limit is reached --- */}
            {campaign.emails.length >= 8 && (
                <div className="p-2 text-sm text-center text-orange-800 bg-orange-50 rounded-md border border-orange-200">
                You've reached the 8 email limit for the current plan.
                </div>
            )}
                    
          {/* NEW: Mobile-only collapse/expand button */}
          <div className="mb-4 text-right md:hidden">
            <button
              onClick={() => {
                // --- THIS IS THE NEW LOGIC ---
                // If we are collapsing the list...
                if (!isSequenceCollapsed) {
                  // ...and no email is selected, but there are emails in the list...
                  if (!selectedEmailId && campaign.emails.length > 0) {
                    // ...then automatically select the very first one.
                    setSelectedEmailId(campaign.emails[0].id);
                  }
                }
                // Finally, toggle the collapsed state
                setIsSequenceCollapsed(prev => !prev);
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              {isSequenceCollapsed ? 'Show Full Sequence' : 'Collapse Sequence'}
            </button>
          </div>

          {/* This div now conditionally hides the full list on mobile */}
          <div className={`space-y-3 ${isSequenceCollapsed ? 'hidden' : 'block'} md:block`}>
            {campaign.emails.length > 0 ? (
              campaign.emails.map((email, index) => (
                // --- A parent flex container for the number and the card ---
                <div key={email.id} className="flex items-center gap-4">
                  
                  {/* The Numbered Circle */}
                  <div className="flex-shrink-0 h-6 w-6 bg-gray-200 text-gray-600 font-semibold text-sm rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>

                  {/* The Email Card (now takes up remaining space) */}
                  <div
                    onClick={() => {
                      setSelectedEmailId(email.id);
                      setIsSequenceCollapsed(true);
                    }}
                    className={`flex-grow p-3 rounded-md border cursor-pointer transition-colors relative group ${
                      selectedEmailId === email.id
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'bg-gray-50 border-gray-200 hover:border-indigo-400'
                    }`}
                  >
                    <p className="font-semibold text-gray-800 text-sm truncate">{email.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">Wait {email.delayInHours} hours</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEmail(email.id);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full text-gray-400 bg-gray-50 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity"
                      aria-label="Delete email step"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500">No emails in this sequence yet.</p>
                <p className="text-xs text-gray-400 mt-1">Click "+ Add Email" to get started.</p>
              </div>
            )}
          </div>
          
          {/* The "Compact View" that appears on mobile when collapsed */}
          {isSequenceCollapsed && selectedEmail && (
            <div className="mt-4 md:hidden">
              <p className="text-sm text-gray-500">Currently editing:</p>
              <div
                onClick={() => setIsSequenceCollapsed(false)} // Click to re-expand the list
                className="mt-1 p-3 rounded-md border-2 border-indigo-500 bg-indigo-50 cursor-pointer"
              >
                <p className="font-semibold text-gray-800 text-sm truncate">{selectedEmail.subject}</p>
                <p className="text-xs text-gray-500 mt-1">Wait {selectedEmail.delayInHours} hours</p>
              </div>
              {/* Placeholder for up/down arrows */}
              <p className="text-center text-xs text-gray-400 mt-2">Up/Down arrows will go here</p>
            </div>
          )}
        </div>

        {/* Right Column: Email Editor (Placeholder) */}
                {/* Right Column: Email Editor */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            // --- If an email IS selected, show the editor form ---
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Edit Email</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={selectedEmail.subject}
                    onChange={handleEmailChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="delayInHours" className="block text-sm font-medium text-gray-700">
                    Delay (in hours)
                  </label>
                  <input
                    type="number"
                    id="delayInHours"
                    name="delayInHours"
                    value={selectedEmail.delayInHours}
                    onChange={handleEmailChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                    Body
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    rows={10}
                    value={selectedEmail.body}
                    onChange={handleEmailChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  />
                </div>
              </form>
            </div>
          ) : (
            // --- If NO email is selected, show a helpful placeholder ---
            <div className="flex items-center justify-center h-full bg-white p-6 rounded-lg shadow-md text-center">
              <div>
                <p className="font-semibold text-gray-700">Select an email to edit</p>
                <p className="text-sm text-gray-500 mt-1">Or click "+ Add Email" to create a new one.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};