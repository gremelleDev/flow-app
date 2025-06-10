// File: src/components/Sidebar.tsx
import {
  LayoutDashboard, Mail, Send, Users, Code2, BarChart2, Settings
} from 'lucide-react';

// We define the type for the props our component will receive
interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  showTenants: boolean;    // ← Super Admin Only
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Mail },
  { id: 'broadcasts', label: 'Broadcasts', icon: Send },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'forms', label: 'Forms', icon: Code2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  
];

export const Sidebar = ({ activePage, setActivePage, showTenants }: SidebarProps) => {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-gray-800 text-gray-300">
      <div className="h-16 flex-shrink-0 flex items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-white tracking-wider">FunnelFlow.</h1>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage(item.id);
              }}
              className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6 mr-3" />
              {item.label}
            </a>
          );
        })}

        {showTenants && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActivePage('tenants');
            }}
            className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
              activePage === 'tenants' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-700 hover:text-white'
            }`}
          >
            <Users className="h-6 w-6 mr-3" />
            Tenants
          </a>
        )}
      </nav>

      <div className="px-2 py-4 flex-shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActivePage('settings');
          }}
          className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
            activePage === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-700 hover:text-white'
          }`}
        >
          <Settings className="h-6 w-6 mr-3" />
          Settings
        </a>
      </div>
    </aside>
  );
};