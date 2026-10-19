import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBudget, setBudget, fetchBudgetStatus } from '../redux/budgetSlice';
import Loader from '../components/Loader';
import { FiTrendingUp, FiCheckCircle, FiAlertCircle, FiSettings, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const BudgetPage = () => {
  const dispatch = useDispatch();
  const { budget, status, loading } = useSelector((state) => state.budget);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [totalLimit, setTotalLimit] = useState(3500);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Form states for category allocations
  const categoriesList = ['Food', 'Transport', 'Shopping', 'Medical', 'Education', 'Entertainment', 'Bills', 'Travel', 'Other'];
  const [categoryLimits, setCategoryLimits] = useState({});

  useEffect(() => {
    dispatch(fetchBudget(month));
    dispatch(fetchBudgetStatus(month));
  }, [dispatch, month]);

  // Sync state values when budget payload loads
  useEffect(() => {
    if (budget) {
      setTotalLimit(budget.amount);
      const limits = {};
      budget.categoryBudgets.forEach((cb) => {
        limits[cb.category] = cb.amount;
      });
      setCategoryLimits(limits);
    }
  }, [budget]);

  const handleCategoryLimitChange = (cat, val) => {
    setCategoryLimits((prev) => ({
      ...prev,
      [cat]: val === '' ? '' : parseFloat(val) || 0,
    }));
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();

    const categoryBudgets = Object.keys(categoryLimits)
      .filter((cat) => categoryLimits[cat] > 0)
      .map((cat) => ({
        category: cat,
        amount: parseFloat(categoryLimits[cat]) || 0,
      }));

    dispatch(
      setBudget({
        month,
        amount: parseFloat(totalLimit) || 0,
        categoryBudgets,
      })
    )
      .unwrap()
      .then(() => {
        setIsConfigOpen(false);
        dispatch(fetchBudgetStatus(month));
      });
  };

  const budgetSpent = status?.totalSpent || 0;
  const budgetLimit = status?.totalBudget || 0;
  const percentUsed = status?.percentSpent || 0;
  const isExceeded = status?.isExceeded || false;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <FiTrendingUp className="text-indigo-400 shrink-0" />
            <span>Budget Planner</span>
          </h1>
          <p className="text-slate-400 mt-1">Configure monthly spending limits and category limits.</p>
        </div>

        {/* Month Selector & Trigger Config Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300">
            <FiCalendar className="text-slate-500 mr-2" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent outline-none border-none text-slate-200 cursor-pointer text-xs"
            />
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg active:scale-[0.98] w-full sm:w-auto justify-center"
          >
            <FiSettings />
            <span>Setup Budget</span>
          </button>
        </div>
      </div>

      {loading && !status ? (
        <Loader size="lg" message="Retrieving monthly allocations..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Budget Progress Card */}
          <div className="p-6 rounded-2xl glass border border-slate-800 bg-slate-950/20 space-y-6 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Overall Budget Status</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-slate-100">${budgetSpent.toFixed(2)}</span>
                <span className="text-xs text-slate-500">spent of ${budgetLimit.toFixed(2)} limit</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isExceeded
                      ? 'bg-red-500'
                      : percentUsed >= 80
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold pt-1">
                <span className={isExceeded ? 'text-red-400' : 'text-slate-400'}>{percentUsed}% Used</span>
                <span className="text-emerald-400">${Math.max(budgetLimit - budgetSpent, 0).toFixed(2)} remaining</span>
              </div>
            </div>

            {/* Alert Cards */}
            {isExceeded && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <FiAlertCircle className="shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-bold">Budget Threshold Crossed</h4>
                  <p className="mt-0.5 leading-relaxed text-red-400/80">
                    Your expenditures have exceeded your month's limit of ${budgetLimit}. Review categories below to cut unnecessary spending.
                  </p>
                </div>
              </div>
            )}
            {!isExceeded && percentUsed >= 80 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5">
                <FiInfo className="shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-bold">Approaching Limit</h4>
                  <p className="mt-0.5 leading-relaxed text-amber-400/80">
                    You have utilized {percentUsed}% of your budget limit. We recommend monitoring category logs carefully.
                  </p>
                </div>
              </div>
            )}
            {!isExceeded && percentUsed < 80 && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
                <FiCheckCircle className="shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-bold">Budget Status Healthy</h4>
                  <p className="mt-0.5 leading-relaxed text-emerald-400/80">
                    Your monthly expenses are in compliance with your configured limits.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category-Wise Progress Cards */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-slate-200">Category Budgets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {status?.categoryBudgets?.map((cat) => {
                const catPercent = Math.min(cat.percent, 100);
                return (
                  <div
                    key={cat.category}
                    className="p-5 rounded-xl glass border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-200">{cat.category}</span>
                      <span className={cat.isExceeded ? 'text-red-400 font-extrabold' : 'text-slate-400'}>
                        {cat.percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          cat.isExceeded ? 'bg-red-500' : cat.percent >= 80 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${catPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                      <span>${cat.spentAmount.toFixed(2)} spent</span>
                      <span>limit: ${cat.budgetLimit.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
              {(!status?.categoryBudgets || status.categoryBudgets.length === 0) && (
                <div className="col-span-2 p-6 rounded-2xl glass border border-slate-800 text-center text-slate-500 text-xs">
                  No category limits configured yet. Click 'Setup Budget' above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Setup Budget Modal Form */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl glass border border-slate-800 rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100 pb-3 border-b border-slate-800 mb-5">
              Setup Monthly Budget Limits
            </h3>

            <form onSubmit={handleSaveBudget} className="space-y-6">
              {/* Total Limit */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Monthly Budget Limit ($)
                </label>
                <input
                  type="number"
                  value={totalLimit}
                  onChange={(e) => setTotalLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 focus:border-indigo-500 focus:bg-slate-950 transition-all text-sm font-bold"
                  required
                />
              </div>

              {/* Category Limits */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Category Limits Allocation (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoriesList.map((cat) => (
                    <div key={cat} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-300 w-1/3 font-medium">{cat}</span>
                      <input
                        type="number"
                        placeholder="Limit ($)"
                        value={categoryLimits[cat] !== undefined ? categoryLimits[cat] : ''}
                        onChange={(e) => handleCategoryLimitChange(cat, e.target.value)}
                        className="w-2/3 px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800 outline-none text-slate-200 focus:border-indigo-500 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all text-sm"
                >
                  Save Limits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
