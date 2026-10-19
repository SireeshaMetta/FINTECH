import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenseAnalytics, createExpense, fetchExpenses } from '../redux/expenseSlice';
import DashboardCard from '../components/DashboardCard';
import ExpenseForm from '../components/ExpenseForm';
import Loader from '../components/Loader';
import {
  MonthlyExpenseChart,
  CategoryPieChart,
  WeeklySpendingChart,
  BudgetProgressChart,
} from '../components/DashboardCharts';
import {
  FiTrendingDown,
  FiTrendingUp,
  FiShield,
  FiActivity,
  FiPlus,
  FiCalendar,
  FiClock,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { analytics, expenses, loading } = useSelector((state) => state.expenses);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenseAnalytics());
    dispatch(fetchExpenses({ limit: 4 }));
  }, [dispatch]);

  const handleCreateExpense = (expenseData) => {
    dispatch(createExpense(expenseData))
      .unwrap()
      .then(() => {
        setIsFormOpen(false);
        // Refresh analytics and recent items
        dispatch(fetchExpenseAnalytics());
        dispatch(fetchExpenses({ limit: 4 }));
      });
  };

  const totalSpent = analytics.summary?.totalAmount || 0;
  const transactionCount = analytics.summary?.count || 0;
  const budgetLimit = 3500; // static default budget, can be customized later
  const totalSavings = Math.max(budgetLimit - totalSpent, 0);

  // Cards setup
  const cards = [
    {
      title: 'Total Expenses',
      value: `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'accumulated total',
      icon: FiTrendingDown,
      color: 'from-rose-500/10 to-pink-500/10',
      borderColor: 'border-rose-500/20',
      trend: { value: '', isPositive: false },
    },
    {
      title: 'Monthly Budget',
      value: `$${budgetLimit.toLocaleString()}`,
      subtitle: 'monthly threshold limit',
      icon: FiTrendingUp,
      color: 'from-purple-500/10 to-indigo-500/10',
      borderColor: 'border-purple-500/20',
      trend: null,
    },
    {
      title: 'Calculated Savings',
      value: `$${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'remaining inside budget limit',
      icon: FiShield,
      color: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-500/20',
      trend: { value: '', isPositive: true },
    },
    {
      title: 'Total Transactions',
      value: String(transactionCount),
      subtitle: 'transactions logged',
      icon: FiActivity,
      color: 'from-cyan-500/10 to-blue-500/10',
      borderColor: 'border-cyan-500/20',
      trend: null,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            FinGuard Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-semibold">{user?.name}</span>. Secure, analyze, and manage expenses.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
        >
          <FiPlus />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      {/* Main Grid: Charts & Analytics details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Spending (Line Chart) */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-200">Weekly Spending Trend</h3>
          <WeeklySpendingChart data={analytics.weeklyData} />
        </div>

        {/* Budget Progress Indicator */}
        <div className="p-6 rounded-2xl glass border border-slate-800 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-200 mb-2">Monthly Budget Progress</h3>
          <BudgetProgressChart budget={budgetLimit} spent={totalSpent} />
        </div>

        {/* Monthly expenses Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-200">Monthly Expenses (Last 6 Months)</h3>
          <MonthlyExpenseChart data={analytics.monthlyData} />
        </div>

        {/* Category Breakdown (Pie Chart) */}
        <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-200">Expense Breakdown by Category</h3>
          <CategoryPieChart data={analytics.categoryData} />
        </div>
      </div>

      {/* Bottom Block: Recent Activity Transactions */}
      <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <FiClock className="text-indigo-400" />
            <span>Recent Expenses Activity</span>
          </h3>
          <Link to="/expenses" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
            View All Expenses
          </Link>
        </div>

        {loading && expenses.length === 0 ? (
          <Loader size="sm" />
        ) : expenses.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No recent expenses registered. Click 'Add Expense' above to start.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                {expenses.slice(0, 4).map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-200">{exp.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{exp.paymentMethod}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">
                      ${exp.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateExpense}
      />
    </div>
  );
};

export default Dashboard;
