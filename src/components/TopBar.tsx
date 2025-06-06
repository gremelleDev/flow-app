// File: src/components/TopBar.tsx
import { ChevronDown } from 'lucide-react';

export const TopBar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <span className="text-gray-500 text-sm">Tenant:</span>
        <button className="ml-2 flex items-center text-gray-700 font-semibold">
          Client A (Cornerstone Digital)
          <ChevronDown className="h-5 w-5 ml-1 text-gray-500" />
        </button>
      </div>
      <div>
        <button className="h-10 w-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center">
          SA
        </button>
      </div>
    </header>
  );
};