import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { FiLogOut, FiUser, FiBell, FiMenu, FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import NotificationsPopover from './NotificationsPopover';
import CommandPalette from './CommandPalette';

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [theme, toggleTheme] = useTheme();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Command Palette global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <>
      <nav className="glass-nav sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between text-slate-100 dark:text-slate-100 light:text-slate-800">
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              F
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-indigo-400 bg-clip-text text-transparent">
              FinGuard AI
            </span>
          </div>

          {/* Global Search trigger */}
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700 transition-all text-xs font-semibold"
          >
            <FiSearch size={14} className="text-slate-500" />
            <span>Search Command Palette...</span>
            <kbd className="text-[10px] font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-500 ml-4">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Theme Toggle Trigger */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-200 border border-slate-700 dark:border-slate-700 light:border-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-300 transition-all text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-indigo-400"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Notifications Dropdown */}
          <NotificationsPopover />

          {/* User Info & Actions */}
          <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-200">{user?.name}</span>
              <span className="text-xs text-indigo-400 uppercase font-semibold tracking-wider">
                {user?.role}
              </span>
            </div>

            <div
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white cursor-pointer ring-2 ring-indigo-500/30 hover:ring-indigo-500/60 transition-all font-semibold uppercase"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Render Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
};

export default Navbar;

