// components/Tabs.tsx
import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  disabled?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, disabled = false }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
            `}
            aria-current={activeTab === tab ? 'page' : undefined}
            disabled={disabled}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
