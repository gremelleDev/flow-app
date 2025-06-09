// File: src/App.tsx
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';

// Import all our page components
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { BroadcastsPage } from './pages/BroadcastsPage';
import { SubscribersPage } from './pages/SubscribersPage';
import { FormsPage } from './pages/FormsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TenantsPage } from './pages/TenantsPage';
import { SettingsPage } from './pages/SettingsPage';

// A mapping from page ID to the actual component
const pageComponents: { [key: string]: React.ComponentType } = {
  dashboard: DashboardPage,
  campaigns: CampaignsPage,
  broadcasts: BroadcastsPage,
  subscribers: SubscribersPage,
  forms: FormsPage,
  analytics: AnalyticsPage,
  tenants:   TenantsPage,     // ← Super Admin Only
  settings: SettingsPage,
};

function App() {
  // useState hook to keep track of the currently active page
  const [activePage, setActivePage] = useState('dashboard');
  const [tenantName, setTenantName] = useState(''); 
  const isSuperAdmin = true; // ← hardcoded for MVP

  // Get the component to render based on the active page state
  const ActivePageComponent = pageComponents[activePage];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} showTenants={isSuperAdmin} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          isSuperAdmin={isSuperAdmin} 
          tenantName={tenantName}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {ActivePageComponent && <ActivePageComponent />}
        </main>
      </div>
    </div>
  );
}

export default App;