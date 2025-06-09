// File: src/components/TopBar.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// Define the props for this component
interface TopBarProps {
  isSuperAdmin: boolean;
  tenantName: string;
  tenants: string[]; 
  onTenantSelect: (tenant: string) => void; 
}

// CORRECTED: The component now accepts the props object.
export const TopBar = ({ 
    isSuperAdmin, 
    tenantName,
    tenants,
    onTenantSelect,
  }: TopBarProps) => {

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const label = tenantName || 'Select Tenant'; // placeholder if empty

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
       {/* make this container relative so the absolute menu is positioned to it */}
      <div className="relative inline-block">
        <span className="text-gray-500 text-sm">Tenant:</span>
        {/* Conditionally render the button OR plain text based on the prop */}
        {isSuperAdmin ? (
          <button
            onClick={() => setOpen(o => !o)}
            className="ml-2 flex items-center text-gray-700 font-semibold">
            {label}
            <ChevronDown className="h-5 w-5 ml-1 text-gray-500" />
          </button>
        ) : (
          <span className="ml-2 font-semibold text-gray-800">{label}</span>
        )}
      
      {isSuperAdmin && open && (
         <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
             <ul>
              {tenants.length > 0 ? (
                tenants.map((t: string) => (
                  <li
                    key={t}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      /* TODO: call a prop callback to change tenantName in App.tsx */
                      onTenantSelect(t);
                      setOpen(false);
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
      </div>
     

      <div>
        <button className="h-10 w-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center">
          SA
        </button>
      </div>
    </header>
  );
};