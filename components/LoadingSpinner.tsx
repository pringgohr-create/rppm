// components/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div
        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      <p className="ml-3 text-lg text-subtle">Generating content, please wait...</p>
    </div>
  );
};

export default LoadingSpinner;
