import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFraudAlerts, scanFraud, resolveFraudAlert } from '../redux/fraudSlice';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiRefreshCw,
  FiTrendingUp,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const RiskAnalyzer = () => {
  const dispatch = useDispatch();
  const { alerts, riskScore, loading } = useSelector((state) => state.fraud);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    dispatch(fetchFraudAlerts());
  }, [dispatch]);

  const handleScan = () => {
    setScanning(true);
    dispatch(scanFraud())
      .unwrap()
      .then(() => {
        // Refresh alert logs
        dispatch(fetchFraudAlerts());
      })
      .finally(() => {
        setScanning(false);
      });
  };

  const handleUpdateStatus = (id, status) => {
    dispatch(resolveFraudAlert({ id, status }))
      .unwrap()
      .then(() => {
        dispatch(fetchFraudAlerts());
      });
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const resolvedAlerts = alerts.filter((a) => a.status !== 'active');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <FiShield className="text-indigo-400 shrink-0" />
            <span>Fraud Risk Analyzer</span>
          </h1>
          <p className="text-slate-400 mt-1">Audit expenses for duplicates, velocity thresholds, and outliers.</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <FiRefreshCw className={scanning ? 'animate-spin' : ''} />
          <span>{scanning ? 'Auditing Ledger...' : 'Scan Expenses'}</span>
        </button>
      </div>

      {loading && alerts.length === 0 ? (
        <Loader size="lg" message="Reading transaction records..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Risk Meter and Alert Summary */}
          <div className="space-y-6">
            {/* Risk Meter Card */}
            <div className="p-6 rounded-2xl glass border border-slate-800 bg-slate-950/20 text-center relative overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[150px] h-[150px] rounded-full bg-indigo-500/5 blur-[50px]"></div>
              <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Cumulative Portfolio Risk</h3>

              {/* Gauge Graphic */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center mb-4">
                {/* SVG Radial Gauge */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className="stroke-slate-900 fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className={`fill-none transition-all duration-1000 ${
                      riskScore >= 75
                        ? 'stroke-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : riskScore >= 45
                        ? 'stroke-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : 'stroke-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    }`}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - riskScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-100">{riskScore}%</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Rating</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 px-4 leading-relaxed font-medium">
                {riskScore >= 75
                  ? '⚠️ High alert level. Resolve duplicate warnings and transaction anomalies immediately.'
                  : riskScore >= 45
                  ? '⚡ Moderate alert level. Some unusual category spikes detected.'
                  : '✅ All checks passed. Ledger is in safe standing.'}
              </p>
            </div>

            {/* Quick Summary list of alerts count */}
            <div className="p-5 rounded-2xl glass border border-slate-800 text-xs text-slate-400 space-y-4">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider">Alert Audits Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Active Alerts Pending</span>
                  <span className="font-bold text-indigo-400">{activeAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved/Dismissed Alerts</span>
                  <span className="font-bold text-slate-300">{resolvedAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Scans Logged</span>
                  <span className="font-bold text-slate-300">{alerts.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Warnings List & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active alerts section */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <FiAlertTriangle className="text-amber-500" />
                <span>Active Threat Warnings ({activeAlerts.length})</span>
              </h3>

              {activeAlerts.length === 0 ? (
                <div className="p-6 rounded-2xl glass border border-emerald-500/10 bg-emerald-500/5 text-center text-slate-400 text-xs flex items-center justify-center gap-3">
                  <FiCheckCircle className="text-emerald-400" size={18} />
                  <span>No active warnings detected in ledger. Scan again to check for new entries.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <motion.div
                      key={alert._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-5 rounded-xl border glass flex flex-col justify-between gap-4 ${
                        alert.riskScore >= 75 ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            alert.riskScore >= 75 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {alert.type}
                          </span>
                          <h4 className="text-sm font-bold text-slate-200 pt-1">{alert.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed pt-1">{alert.description}</p>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(alert.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-3">
                        <button
                          onClick={() => handleUpdateStatus(alert._id, 'dismissed')}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all text-xs font-semibold"
                        >
                          Dismiss Alert
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(alert._id, 'resolved')}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold"
                        >
                          Resolve Alert
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolved History Logs */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400" />
                <span>Resolved Alerts Logs</span>
              </h3>

              {resolvedAlerts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No historical resolved logs present.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/10">
                  <table className="w-full text-left border-collapse text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {resolvedAlerts.map((alert) => (
                        <tr key={alert._id} className="hover:bg-slate-900/20">
                          <td className="py-3 px-4 font-medium text-slate-200">{alert.title}</td>
                          <td className="py-3 px-4 text-slate-400">{alert.type}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              alert.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {alert.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-200">
                            ${alert.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalyzer;
