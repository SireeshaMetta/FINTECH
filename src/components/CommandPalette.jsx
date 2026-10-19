import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import useTheme from '../hooks/useTheme';
import {
  FiSearch,
  FiGrid,
  FiCreditCard,
  FiShield,
  FiActivity,
  FiCamera,
  FiMessageSquare,
  FiPieChart,
  FiUser,
  FiSettings,
  FiDollarSign,
  FiTarget,
  FiSun,
  FiMoon,
  FiLogOut,
} from 'react-icons/fi';

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [theme, toggleTheme] = useTheme();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const items = [
    { name: 'Dashboard Overview', shortcut: 'G D', action: () => navigate('/dashboard'), icon: FiGrid },
    { name: 'Expense Tracker Ledger', shortcut: 'G E', action: () => navigate('/expenses'), icon: FiCreditCard },
    { name: 'Monthly Budget Targets', shortcut: 'G B', action: () => navigate('/budgets'), icon: FiDollarSign },
    { name: 'Savings Goals Planner', shortcut: 'G S', action: () => navigate('/savings'), icon: FiTarget },
    { name: 'AI Scam Detector Scan', shortcut: 'G C', action: () => navigate('/scam-detector'), icon: FiShield },
    { name: 'Transaction Risk Profiler', shortcut: 'G R', action: () => navigate('/risk-analyzer'), icon: FiActivity },
    { name: 'OCR Invoice Receipt Scanner', shortcut: 'G O', action: () => navigate('/receipt-scanner'), icon: FiCamera },
    { name: 'AI Finance chatbot Assistant', shortcut: 'G A', action: () => navigate('/assistant'), icon: FiMessageSquare },
    { name: 'Reports & Aggregations Generator', shortcut: 'G R P', action: () => navigate('/reports'), icon: FiPieChart },
    { name: 'User Profile Portal Settings', shortcut: 'G P', action: () => navigate('/profile'), icon: FiUser },
    { name: 'Toggle Light / Dark Interface Theme', shortcut: 'T T', action: () => toggleTheme(), icon: theme === 'dark' ? FiSun : FiMoon },
    { name: 'Sign Out Account Session', shortcut: 'L O', action: () => { dispatch(logoutUser()); navigate('/login'); }, icon: FiLogOut },
  ];

  if (user?.role === 'admin') {
    items.unshift({
      name: 'System Admin Panel Controls',
      shortcut: 'G A P',
      action: () => navigate('/admin'),
      icon: FiSettings,
    });
  }

  // Filter items
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle select / execute
  const handleSelect = (index) => {
    const item = filtered[index];
    if (item) {
      item.action();
      onClose();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass animate-fade-in flex flex-col max-h-[450px]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <FiSearch className="text-slate-500" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a page name or action..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <span className="text-[10px] text-slate-600 bg-slate-800 border border-slate-700/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider shrink-0">
            Esc
          </span>
        </div>

        {/* Results list */}
        <div className="overflow-y-auto py-2 flex-1 divide-y divide-slate-800/20">
          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-xs text-slate-500">
              No matching pages or actions found.
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-200 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isSelected ? 'text-indigo-400' : 'text-slate-500'} />
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>
                  {item.shortcut && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-500 uppercase tracking-wide">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer help */}
        <div className="px-4 py-3 bg-slate-950/30 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
          <div className="flex gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>Command Palette</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
