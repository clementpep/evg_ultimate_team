import React from 'react';

export const Loader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="loading-spinner mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  );
};
