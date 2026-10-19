import React from 'react';

const Loader = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="relative">
        <div className={`rounded-full border-indigo-500/20 border-t-indigo-500 animate-spin ${currentSize}`}></div>
      </div>
      {message && <p className="text-sm text-slate-400 font-medium">{message}</p>}
    </div>
  );
};

export default Loader;
