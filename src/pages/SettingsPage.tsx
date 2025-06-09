// File: src/pages/SettingsPage.tsx

import { useState, useEffect } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { fetchProviders, updateProviders } from '../utils/api';
import type { ProviderConfig } from '../utils/api'; // Use `type` for interface import

/**
 * Defines the shape of the form's local state.
 * This is flat to easily map to the form inputs.
 */
interface FormState {
  displayName: string;
  provider: 'resend' | 'brevo';
  apiKey: string;
}

const INITIAL_FORM_STATE: FormState = {
  displayName: '',
  provider: 'resend',
  apiKey: '',
};

/**
 * SettingsPage Component
 *
 * This component now loads the list of providers from the backend when
 * it mounts, and saves any changes back to the backend.
 */
export const SettingsPage = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProviders()
      .then(setProviders)
      .catch(err => {
        console.error('Could not load providers:', err);
        setMessage(`Error loading settings: ${err.message}`);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
    setEditingId(null);
  };
  
  const handleSaveProvider = async () => {
    if (!formState.displayName || !formState.apiKey) {
      setMessage('Error: Display Name and API Key are required.');
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    let updatedProviders: ProviderConfig[];

    // --- CORRECTED DATA STRUCTURE ---
    if (editingId !== null) {
      updatedProviders = providers.map(p =>
        p.id === editingId
          ? { ...p, 
              displayName: formState.displayName, 
              provider: formState.provider, 
              credentials: { apiKey: formState.apiKey } 
            }
          : p
      );
    } else {
      const newProvider: ProviderConfig = {
        id: Date.now(),
        displayName: formState.displayName,
        provider: formState.provider,
        credentials: { apiKey: formState.apiKey },
      };
      updatedProviders = [...providers, newProvider];
    }
    
    try {
      await updateProviders(updatedProviders);
      setProviders(updatedProviders);
      setMessage(editingId ? 'Provider updated successfully!' : 'Provider added successfully!');
      resetForm();
    } catch (err: any) {
      setMessage(`Error saving: ${err.message}`);
    }

    setTimeout(() => setMessage(null), 4000);
  };

  const handleEdit = (provider: ProviderConfig) => {
    // --- CORRECTED: Flatten the data for the form state ---
    setFormState({
      displayName: provider.displayName,
      provider: provider.provider,
      apiKey: provider.credentials.apiKey,
    });
    setEditingId(provider.id);
  };

  const handleDelete = async (id: number) => {
    const updatedProviders = providers.filter(p => p.id !== id);

    try {
      await updateProviders(updatedProviders);
      setProviders(updatedProviders);
      setMessage('Provider removed.');
      if (editingId === id) {
        resetForm();
      }
    } catch (err: any) {
      setMessage(`Error removing provider: ${err.message}`);
    }

    setTimeout(() => setMessage(null), 4000);
  };

  // -----------------------------------------------------------------------------
  // Render Logic
  // -----------------------------------------------------------------------------

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
      
      {/* Main two-column layout container */}
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Left Column: Form */}
        <div className="md:w-1/2">
          <div className="p-8 bg-white rounded-lg shadow-md space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Edit Provider' : 'Add New Provider'}
            </h2>
            
            {/* Display Name Input */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text" id="displayName" name="displayName"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formState.displayName}
                onChange={handleChange}
                placeholder="e.g. Primary Resend Account"
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
                <option value="brevo">Brevo</option>
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
                placeholder="Paste your provider API key"
              />
            </div>

            {/* Action Buttons and Message Area */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSaveProvider}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {editingId ? 'Update Provider' : 'Add Provider'}
              </button>
              {editingId && (
                <button onClick={resetForm} className="text-sm text-gray-600 hover:underline">
                  Cancel
                </button>
              )}
            </div>
             {/* Conditionally render the feedback message */}
             {message && (
                <div className="text-sm font-medium text-green-600 pt-2">
                  {message}
                </div>
              )}
          </div>
        </div>

        {/* Right Column: Provider Cards */}
        <div className="md:w-1/2 mt-8 md:mt-0">
          <div className="p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Providers</h2>
            {providers.length > 0 ? (
              <div className="space-y-4">
                {providers.map(p => (
                  <div key={p.id} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{p.displayName}</p>
                      <p className="text-sm text-gray-500 capitalize">{p.provider}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 text-gray-500 hover:text-indigo-600">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-500 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No providers have been added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};