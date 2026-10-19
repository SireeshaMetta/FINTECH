import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import {
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import { FaBrain, FaLightbulb } from 'react-icons/fa';
import { motion } from 'framer-motion';
const ScamDetector = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ai/insights');
      setInsights(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch AI spend insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
       <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
  <FaBrain className="text-indigo-400 shrink-0" />
  <span>AI Financial Insights & Risk Assessment</span>
</h1>
        <p className="text-slate-400 mt-1">
          Machine Learning spends analysis and threat vector modeling.
        </p>
      </div>

      {loading ? (
        <Loader size="lg" message="Synthesizing financial reports via Gemini..." />
      ) : error ? (
        <div className="p-6 rounded-2xl glass border border-red-500/20 bg-red-500/5 text-center space-y-4">
          <FiAlertTriangle className="text-red-400 mx-auto" size={32} />
          <h4 className="text-slate-200 font-bold">Failed to load AI Insights</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchInsights}
            className="px-5 py-2.5 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-all"
          >
            Retry Call
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Spending Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 p-6 rounded-2xl glass border border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] rounded-full bg-indigo-500/5 blur-[50px]"></div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <FiShield className="text-indigo-400" />
              <span>AI Spending Summary</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {insights?.summary}
            </p>
          </motion.div>

          {/* Risk Level Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl glass border flex flex-col justify-between ${
              insights?.riskLevel === 'High'
                ? 'border-red-500/20 bg-red-500/5'
                : insights?.riskLevel === 'Moderate'
                ? 'border-amber-500/20 bg-amber-500/5'
                : 'border-emerald-500/20 bg-emerald-500/5'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Portfolio Risk Grade</p>
              <h3 className={`text-3xl font-extrabold mt-3 ${
                insights?.riskLevel === 'High'
                  ? 'text-red-400'
                  : insights?.riskLevel === 'Moderate'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {insights?.riskLevel || 'Low'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-6 leading-relaxed">
              Calculated using month-to-date category velocity thresholds and spending values.
            </p>
          </motion.div>

          {/* Savings suggestions Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl glass border border-slate-800 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
             <FaLightbulb className="text-amber-400" />
              <span>Personalized Saving Recommendations</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights?.suggestions?.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed hover:border-indigo-500/25 transition-all"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center mb-3">
                    {index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Predictions Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl glass border border-slate-800 space-y-3"
          >
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <FiTrendingUp className="text-indigo-400" />
              <span>Spending Predictions</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              {insights?.predictions}
            </p>
          </motion.div>

          {/* Scam advice warning details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 p-6 rounded-2xl glass border border-emerald-500/10 bg-emerald-500/5 space-y-3 flex items-start gap-4"
          >
            <FiCheckCircle className="text-emerald-400 mt-1 shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-slate-200">FinGuard Threat Assessment Advice</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {insights?.scamAdvice || 'Double check any payment confirmation or billing requests matching unfamiliar URLs. Enable SMS alert triggers on critical accounts.'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ScamDetector;
