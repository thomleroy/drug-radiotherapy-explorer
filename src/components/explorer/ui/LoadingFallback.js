import React from 'react';

// Small spinner used as a placeholder while the explorer hydrates.
export const LoadingFallback = ({ message = 'Loading...' }) => (
  <div
    className="flex items-center justify-center p-8"
    role="status"
    aria-live="polite"
  >
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sfro-primary border-r-transparent mr-3"
      aria-hidden="true"
    ></div>
    <span className="text-gray-600">{message}</span>
  </div>
);

export default LoadingFallback;
