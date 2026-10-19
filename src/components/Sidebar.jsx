import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
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
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Expense Tracker', path: '/expenses', icon: FiCreditCard },
    { name: 'Budgets', path: '/budgets', icon: FiDollarSign },
    { name: 'Savings Goals', path: '/savings', icon: FiTarget },
    { name: 'AI Scam Detector', path: '/scam-detector', icon: FiShield },
    { name: 'Transaction Risk', path: '/risk-analyzer', icon: FiActivity },
    { name: 'OCR Receipt Scanner', path: '/receipt-scanner', icon: FiCamera },
    { name: 'AI Assistant', path: '/assistant', icon: FiMessageSquare },
    { name: 'Reports', path: '/reports', icon: FiPieChart },
    { name: 'Profile', path: '/profile', icon: FiUser },
  ];

  // Add Admin Panel item if user is admin
  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: FiSettings });
  }

  const activeStyle =
    'flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all font-medium';
  const inactiveStyle =
    'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-[73px] bottom-0 left-0 z-40 w-64 glass border-r border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer info in Sidebar */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 text-center">
          <p className="text-xs text-slate-500">FinGuard AI Platform</p>
          <p className="text-[10px] text-indigo-400/80 font-mono mt-1">v1.0.0 (Stable)</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
