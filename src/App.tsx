// File: src/App.tsx

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './utils/firebase';
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
import { LoginPage } from './pages/LoginPage';

// A mapping from page ID to the actual component
const pageComponents: { [key: string]: React.ComponentType } = {
  dashboard: DashboardPage,
  campaigns: CampaignsPage,
  broadcasts: BroadcastsPage,
  subscribers: SubscribersPage,
  forms: FormsPage,
  analytics: AnalyticsPage,
  tenants:   TenantsPage,      // ← Super Admin Only
  settings: SettingsPage,
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // <-- Now managed by state
  const [activePage, setActivePage] = useState('dashboard');
  const [tenantName, setTenantName] = useState(''); 
  const tenants = ['Client A', 'Client B'];   // ← replace with real data later

  // This useEffect hook runs once when the app loads
  useEffect(() => {
    // onAuthStateChanged returns an "unsubscribe" function
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is logged in, now check for admin claim
        setUser(currentUser);
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          // Check for the superAdmin custom claim and update our state
          setIsSuperAdmin(idTokenResult.claims.superAdmin === true);
        } catch (error) {
          console.error("Error fetching user claims:", error);
          setIsSuperAdmin(false);
        }
      } else {
        // User is logged out, reset user and admin status
        setUser(null);
        setIsSuperAdmin(false);
      }
      setLoading(false);      // We're done loading, so hide the loading indicator
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // <-- Empty dependency array means this runs only once

  // While we're checking the auth state, show a loading message
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If we're done loading and there's no user, show the login page
  if (!user) {
    return <LoginPage />;
  }

  // If we have a user, show the main dashboard
  const ActivePageComponent = pageComponents[activePage];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} showTenants={isSuperAdmin} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          user={user}
          isSuperAdmin={isSuperAdmin} 
          tenantName={tenantName}
          tenants={tenants}
          onTenantSelect={setTenantName}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {ActivePageComponent && <ActivePageComponent />}
        </main>
      </div>
    </div>
  );
}

export default App;