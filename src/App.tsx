// File: src/App.tsx

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './utils/firebase';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import all our page components
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignEditorPage } from './pages/CampaignEditorPage';
import { BroadcastsPage } from './pages/BroadcastsPage';
import { SubscribersPage } from './pages/SubscribersPage';
import { FormsPage } from './pages/FormsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TenantsPage } from './pages/TenantsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // <-- Now managed by state
  const [tenantName, setTenantName] = useState(''); 
  const tenants = ['Client A', 'Client B'];   // ← replace with real data later
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // <-- State for sidebar visibility

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

// ADD this new block of code in its place

  // The main return statement now uses the <Routes> component to define the app's structure.
  return (
    <Routes>
      {/* Route 1: The Login Page. 
        This is a public route that anyone can access.
        Uses a ternary operator to determine if the user is logged in
      */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      
      {/* Route 2: The Main Application Layout.
        This route handles all other paths (e.g., /dashboard, /subscribers).
        It's protected by a check: if there's no user, it redirects to /login.
      */}
      <Route
        path="/*" // The "/*" matches any path not already matched
        element={
          !user ? (
            // If there's no user, navigate to the login page
            <Navigate to="/login" replace />
          ) : (
            // If there IS a user, render the main application layout
            <div className="flex h-screen bg-gray-100 font-sans">
              <Sidebar
                // activePage and setActivePage are no longer needed
                showTenants={isSuperAdmin}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar
                  user={user}
                  isSuperAdmin={isSuperAdmin}
                  tenantName={tenantName}
                  tenants={tenants}
                  onTenantSelect={setTenantName}
                  onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main className="flex-1 p-6 overflow-y-auto">
                  {/* This is where our pages will be rendered based on the URL.
                    This nested <Routes> block handles which component appears in the main content area.
                  */}
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/campaigns" element={<CampaignsPage />} />
                    <Route path="/campaigns/:campaignId/edit" element={<CampaignEditorPage />} />
                    <Route path="/broadcasts" element={<BroadcastsPage />} />
                    <Route path="/subscribers" element={<SubscribersPage />} />
                    <Route path="/forms" element={<FormsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/tenants" element={<TenantsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* A fallback route that redirects any unknown path inside the app to the dashboard. */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          )
        }
      />
    </Routes>
  );
}

export default App;  