import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [demoResetUrl, setDemoResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setDemoResetUrl('');

    try {
      const res = await api.post('/auth/forgotpassword', { email });
      setSuccessMsg('Reset instruction token generated.');
      if (res.data.resetToken) {
        // Expose in demo to easily test without mail configuration!
        const localResetPath = `/reset-password/${res.data.resetToken}`;
        setDemoResetUrl(localResetPath);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error executing forgot password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass p-8 rounded-2xl relative border border-slate-800"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100">Forgot Password</h2>
          <p className="text-slate-400 mt-1 text-sm">Enter email to recover your FinGuard credentials</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
            <FiAlertCircle className="shrink-0 mt-0.5" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm space-y-2">
            <div className="flex items-start gap-2">
              <FiCheckCircle className="shrink-0 mt-0.5" size={16} />
              <span>{successMsg}</span>
            </div>
            {demoResetUrl && (
              <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-xs">
                <p className="text-slate-400 font-mono mb-1">Hackathon Helper Link:</p>
                <Link to={demoResetUrl} className="text-indigo-400 underline font-semibold break-all">
                  Click here to proceed directly to Reset Form
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 focus:border-indigo-500 focus:bg-slate-950/80 outline-none text-slate-200 text-sm transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 active:scale-[0.98] transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              'Send Request'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          Remember credentials?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
