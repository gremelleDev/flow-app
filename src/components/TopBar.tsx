// File: src/components/TopBar.tsx
import { ChevronDown } from 'lucide-react';

// Define the props for this component
interface TopBarProps {
  isSuperAdmin: boolean;
  tenantName: string;      // ← new prop
}

// CORRECTED: The component now accepts the props object.
export const TopBar = ({ isSuperAdmin, tenantName }: TopBarProps) => {
  const label = tenantName || 'Select Tenant'; // placeholder if empty

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
       <div>
        <span className="text-gray-500 text-sm">Tenant:</span>
        {/* Conditionally render the button OR plain text based on the prop */}
        {isSuperAdmin ? (
          <button className="ml-2 flex items-center text-gray-700 font-semibold">
            {label}
            <ChevronDown className="h-5 w-5 ml-1 text-gray-500" />
          </button>
        ) : (
          <span className="ml-2 font-semibold text-gray-800">{label}</span>
        )}
      </div>
      <div>
        <button className="h-10 w-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center">
          SA
        </button>
      </div>
    </header>
  );
};