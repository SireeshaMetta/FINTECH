import React, { useState, useEffect } from 'react';
import { FiX, FiInfo } from 'react-icons/fi';

const ExpenseForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [errorMsg, setErrorMsg] = useState('');

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

  const paymentMethods = ['Cash', 'Card', 'UPI', 'Net Banking', 'Other'];

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(initialData.amount || '');
      setCategory(initialData.category || 'Food');
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDescription(initialData.description || '');
      setPaymentMethod(initialData.paymentMethod || 'Cash');
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('Cash');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Title is required');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Amount must be a positive number');
      return;
    }
    if (!category) {
      setErrorMsg('Category is required');
      return;
    }
    if (!date) {
      setErrorMsg('Date is required');
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      description: description.trim(),
      paymentMethod,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-4">
          <h3 className="text-lg font-bold text-slate-100">
            {initialData ? 'Edit Expense Record' : 'Add New Expense'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all"
          >
            <FiX size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <FiInfo className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Expense Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Groceries or Taxi Ride"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method} className="bg-slate-900 text-slate-200">
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Description / Notes
            </label>
            <textarea
              placeholder="Provide a small notes details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-sm font-medium shadow-lg shadow-indigo-600/20"
            >
              {initialData ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
