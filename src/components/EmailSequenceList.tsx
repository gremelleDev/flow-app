// File: src/components/EmailSequenceList.tsx

import { Trash2 } from 'lucide-react';
import type { Campaign } from '../utils/api';

// Extract the type for a single email step from our Campaign interface
type CampaignEmail = Campaign['emails'][0];

// Define the props this component will accept
interface EmailSequenceListProps {
  emails: CampaignEmail[];
  selectedEmailId: string | null;
  isSequenceCollapsed: boolean;
  onAddNewEmail: () => void;
  onDeleteEmail: (emailId: string) => void;
  onSelectEmail: (emailId: string) => void;
  setIsSequenceCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export const EmailSequenceList = ({
  emails,
  selectedEmailId,
  isSequenceCollapsed,
  onAddNewEmail,
  onDeleteEmail,
  onSelectEmail,
  setIsSequenceCollapsed,
}: EmailSequenceListProps) => {

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  return (
    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sequence</h2>
        <button
          onClick={onAddNewEmail}
          disabled={emails.length >= 8}
          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          + Add Email
        </button>
      </div>

      {emails.length >= 8 && (
        <div className="p-2 text-sm text-center text-orange-800 bg-orange-50 rounded-md border border-orange-200">
          You've reached the 8 email limit for the current plan.
        </div>
      )}
      
      <div className="mb-4 text-right md:hidden">
        <button
          onClick={() => {
            if (!isSequenceCollapsed) {
              if (!selectedEmailId && emails.length > 0) {
                onSelectEmail(emails[0].id);
              }
            }
            setIsSequenceCollapsed(prev => !prev);
          }}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          {isSequenceCollapsed ? 'Show Full Sequence' : 'Collapse Sequence'}
        </button>
      </div>

      <div className={`space-y-3 ${isSequenceCollapsed ? 'hidden' : 'block'} md:block`}>
        {emails.length > 0 ? (
          emails.map((email, index) => (
            <div key={email.id} className="flex items-center gap-4">
              <div className="flex-shrink-0 h-6 w-6 bg-gray-200 text-gray-600 font-semibold text-sm rounded-full flex items-center justify-center">
                {index + 1}
              </div>
              <div
                onClick={() => {
                  onSelectEmail(email.id);
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
                    onDeleteEmail(email.id);
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
      
      {isSequenceCollapsed && selectedEmail && (
        <div className="mt-4 md:hidden">
          <p className="text-sm text-gray-500">Currently editing:</p>
          <div
            onClick={() => setIsSequenceCollapsed(false)}
            className="mt-1 p-3 rounded-md border-2 border-indigo-500 bg-indigo-50 cursor-pointer"
          >
            <p className="font-semibold text-gray-800 text-sm truncate">{selectedEmail.subject}</p>
            <p className="text-xs text-gray-500 mt-1">Wait {selectedEmail.delayInHours} hours</p>
          </div>
          {/* We will add up/down arrows later */}
        </div>
      )}
    </div>
  );
};