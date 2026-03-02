import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { formatPrice } from '../utils/currency';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name?.toLowerCase().includes('sales') || entry.name?.toLowerCase().includes('revenue') || entry.name?.toLowerCase().includes('total')
              ? formatPrice(entry.value)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SalesChart = ({ data, type = 'bar' }) => {
  const [chartType, setChartType] = useState(type);

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setChartType('bar')}
          className={`px-3 py-1 rounded-lg text-sm ${chartType === 'bar' ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
        >
          Bar
        </button>
        <button
          onClick={() => setChartType('line')}
          className={`px-3 py-1 rounded-lg text-sm ${chartType === 'line' ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
        >
          Line
        </button>
        <button
          onClick={() => setChartType('area')}
          className={`px-3 py-1 rounded-lg text-sm ${chartType === 'area' ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
        >
          Area
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="_id" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="total" name="Sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : chartType === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="_id" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="total" name="Sales" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
          </LineChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="_id" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="total" name="Sales" stroke="#22c55e" fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="totalSales"
          nameKey="_id"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ForecastChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" stroke="#64748b" />
        <YAxis stroke="#64748b" tickFormatter={(value) => `₹${value/1000}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="predicted_sales" 
          name="Predicted Sales" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#8b5cf6' }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default { SalesChart, CategoryPieChart, ForecastChart };
