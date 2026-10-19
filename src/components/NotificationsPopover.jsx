import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationsRead, deleteNotification } from '../redux/notificationSlice';
import { FiBell, FiCheck, FiTrash2, FiAlertCircle, FiShield, FiTarget, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationsPopover = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markNotificationsRead());
  };

  const handleMarkRead = (id) => {
    dispatch(markNotificationsRead(id));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'budget_exceeded':
        return <FiAlertCircle className="text-red-400 mt-0.5" size={16} />;
      case 'fraud_alert':
        return <FiShield className="text-amber-400 mt-0.5" size={16} />;
      case 'goal_completed':
        return <FiTarget className="text-emerald-400 mt-0.5" size={16} />;
      default:
        return <FiInfo className="text-indigo-400 mt-0.5" size={16} />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-200 border border-slate-700 dark:border-slate-700 light:border-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-300 transition-all text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-indigo-400"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-background-dark animate-pulse"></span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-away overlay */}
            <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-40" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-3 w-80 glass border border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden bg-slate-950"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                <span className="text-sm font-bold text-slate-200">Alert Center ({unreadCount} new)</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 uppercase tracking-wider"
                  >
                    <FiCheck />
                    <span>Read All</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/65 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active notifications log.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && handleMarkRead(n._id)}
                      className={`p-4 flex gap-3 text-xs leading-relaxed transition-all cursor-pointer ${
                        n.read ? 'opacity-50 hover:opacity-80' : 'bg-indigo-500/[0.02] hover:bg-indigo-500/[0.04]'
                      }`}
                    >
                      <div className="shrink-0">{getIcon(n.type)}</div>
                      <div className="space-y-0.5 flex-1 pr-2">
                        <h4 className="font-bold text-slate-300">{n.title}</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 self-center"
                        title="Remove Alert"
                      >
                        <FiTrash2 size={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPopover;
