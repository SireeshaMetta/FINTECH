import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#EF4444', // Red
];

// Custom Tooltip component for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
        <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-400">
          ${parseFloat(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export const MonthlyExpenseChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No monthly data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No category data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="h-full w-full md:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Spent']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#1E293B',
                borderRadius: '12px',
                color: '#E2E8F0',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-2">
        {data.map((entry, index) => (
          <div key={entry.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-slate-400 font-medium">{entry.category}</span>
            </div>
            <span className="text-slate-200 font-bold">${entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeeklySpendingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No weekly data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="day"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BudgetProgressChart = ({ budget = 3500, spent = 2450 }) => {
  const percent = Math.min(Math.round((spent / budget) * 100), 100);
  const remaining = Math.max(budget - spent, 0);

  return (
    <div className="flex flex-col justify-between h-full gap-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400">Budget Spent Progress</span>
        <span className={`font-bold ${percent >= 90 ? 'text-red-400' : 'text-indigo-400'}`}>
          {percent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
            percent >= 90
              ? 'from-red-500 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
              : percent >= 75
              ? 'from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t border-slate-800/80 pt-4">
        <div>
          <span className="text-slate-500 block">Spent Amount</span>
          <span className="text-slate-200 font-bold text-sm mt-0.5 block">
            ${spent.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block">Remaining Budget</span>
          <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
            ${remaining.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
