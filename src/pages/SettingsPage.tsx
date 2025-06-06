// File: src/pages/SettingsPage.tsx

import { useState } from 'react';
import { updateTenantSettings, TenantSettings } from '../utils/api';

export const SettingsPage = () => {
  // Local state for each field
  const [name, setName] = useState('');
  const [sendingDomain, setSendingDomain] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [corsDomains, setCorsDomains] = useState(''); // comma-separated
  const [message, setMessage] = useState<string | null>(null);

  // Handle Save button click
  const handleSave = async () => {
    const settings: TenantSettings = {
      name,
      sendingDomain,
      encryptedResendApiKey: resendApiKey, // stub: we’ll encrypt later
      corsDomains: corsDomains.split(',').map(d => d.trim()).filter(d => d),
    };

    try {
      const result = await updateTenantSettings(settings);
      if (result.success) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (err) {
      setMessage('Error saving settings.');
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="max-w-lg space-y-6">
        {/* Tenant Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Tenant Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Client A"
          />
        </div>

        {/* Sending Domain */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Sending Domain</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            value={sendingDomain}
            onChange={e => setSendingDomain(e.target.value)}
            placeholder="e.g. news.client-a.com"
          />
        </div>

        {/* Resend API Key */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Resend API Key</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-md p-2"
            value={resendApiKey}
            onChange={e => setResendApiKey(e.target.value)}
            placeholder="Paste your Resend API key"
          />
        </div>

        {/* Allowed CORS Domains */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Allowed CORS Domains</label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 h-24"
            value={corsDomains}
            onChange={e => setCorsDomains(e.target.value)}
            placeholder="e.g. www.client-a.com, client-a.com"
          />
        </div>

        {/* Save Button */}
        <div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors"
          >
            Save Settings
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className="text-green-600 font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
