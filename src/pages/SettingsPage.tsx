// File: src/pages/SettingsPage.tsx

import { useState } from 'react';
import { updateTenantSettings } from '../utils/api';
import { type TenantSettings } from '../utils/api'; // Use inline `type`

/**
 * Defines the shape of the form's local state.
 * This is used to manage the values of the input fields within this component.
 */
interface FormState {
  name: string;
  provider: 'resend' | 'brevo';
  apiKey: string;
  sendingDomain: string;
  corsDomains: string;
}

/**
 * SettingsPage Component
 * * This component renders a form that allows the Super Admin to configure
 * the settings for a specific tenant. It manages its own state for the
 * form fields and calls the backend API upon saving.
 */
export const SettingsPage = () => {
  // -----------------------------------------------------------------------------
  // State Management
  // -----------------------------------------------------------------------------

  // `useState` hook to manage the entire form's data as a single object.
  // This makes it easy to handle multiple input fields.
  const [formState, setFormState] = useState<FormState>({
    name: '',
    provider: 'resend',
    apiKey: '',
    sendingDomain: '',
    corsDomains: '',
  });

  // `useState` hook to manage the feedback message shown to the user after saving.
  // It can be a success message or an error message. It's null by default.
  const [message, setMessage] = useState<string | null>(null);

  // -----------------------------------------------------------------------------
  // Event Handlers
  // -----------------------------------------------------------------------------

  /**
   * A generic change handler for all form inputs.
   * It uses the input's `name` attribute to dynamically update the
   * corresponding key in the `formState` object.
   * @param e - The React change event from an input, textarea, or select element.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  /**
   * An async function that triggers when the "Save Settings" button is clicked.
   * It constructs the payload, calls the backend API, and handles the response.
   */
  const handleSave = async () => {
    // 1. Construct the payload that matches the `TenantSettings` interface required by our API.
    const settingsPayload: TenantSettings = {
      name: formState.name,
      sendingDomain: formState.sendingDomain,
      provider: formState.provider,
      credentials: {
        apiKey: formState.apiKey,
      },
      // Convert the comma-separated string of domains into an array of strings.
      corsDomains: formState.corsDomains.split(',').map(d => d.trim()).filter(d => d),
    };

    // 2. Use a try...catch block for robust error handling during the API call.
    try {
      // Call the API function from `utils/api.ts`.
      await updateTenantSettings(settingsPayload);
      // If the call succeeds, set a success message.
      setMessage('Settings saved successfully!');
    } catch (err: any) {
      // If the API call fails, set an error message from the caught error.
      setMessage(`Error: ${err.message}`);
    }

    // 3. Clear the feedback message after 4 seconds for a clean user experience.
    setTimeout(() => setMessage(null), 4000);
  };

  // -----------------------------------------------------------------------------
  // Render Logic
  // -----------------------------------------------------------------------------

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
      
      {/* Form container with nice styling */}
      <div className="max-w-xl p-8 bg-white rounded-lg shadow-md space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Tenant Configuration</h2>
        
        {/* Tenant Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tenant Name</label>
          <input
            type="text" id="name" name="name"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={formState.name}
            onChange={handleChange}
            placeholder="e.g. Client A"
          />
        </div>
        
        {/* Email Provider Dropdown */}
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Email Provider</label>
          <select
            id="provider" name="provider"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={formState.provider}
            onChange={handleChange}
          >
            <option value="resend">Resend</option>
            {/* We can add other providers here in the future */}
          </select>
        </div>

        {/* API Key Input */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">API Key</label>
          <input
            type="password" id="apiKey" name="apiKey"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={formState.apiKey}
            onChange={handleChange}
            placeholder="Paste your Resend API key"
          />
        </div>

        {/* Sending Domain Input */}
        <div>
          <label htmlFor="sendingDomain" className="block text-sm font-medium text-gray-700">Sending Domain</label>
          <input
            type="text" id="sendingDomain" name="sendingDomain"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={formState.sendingDomain}
            onChange={handleChange}
            placeholder="e.g. news.client-a.com"
          />
        </div>

        {/* Allowed CORS Domains Textarea */}
        <div>
          <label htmlFor="corsDomains" className="block text-sm font-medium text-gray-700">Allowed Website Domains</label>
          <textarea
            id="corsDomains" name="corsDomains"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 h-24 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={formState.corsDomains}
            onChange={handleChange}
            placeholder="e.g. www.client-a.com, client-a.com"
          />
           <p className="mt-2 text-xs text-gray-500">Comma-separated list of domains where your sign-up form will be hosted.</p>
        </div>

        {/* Action Buttons and Message Area */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Save Settings
          </button>
          
          {/* Conditionally render the feedback message */}
          {message && (
            <div className="text-sm font-medium text-green-600">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};