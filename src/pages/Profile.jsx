import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, updateUserPassword, deleteUserAccount } from '../redux/authSlice';
import useTheme from '../hooks/useTheme';
import { FiUser, FiMail, FiLock, FiTrash2, FiBell, FiSun, FiMoon, FiShield } from 'react-icons/fi';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [theme, toggleTheme] = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Security toggles
  const [smsAlerts, setSmsAlerts] = useState(user?.securitySettings?.smsAlerts ?? true);
  const [emailAlerts, setEmailAlerts] = useState(user?.securitySettings?.emailAlerts ?? true);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');

    dispatch(
      updateUserProfile({
        name,
        email,
        securitySettings: {
          smsAlerts,
          emailAlerts,
        },
      })
    )
      .unwrap()
      .then(() => {
        setMsg('Profile details and alerts updated successfully!');
      })
      .catch((err) => {
        setErrorMsg(err);
      });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');

    if (!currentPassword || !newPassword) {
      setErrorMsg('Please fill current and new password fields');
      return;
    }
    dispatch(updateUserPassword({ currentPassword, newPassword }))
      .unwrap()
      .then(() => {
        setMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch((err) => {
        setErrorMsg(err);
      });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        'Are you absolutely sure you want to delete your FinGuard account? This action is permanent and all expense logs, risk alerts, and goals will be lost.'
      )
    ) {
      dispatch(deleteUserAccount());
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          User Settings
        </h1>
        <p className="text-slate-400 mt-1">Configure profile data, notification toggles, and safety benchmarks.</p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {msg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info Form */}
        <div className="p-6 rounded-2xl glass border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FiUser className="text-indigo-400" />
            <span>Account Details</span>
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 transition-all"
                required
              />
            </div>

            {/* Notification settings toggles */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiBell className="text-indigo-400" />
                <span>Alert Configurations</span>
              </h4>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Receive Instant SMS Fraud Alerts</span>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 accent-indigo-600 bg-slate-950/60"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Receive Monthly Summary Emails</span>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 accent-indigo-600 bg-slate-950/60"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-white font-medium text-sm shadow-md"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Change Password & Preferences */}
        <div className="space-y-8">
          {/* Change Password */}
          <div className="p-6 rounded-2xl glass border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FiLock className="text-indigo-400" />
              <span>Security Settings</span>
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-white font-medium text-sm shadow-md"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Theme Preference panel */}
          <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {theme === 'dark' ? <FiMoon className="text-indigo-400" /> : <FiSun className="text-amber-400" />}
                <span>Theme Preference</span>
              </h3>
              <p className="text-xs text-slate-400">Current Theme: {theme}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              Toggle Mode
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl glass border border-red-500/20 bg-red-500/5 space-y-4">
        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
          <FiTrash2 />
          <span>Danger Zone</span>
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Deleting your profile deletes all your records in the ledger and alerts logbooks. This action is irreversible.
        </p>
        <button
          onClick={handleDelete}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition-all text-white font-medium text-sm shadow-md"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
