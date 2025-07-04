// File: src/components/Sidebar.tsx
import {
  LayoutDashboard, Mail, Send, Users, Code2, BarChart2, Settings, X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

// We define the type for the props our component will receive
interface SidebarProps {
  showTenants: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Mail },
  { id: 'broadcasts', label: 'Broadcasts', icon: Send },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'forms', label: 'Forms', icon: Code2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  
];

export const Sidebar = ({ showTenants, isOpen, setIsOpen  }: SidebarProps) => {
  return (
    <>
       {/* --- NEW: Mobile Overlay --- */}
       <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <aside 
        className= {`w-64 flex-shrink-0 flex flex-col bg-gray-800 text-gray-300 fixed inset-y-0 left-0 z-40
          md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex-shrink-0 flex items-center justify-center px-4 relative">
          {/* Explicit close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute left-4 text-gray-400 hover:text-white md:hidden"
          >
            <X size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-wider">FunnelFlow.</h1>
        </div>

        
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={`/${item.id}`} // The URL this link points to
                  onClick={() => setIsOpen(false)} // Close menu on click
                  // NavLink passes an `isActive` boolean that we use to apply styles
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                      isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-6 w-6 mr-3" />
                  {item.label}
                </NavLink>
              );
            })}

            {/* We do the same for the conditional "Tenants" link */}
            {showTenants && (
              <NavLink
                to="/tenants"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-700 hover:text-white'
                  }`
                }
              >
                <Users className="h-6 w-6 mr-3" />
                Tenants
              </NavLink>
            )}
          </nav>

        <div className="px-2 py-4 flex-shrink-0">
          <NavLink
              to="/settings"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-700 hover:text-white'
                }`
              }
            >
              <Settings className="h-6 w-6 mr-3" />
              Settings
          </NavLink>
        </div>
      </aside>
    </>
  );
};