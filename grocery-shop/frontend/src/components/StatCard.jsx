import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, formatNumber } from '../utils/currency';

const StatCard = ({ 
  title, 
  value, 
  subtitle = null,
  icon: Icon, 
  trend = null,
  trendValue = null,
  type = 'default',
  delay = 0 
}) => {
  const gradients = {
    revenue: 'from-green-500 to-emerald-600',
    products: 'from-blue-500 to-indigo-600',
    alerts: 'from-red-500 to-rose-600',
    sales: 'from-amber-500 to-orange-600',
    default: 'from-slate-500 to-slate-600'
  };

  const bgColors = {
    revenue: 'bg-green-50 dark:bg-green-900/20',
    products: 'bg-blue-50 dark:bg-blue-900/20',
    alerts: 'bg-red-50 dark:bg-red-900/20',
    sales: 'bg-amber-50 dark:bg-amber-900/20',
    default: 'bg-slate-50 dark:bg-slate-800'
  };

  const iconColors = {
    revenue: 'text-green-600 dark:text-green-400',
    products: 'text-blue-600 dark:text-blue-400',
    alerts: 'text-red-600 dark:text-red-400',
    sales: 'text-amber-600 dark:text-amber-400',
    default: 'text-slate-600 dark:text-slate-400'
  };

  const displayValue = type === 'currency' 
    ? formatPrice(value) 
    : type === 'number' 
    ? formatNumber(value) 
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-6 relative overflow-hidden group"
    >
      {/* Background Gradient Decoration */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradients[type]} opacity-10 group-hover:opacity-20 transition-opacity`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {displayValue}
          </h3>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          
          {trend && (
            <div className={`flex items-center gap-1 mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${bgColors[type]}`}>
          <Icon className={`w-6 h-6 ${iconColors[type]}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
