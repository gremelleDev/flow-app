// File: src/components/EmailEditorForm.tsx

import type { Campaign } from '../utils/api';

// This defines the shape of an individual email step within a campaign.
// We can extract this to a shared types file later if needed.
type EmailStep = Campaign['emails'][0];

// Define the props this component expects from its parent.
interface EmailEditorFormProps {
  selectedEmail: EmailStep | undefined; // The email object to edit, or undefined if none is selected
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const EmailEditorForm = ({ selectedEmail, onChange }: EmailEditorFormProps) => {
  // If no email is selected, we render a helpful placeholder message.
  if (!selectedEmail) {
    return (
      <div className="flex items-center justify-center h-full bg-white p-6 rounded-lg shadow-md text-center">
        <div>
          <p className="font-semibold text-gray-700">Select an email to edit</p>
          <p className="text-sm text-gray-500 mt-1">Or click "+ Add Email" to create a new one.</p>
        </div>
      </div>
    );
  }

  // If an email IS selected, we render the full editor form.
  return (
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
          />
        </div>
      </form>
    </div>
  );
};