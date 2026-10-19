import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchExpenseAnalytics,
} from '../redux/expenseSlice';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { FiSearch, FiFilter, FiPlus, FiCalendar, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ExpenseTracker = () => {
  const dispatch = useDispatch();
  const { expenses, pagination, loading } = useSelector((state) => state.expenses);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Modal control states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [detailExpense, setDetailExpense] = useState(null);

  const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Medical',
    'Education',
    'Entertainment',
    'Bills',
    'Travel',
    'Other',
  ];

  // Fetch expenses when dependencies change
  const loadFilteredExpenses = () => {
    const params = {
      page,
      limit: 8,
      search: search || undefined,
      category: category || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    dispatch(fetchExpenses(params));
  };

  useEffect(() => {
    loadFilteredExpenses();
  }, [dispatch, page, category, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadFilteredExpenses();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleCreateOrUpdate = (expenseData) => {
    if (selectedExpense) {
      dispatch(updateExpense({ id: selectedExpense._id, expenseData }))
        .unwrap()
        .then(() => {
          setIsFormOpen(false);
          setSelectedExpense(null);
          loadFilteredExpenses();
          dispatch(fetchExpenseAnalytics()); // Refresh dashboard aggregations
        });
    } else {
      dispatch(createExpense(expenseData))
        .unwrap()
        .then(() => {
          setIsFormOpen(false);
          loadFilteredExpenses();
          dispatch(fetchExpenseAnalytics());
        });
    }
  };

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      dispatch(deleteExpense(id))
        .unwrap()
        .then(() => {
          loadFilteredExpenses();
          dispatch(fetchExpenseAnalytics());
        });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Trigger Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            Expense Log Book
          </h1>
          <p className="text-slate-400 mt-1">Manage and audit your transaction expense records.</p>
        </div>
        <button
          onClick={() => {
            setSelectedExpense(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg active:scale-[0.98]"
        >
          <FiPlus />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-5 rounded-2xl glass border border-slate-800 bg-slate-950/20 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search expenses by title or memo details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950/80 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 outline-none text-slate-400 focus:text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950/80 transition-all appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <FiFilter size={14} />
            </div>
          </div>

          {/* Submit Search button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all"
          >
            Apply Search
          </button>
        </form>

        {/* Date Ranges and Reset Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
              <FiCalendar />
              <span>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent outline-none border-none text-slate-200 focus:text-indigo-400 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
              <FiCalendar />
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent outline-none border-none text-slate-200 focus:text-indigo-400 cursor-pointer"
              />
            </div>
          </div>

          {(search || category || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
            >
              <FiX size={14} />
              <span>Clear Filter Criteria</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Expenses Container */}
      {loading ? (
        <Loader size="lg" message="Reading transactions from ledger..." />
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No Expenses Logged"
          message="Adjust search keywords or click 'Add Expense' above to start tracking expenditures."
        />
      ) : (
        <div className="space-y-6">
          {/* Card Layout grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewDetails={setDetailExpense}
              />
            ))}
          </div>

          {/* Pagination Buttons */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-400 font-semibold">
                Page <span className="text-slate-200">{page}</span> of{' '}
                <span className="text-slate-200">{pagination.pages}</span>
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.pages}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expense Modal Form */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedExpense(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedExpense}
      />

      {/* Details Modal Overlay */}
      {detailExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-200">Expense Details</h3>
              <button
                onClick={() => setDetailExpense(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <span className="text-slate-500 text-xs uppercase block">Title</span>
                <span className="text-base font-bold text-slate-100">{detailExpense.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 text-xs uppercase block">Amount</span>
                  <span className="text-base font-bold text-emerald-400">
                    ${detailExpense.amount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs uppercase block">Category</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {detailExpense.category}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 text-xs uppercase block">Date</span>
                  <span>{new Date(detailExpense.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs uppercase block">Payment Method</span>
                  <span>{detailExpense.paymentMethod}</span>
                </div>
              </div>
              {detailExpense.description && (
                <div>
                  <span className="text-slate-500 text-xs uppercase block">Memo Notes</span>
                  <p className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-slate-400 text-xs mt-1 leading-relaxed">
                    {detailExpense.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-6">
              <button
                onClick={() => {
                  const toEdit = detailExpense;
                  setDetailExpense(null);
                  handleEditClick(toEdit);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => setDetailExpense(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
