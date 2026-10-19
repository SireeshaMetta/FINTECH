import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  FiUsers,
  FiActivity,
  FiAlertTriangle,
  FiTerminal,
  FiTrash2,
  FiCheckCircle,
  FiEye,
  FiSend,
  FiSliders,
  FiGrid,
  FiPieChart,
  FiDatabase,
  FiCpu,
  FiServer,
  FiShield,
  FiDollarSign,
  FiClock,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const AdminPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('users');

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users Tab States
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);

  // Expenses Tab States
  const [expenses, setExpenses] = useState([]);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');
  const [expensePage, setExpensePage] = useState(1);
  const [expenseTotalPages, setExpenseTotalPages] = useState(1);
  const [expensesLoading, setExpensesLoading] = useState(false);

  // Fraud Tab States
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [fraudLoading, setFraudLoading] = useState(false);

  // System Logs States
  const [diagnostics, setDiagnostics] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('ai_recommendation');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState(null);

  // Delete confirmations
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Fetch System Statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await api.get('/admin/users', {
        params: {
          search: userSearch,
          role: userRoleFilter,
          page: userPage,
          limit: 8,
        },
      });
      if (res.data && res.data.success) {
        setUsers(res.data.data);
        setUserTotalPages(res.data.pagination.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, userRoleFilter, userPage]);

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    try {
      setExpensesLoading(true);
      const res = await api.get('/admin/expenses', {
        params: {
          search: expenseSearch,
          category: expenseCategoryFilter,
          page: expensePage,
          limit: 8,
        },
      });
      if (res.data && res.data.success) {
        setExpenses(res.data.data);
        setExpenseTotalPages(res.data.pagination.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setExpensesLoading(false);
    }
  }, [expenseSearch, expenseCategoryFilter, expensePage]);

  // Fetch Fraud alerts
  const fetchFraudAlerts = useCallback(async () => {
    try {
      setFraudLoading(true);
      const res = await api.get('/admin/fraud');
      if (res.data && res.data.success) {
        setFraudAlerts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching fraud alerts:', err);
    } finally {
      setFraudLoading(false);
    }
  }, []);

  // Fetch System Logs
  const fetchLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/admin/logs');
      if (res.data && res.data.success) {
        setDiagnostics(res.data.data.system);
        setSystemLogs(res.data.data.logs);
      }
    } catch (err) {
      console.error('Error fetching system logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  // Update User Role
  const handleUpdateRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      if (res.data && res.data.success) {
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user role');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data && res.data.success) {
        setDeleteConfirmId(null);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  // Update Fraud status
  const handleUpdateFraudStatus = async (alertId, newStatus) => {
    try {
      const res = await api.put(`/api/fraud/alerts/${alertId}`, { status: newStatus });
      if (res.data && res.data.success) {
        fetchFraudAlerts();
        fetchStats();
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  // Submit Broadcast Notification
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      setBroadcastLoading(true);
      setBroadcastStatus(null);
      const res = await api.post('/admin/notifications/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
        type: broadcastType,
      });
      if (res.data && res.data.success) {
        setBroadcastStatus({ success: true, message: res.data.message });
        setBroadcastTitle('');
        setBroadcastMessage('');
      }
    } catch (err) {
      setBroadcastStatus({
        success: false,
        message: err.response?.data?.message || 'Failed to send broadcast.',
      });
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Trigger loads based on active tab
  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'expenses') fetchExpenses();
    if (activeTab === 'fraud') fetchFraudAlerts();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab, fetchStats, fetchUsers, fetchExpenses, fetchFraudAlerts, fetchLogs]);

  // Render Stats Grid
  const renderStats = () => {
    if (statsLoading || !stats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl glass border border-slate-800 animate-pulse bg-slate-800/10"></div>
          ))}
        </div>
      );
    }

    const cards = [
      {
        title: 'Platform Users',
        value: stats.users.total,
        sub: `${stats.users.admin} Admins / ${stats.users.user} Standard`,
        icon: FiUsers,
        color: 'text-indigo-400 border-indigo-500/10',
      },
      {
        title: 'Platform Expenses',
        value: `$${stats.expenses.totalAmount.toLocaleString()}`,
        sub: `${stats.expenses.totalCount} entries (Avg: $${stats.expenses.avgAmount})`,
        icon: FiDollarSign,
        color: 'text-emerald-400 border-emerald-500/10',
      },
      {
        title: 'Active Fraud Risks',
        value: stats.fraud.active,
        sub: `${stats.fraud.resolved} Resolved / ${stats.fraud.dismissed} Dismissed`,
        icon: FiAlertTriangle,
        color: 'text-rose-400 border-rose-500/10',
      },
      {
        title: 'Active Core Limits',
        value: stats.budgets.total,
        sub: 'Platform budgets active',
        icon: FiShield,
        color: 'text-purple-400 border-purple-500/10',
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`p-6 rounded-2xl glass border ${card.color} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">{card.title}</span>
                <Icon size={20} className={card.color.split(' ')[0]} />
              </div>
              <div className="text-3xl font-extrabold text-white">{card.value}</div>
              <div className="text-xs text-slate-500 font-medium">{card.sub}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#a855f7', '#06b6d4', '#eab308'];

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          Admin Control Center
        </h1>
        <p className="text-slate-400 mt-1">
          Perform administrative database tasks, audit logs, broadcast alerts, and monitor system metrics.
        </p>
      </div>

      {/* Overview Stats */}
      {renderStats()}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'users', label: 'Users Directory', icon: FiUsers },
          { id: 'expenses', label: 'Expenses Ledger', icon: FiDollarSign },
          { id: 'fraud', label: 'Fraud Logs', icon: FiAlertTriangle },
          { id: 'charts', label: 'Analytics Insights', icon: FiPieChart },
          { id: 'broadcast', label: 'Broadcast Message', icon: FiSend },
          { id: 'logs', label: 'Diagnostics & Logs', icon: FiTerminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        {/* USERS DIRECTORY TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="w-full sm:max-w-md px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition-all"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                className="w-full sm:w-48 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {usersLoading ? (
              <Loader message="Loading directory..." />
            ) : users.length === 0 ? (
              <EmptyState title="No Users Found" message="Try relaxing your search terms or filters." />
            ) : (
              <div className="overflow-x-auto rounded-2xl glass border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold bg-slate-950/20">
                      <th className="py-4 px-6">User Details</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Created On</th>
                      <th className="py-4 px-6 text-right">Database Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
                            {u.avatar ? (
                              <img src={u.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100">{u.name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                              u.role === 'admin'
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateRole(u._id, u.role)}
                              disabled={u._id === user?._id}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                u._id === user?._id
                                  ? 'border-transparent text-slate-600 cursor-not-allowed'
                                  : 'border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-400'
                              }`}
                            >
                              Toggle Role
                            </button>
                            {deleteConfirmId === u._id ? (
                              <div className="flex gap-2 items-center">
                                <span className="text-xs text-rose-400 font-semibold animate-pulse">Cascade?</span>
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-all"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1.5 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs text-slate-400 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(u._id)}
                                disabled={u._id === user?._id}
                                className={`p-2 rounded-lg border text-rose-500 transition-all ${
                                  u._id === user?._id
                                    ? 'border-transparent text-slate-700 cursor-not-allowed'
                                    : 'border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/10'
                                }`}
                              >
                                <FiTrash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {userTotalPages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t border-slate-800">
                    <button
                      onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                      disabled={userPage === 1}
                      className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 rounded disabled:opacity-40 transition-all"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      Page {userPage} of {userTotalPages}
                    </span>
                    <button
                      onClick={() => setUserPage((p) => Math.min(p + 1, userTotalPages))}
                      disabled={userPage === userTotalPages}
                      className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 rounded disabled:opacity-40 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* EXPENSES LEDGER TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <input
                type="text"
                placeholder="Search expenses by title..."
                value={expenseSearch}
                onChange={(e) => {
                  setExpenseSearch(e.target.value);
                  setExpensePage(1);
                }}
                className="w-full sm:max-w-md px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              <select
                value={expenseCategoryFilter}
                onChange={(e) => {
                  setExpenseCategoryFilter(e.target.value);
                  setExpensePage(1);
                }}
                className="w-full sm:w-48 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all"
              >
                <option value="">All Categories</option>
                {['Food', 'Transport', 'Shopping', 'Medical', 'Education', 'Entertainment', 'Bills', 'Travel', 'Other'].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>

            {expensesLoading ? (
              <Loader message="Loading ledger..." />
            ) : expenses.length === 0 ? (
              <EmptyState title="No Expenses Found" message="Platform has no registered expenses matching query." />
            ) : (
              <div className="overflow-x-auto rounded-2xl glass border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold bg-slate-950/20">
                      <th className="py-4 px-6">User Account</th>
                      <th className="py-4 px-6">Expense Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Method</th>
                      <th className="py-4 px-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                    {expenses.map((e) => (
                      <tr key={e._id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-200">{e.userId?.name || 'Deleted User'}</div>
                          <div className="text-xs text-slate-500">{e.userId?.email || 'N/A'}</div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-100">{e.title}</td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 text-xs rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">
                          {new Date(e.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">{e.paymentMethod}</td>
                        <td className="py-4 px-6 text-right font-bold text-slate-200">
                          ${e.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {expenseTotalPages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t border-slate-800">
                    <button
                      onClick={() => setExpensePage((p) => Math.max(p - 1, 1))}
                      disabled={expensePage === 1}
                      className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 rounded disabled:opacity-40 transition-all"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      Page {expensePage} of {expenseTotalPages}
                    </span>
                    <button
                      onClick={() => setExpensePage((p) => Math.min(p + 1, expenseTotalPages))}
                      disabled={expensePage === expenseTotalPages}
                      className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 rounded disabled:opacity-40 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FRAUD RISK LOGS TAB */}
        {activeTab === 'fraud' && (
          <div className="space-y-6">
            {fraudLoading ? (
              <Loader message="Loading fraud threats log..." />
            ) : fraudAlerts.length === 0 ? (
              <EmptyState title="No Fraud Risks Registered" message="Database reports zero flagged transactions." />
            ) : (
              <div className="overflow-x-auto rounded-2xl glass border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold bg-slate-950/20">
                      <th className="py-4 px-6">Target User</th>
                      <th className="py-4 px-6">Risk Signal Details</th>
                      <th className="py-4 px-6">Category & Value</th>
                      <th className="py-4 px-6">Score</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Resolve Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                    {fraudAlerts.map((f) => (
                      <tr key={f._id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-200">{f.userId?.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{f.userId?.email || 'N/A'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-100">{f.title}</div>
                          <div className="text-xs text-slate-400 italic max-w-sm mt-0.5">{f.description}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 text-xs rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                            {f.category}
                          </span>
                          <div className="text-xs text-slate-400 font-bold mt-1">${f.amount}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                              f.riskScore >= 75
                                ? 'bg-rose-600/20 text-rose-400 border border-rose-600/40'
                                : f.riskScore >= 50
                                ? 'bg-orange-600/20 text-orange-400 border border-orange-600/40'
                                : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40'
                            }`}
                          >
                            {f.riskScore}%
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border uppercase ${
                              f.status === 'active'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                : f.status === 'resolved'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {f.status === 'active' ? (
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleUpdateFraudStatus(f._id, 'resolved')}
                                className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all"
                                title="Mark Resolved"
                              >
                                <FiCheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleUpdateFraudStatus(f._id, 'dismissed')}
                                className="p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 transition-all"
                                title="Dismiss Threat"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Archived</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'charts' && (
          <div className="space-y-8">
            {statsLoading ? (
              <Loader message="Aggregating charts..." />
            ) : !stats ? (
              <EmptyState title="No Aggregated Stats" message="Stats calculations failed or returned empty." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fraud Breakdown Bar Chart */}
                <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <FiAlertTriangle className="text-rose-400" />
                    <span>Risk Alert Types Distribution</span>
                  </h3>
                  <div className="h-64">
                    {stats.fraud.breakdown.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-20">No fraud entries recorded yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.fraud.breakdown}>
                          <XAxis dataKey="_id" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                          />
                          <Bar dataKey="count" fill="#6366f1">
                            {stats.fraud.breakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Budget Category Targets */}
                <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <FiSliders className="text-indigo-400" />
                    <span>Platform Budget Allocations (Category Avg)</span>
                  </h3>
                  <div className="h-64">
                    {stats.budgets.categories.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-20">No budget caps configured yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.budgets.categories} layout="vertical">
                          <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis dataKey="_id" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                          />
                          <Bar dataKey="avgLimit" fill="#10b981">
                            {stats.budgets.categories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BROADCAST MESSAGE TAB */}
        {activeTab === 'broadcast' && (
          <div className="max-w-xl mx-auto p-8 rounded-2xl glass border border-slate-800 bg-slate-900/20 space-y-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <FiSend className="text-indigo-400" />
              <span>Broadcast Dashboard Alerts</span>
            </h3>

            {broadcastStatus && (
              <div
                className={`p-4 rounded-xl border text-sm flex items-start gap-2 ${
                  broadcastStatus.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                <FiCheckCircle className="shrink-0 mt-0.5" size={16} />
                <span>{broadcastStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Alert Header Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Platform Optimization Downtime"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Alert Details / message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe details regarding this broadcast notification..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Notification Type Category</label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ai_recommendation">AI recommendation advice</option>
                  <option value="report_ready">Financial Report Announcement</option>
                  <option value="budget_exceeded">Downtime Alert / Crisis warnings</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={broadcastLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-40 active:scale-[0.98] shadow-lg shadow-indigo-600/20"
              >
                {broadcastLoading ? 'Broadcasting now...' : 'Dispatch Broadcast Alert'}
              </button>
            </form>
          </div>
        )}

        {/* DIAGNOSTICS & LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {logsLoading || !diagnostics ? (
              <Loader message="Querying cluster specs..." />
            ) : (
              <div className="space-y-6">
                {/* Specs grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sys details */}
                  <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4 bg-slate-950/10">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <FiServer className="text-indigo-400" />
                      <span>Host Server Specs</span>
                    </h4>
                    <div className="space-y-2 text-xs font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Platform OS:</span>
                        <span className="text-indigo-400 font-bold">{diagnostics.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Node Version:</span>
                        <span className="text-indigo-400 font-bold">{diagnostics.nodeVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Server Uptime:</span>
                        <span className="text-indigo-400 font-bold">{diagnostics.uptime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Node Heap */}
                  <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4 bg-slate-950/10">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <FiCpu className="text-emerald-400" />
                      <span>Cluster RAM Load</span>
                    </h4>
                    <div className="space-y-2 text-xs font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Allocated RSS:</span>
                        <span className="text-emerald-400 font-bold">{diagnostics.memory.rss}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heap Total:</span>
                        <span className="text-emerald-400 font-bold">{diagnostics.memory.heapTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heap Used:</span>
                        <span className="text-emerald-400 font-bold">{diagnostics.memory.heapUsed}</span>
                      </div>
                    </div>
                  </div>

                  {/* MongoDB connectivity */}
                  <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4 bg-slate-950/10">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <FiDatabase className="text-purple-400" />
                      <span>Database State</span>
                    </h4>
                    <div className="space-y-2 text-xs font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Adapter Driver:</span>
                        <span className="text-slate-300 font-bold">Mongoose Client</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DB Socket Status:</span>
                        <span className="text-emerald-400 font-bold">{diagnostics.databaseStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Pool:</span>
                        <span className="text-purple-400 font-bold">Connected (MDBA)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit log events lists */}
                <div className="p-6 rounded-2xl glass border border-slate-800 bg-[#0f1422]/60 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <FiTerminal className="text-indigo-400" />
                      <span>Live Audit Transactions Stream</span>
                    </h3>
                    <button
                      onClick={fetchLogs}
                      className="px-2.5 py-1.5 border border-slate-800 rounded bg-slate-900 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
                    >
                      Refresh Logs
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs text-slate-300">
                    {systemLogs.map((log, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 py-1.5 border-b border-slate-900/40">
                        <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span
                          className={`font-bold uppercase tracking-wider shrink-0 ${
                            log.level === 'warn' ? 'text-yellow-500' : 'text-indigo-400'
                          }`}
                        >
                          [{log.level}]
                        </span>
                        <span className="text-emerald-400 shrink-0">{log.service}:</span>
                        <span className="text-slate-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
