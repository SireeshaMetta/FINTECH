import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, subtitle, icon: Icon, color, borderColor, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-2xl glass border ${borderColor || 'border-slate-800'} bg-gradient-to-br ${color} flex flex-col justify-between`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-2">{value}</h3>
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-900/60 text-indigo-400 border border-slate-800">
            <Icon size={20} />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <p className="text-xs text-slate-400 mt-4 flex items-center gap-1 font-medium">
          {trend && <span className={trend.isPositive ? 'text-emerald-400' : 'text-red-400'}>{trend.value}</span>}
          <span>{subtitle}</span>
        </p>
      )}
    </motion.div>
  );
};

export default DashboardCard;
