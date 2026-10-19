import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../redux/savingsSlice';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { FiPlus, FiCalendar, FiTarget, FiTrendingUp, FiTrash2, FiPlusCircle, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SavingsGoalsPage = () => {
  const dispatch = useDispatch();
  const { goals, loading } = useSelector((state) => state.savings);

  // Form modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!title || !targetAmount || !deadline) return;

    dispatch(
      createGoal({
        title,
        targetAmount: parseFloat(targetAmount),
        deadline,
        currentAmount: 0,
      })
    )
      .unwrap()
      .then(() => {
        setIsFormOpen(false);
        setTitle('');
        setTargetAmount('');
        setDeadline('');
      });
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!activeGoal || !depositAmount) return;

    const newAmount = activeGoal.currentAmount + parseFloat(depositAmount);
    dispatch(
      updateGoal({
        id: activeGoal._id,
        goalData: {
          currentAmount: newAmount,
        },
      })
    )
      .unwrap()
      .then(() => {
        setIsDepositOpen(false);
        setDepositAmount('');
        setActiveGoal(null);
        dispatch(fetchGoals());
      });
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm('Delete this savings goal forever?')) {
      dispatch(deleteGoal(id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <FiTarget className="text-indigo-400 shrink-0" />
            <span>Savings Goals</span>
          </h1>
          <p className="text-slate-400 mt-1">Track metrics, lock capital and monitor milestones.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg active:scale-[0.98]"
        >
          <FiPlus />
          <span>New Goal</span>
        </button>
      </div>

      {loading && goals.length === 0 ? (
        <Loader size="lg" message="Loading savings milestones..." />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No Goals Configured"
          message="Set a savings target, define a deadline, and fund milestones to keep your financial budget balanced."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const formattedDeadline = new Date(goal.deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border glass flex flex-col justify-between gap-5 relative overflow-hidden ${
                  goal.status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-800'
                }`}
              >
                <div className="absolute top-[-10%] right-[-10%] w-[100px] h-[100px] rounded-full bg-indigo-500/5 blur-[30px]"></div>

                {/* Top Section */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                      goal.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {goal.status}
                    </span>
                    <h4 className="text-base font-bold text-slate-100 pt-1">{goal.title}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/20 transition-all"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>

                {/* Numbers */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xl font-black text-slate-100">${goal.currentAmount.toFixed(2)}</span>
                    <span className="text-xs text-slate-500 font-semibold">of ${goal.targetAmount.toFixed(2)} target</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 pt-1.5 font-medium">
                    <span>{percent}% Saved</span>
                    <span>${remaining.toFixed(2)} left</span>
                  </div>
                </div>

                {/* Bottom Section details & actions */}
                <div className="flex justify-between items-center border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FiCalendar size={13} />
                    <span>by {formattedDeadline}</span>
                  </div>

                  {goal.status !== 'completed' && (
                    <button
                      onClick={() => {
                        setActiveGoal(goal);
                        setIsDepositOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer border border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/5 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <FiPlusCircle />
                      <span>Fund Goal</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Goal Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass border border-slate-800 rounded-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-200 pb-3 border-b border-slate-800 mb-4">
              Add New Savings Goal
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Goal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Reserve or Vacation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Date *</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all text-sm"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fund Goal Modal Form */}
      {isDepositOpen && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xs glass border border-slate-800 rounded-2xl p-6 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-200">Fund: "{activeGoal.title}"</h3>
              <button
                onClick={() => {
                  setIsDepositOpen(false);
                  setActiveGoal(null);
                }}
                className="p-1 rounded bg-slate-800 text-slate-400"
              >
                <FiX size={14} />
              </button>
            </div>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Contribution Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
              >
                Confirm Deposit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoalsPage;
