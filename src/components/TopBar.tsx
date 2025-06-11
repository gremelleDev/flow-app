// File: src/components/TopBar.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';  // <-- NEW: Import LogOut icon
import { signOut, type User } from 'firebase/auth'; // <-- NEW: Import the signOut function
import { auth } from '../utils/firebase';   // <-- NEW: Import our auth instance

// Define the props for this component
interface TopBarProps {
  user: User | null;
  isSuperAdmin: boolean;
  tenantName: string;
  tenants: string[]; 
  onTenantSelect: (tenant: string) => void; 
}

// Helper function to generate initials from an email
const getInitials = (email: string | null | undefined): string => {
  if (!email) return '';
  // Splits 'jane.doe@example.com' into ['jane', 'doe'] before the @
  const nameParts = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').split(' ');
  const firstInitial = nameParts[0]?.[0] || '';
  // Takes the last part for the second initial, handles single-part names gracefully
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// CORRECTED: The component now accepts the props object.
export const TopBar = ({ 
    user, // <-- Destructure the new user prop
    isSuperAdmin, 
    tenantName,
    tenants,
    onTenantSelect,
  }: TopBarProps) => {

  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false); // <-- NEW: State for user menu
  const tenantRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null); // <-- NEW: Ref for user menu

  // Close dropdowns if user clicks outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (tenantRef.current && !tenantRef.current.contains(e.target as Node)) {
        setTenantMenuOpen(false);
      }
      // NEW: Also close user menu on outside click
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // --- NEW: Logout Handler ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener in App.tsx will handle the redirect to the login page automatically.
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show an error message to the user
      alert("Failed to sign out. Please try again.");
    }
  };

  const label = tenantName || 'Select Tenant'; // placeholder if empty
  const userInitials = getInitials(user?.email); // Generate initials from the user object

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 relative z-20">
      {/* Tenant Switcher Dropdown */}
      {/* Conditionally render the entire Tenant Switcher block only for Super Admins */}
      <div ref={tenantRef} className="relative inline-block">
        {/* The container is always rendered to preserve space, but the content is conditional */}
        {isSuperAdmin && (
          <>
            <span className="text-gray-500 text-sm">Tenant:</span>
            <button
              onClick={() => setTenantMenuOpen(o => !o)}
              className="ml-2 flex items-center text-gray-700 font-semibold"
            >
              {label}
              <ChevronDown className="h-5 w-5 ml-1 text-gray-500" />
            </button>
          
            {tenantMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <ul>
                  {tenants.length > 0 ? (
                    tenants.map((t: string) => (
                      <li
                        key={t}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          onTenantSelect(t);
                          setTenantMenuOpen(false);
                        }}
                      >
                        {t}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500">No tenants</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* User Profile Dropdown with Logout and Dynamic Initials */}
      <div ref={userRef} className="relative">
        <button 
          onClick={() => setUserMenuOpen(o => !o)}
          className="h-10 w-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center"
        >
          {/* Conditionally render initials or a fallback icon */}
          {userInitials ? userInitials : <UserIcon size={20} />}
        </button>

        {userMenuOpen && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <ul>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};