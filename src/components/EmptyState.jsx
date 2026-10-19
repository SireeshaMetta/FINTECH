import React from 'react';
import { FiFolder } from 'react-icons/fi';

const EmptyState = ({
  title = 'No data found',
  message = 'There are no items to display in this list.',
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl glass border border-slate-800 bg-slate-950/10 text-center max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mb-4">
        <FiFolder size={20} />
      </div>

      <h4 className="text-base font-bold text-slate-200">{title}</h4>

      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
        {message}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;