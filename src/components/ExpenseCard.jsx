import React from 'react';
import { FiEdit2, FiTrash2, FiCalendar, FiDollarSign } from 'react-icons/fi';
import CategoryBadge from './CategoryBadge';

const ExpenseCard = ({ expense, onEdit, onDelete, onViewDetails }) => {
  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-5 rounded-2xl glass border border-slate-800 bg-slate-900/10 hover:border-indigo-500/30 hover:bg-slate-950/20 transition-all flex flex-col justify-between gap-4 group">
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CategoryBadge category={expense.category} />
            <span className="text-[10px] text-slate-500 font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {expense.paymentMethod}
            </span>
          </div>
          <h4
            onClick={() => onViewDetails(expense)}
            className="text-base font-semibold text-slate-100 group-hover:text-indigo-400 cursor-pointer transition-colors pt-1"
          >
            {expense.title}
          </h4>
          {expense.description && (
            <p className="text-xs text-slate-400 line-clamp-1">{expense.description}</p>
          )}
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-slate-100 flex items-center justify-end">
            <FiDollarSign className="text-slate-500 shrink-0 text-sm" />
            {expense.amount.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-1 font-medium">
            <FiCalendar size={10} />
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3 mt-1">
        <button
          onClick={() => onViewDetails(expense)}
          className="text-xs text-slate-400 hover:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-500/5 transition-all mr-auto"
        >
          View Details
        </button>
        <button
          onClick={() => onEdit(expense)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/30 transition-all"
          title="Edit Expense"
        >
          <FiEdit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(expense._id)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all"
          title="Delete Expense"
        >
          <FiTrash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default ExpenseCard;
