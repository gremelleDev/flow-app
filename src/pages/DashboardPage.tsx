// File: src/pages/DashboardPage.tsx
export const DashboardPage = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
    <p className="text-gray-600">Welcome, Super Admin! Here's a placeholder for the main dashboard overview.</p>
  </div>
);

/*
  - Create `src/pages/CampaignsPage.tsx` and add this code:
*/

// File: src/pages/CampaignsPage.tsx
export const CampaignsPage = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-gray-800">Campaigns</h1>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors">
        + Create Campaign
      </button>
    </div>
    <p className="text-gray-600">This page will list all the email sequence campaigns for the selected tenant.</p>
  </div>
);