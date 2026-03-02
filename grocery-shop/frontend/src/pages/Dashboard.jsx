import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  TrendingUp,
  Calendar
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { SalesChart, CategoryPieChart, ForecastChart } from '../components/Charts';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import { formatPrice } from '../utils/currency';
import { formatDate, getRelativeTime } from '../utils/date';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, salesRes, predictionsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts/sales?period=7days'),
        api.get('/dashboard/predictions')
      ]);

      setStats(statsRes.data);
      setSalesData(salesRes.data);
      setPredictions(predictionsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
          {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          type="currency"
          icon={IndianRupee}
          delay={0}
        />
        <StatCard
          title="Actual Profit"
          value={stats?.actualProfit || 0}
          subtitle={`${((stats?.actualProfit || 0) / (stats?.totalSalesRevenue || 1) * 100).toFixed(1)}% margin`}
          type="revenue"
          icon={TrendingUp}
          delay={0.1}
        />
        <StatCard
          title="Stock Value"
          value={stats?.totalStockValue || 0}
          subtitle={`Potential: ${formatPrice(stats?.potentialProfit || 0)}`}
          type="products"
          icon={Package}
          delay={0.2}
        />
        <StatCard
          title="Today's Sales"
          value={stats?.todaySales || 0}
          subtitle={`${stats?.todayCount || 0} transactions`}
          type="sales"
          icon={ShoppingCart}
          delay={0.3}
        />
      </div>

      {/* Profit Summary Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Profit & Investment Summary
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Sales Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats?.totalSalesRevenue || 0)}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-slate-500 dark:text-slate-400">Cost of Goods Sold</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(stats?.totalSalesCost || 0)}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-sm text-slate-500 dark:text-slate-400">Actual Profit</p>
              <p className="text-2xl font-bold text-purple-600">{formatPrice(stats?.actualProfit || 0)}</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-sm text-slate-500 dark:text-slate-400">Stock Investment</p>
              <p className="text-2xl font-bold text-amber-600">{formatPrice(stats?.totalStockCost || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sales Overview</h3>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sales by Category</h3>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={stats?.salesByCategory || []} />
          </CardContent>
        </Card>
      </div>

      {/* ML Predictions & Best Sellers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Sales Forecast (ML)
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Predicted sales for next 7 days</p>
            </div>
          </CardHeader>
          <CardContent>
            {predictions?.salesForecast7Days?.predictions ? (
              <ForecastChart data={predictions.salesForecast7Days.predictions} />
            ) : (
              <div className="text-center py-8 text-slate-500">
                Not enough data for predictions
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Best Selling Products</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.bestSellers?.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.product.name}</p>
                      <p className="text-sm text-slate-500">{item.product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(item.totalRevenue)}</p>
                    <p className="text-sm text-slate-500">{item.totalQuantity} sold</p>
                  </div>
                </motion.div>
              ))}
              {(!stats?.bestSellers || stats.bestSellers.length === 0) && (
                <p className="text-center text-slate-500 py-4">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Recent Sales Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Inventory Alerts
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.lowStockProducts?.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.category}</p>
                  </div>
                  <Badge variant="danger">{product.stock} left</Badge>
                </div>
              ))}
              {stats?.expiringProducts?.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-slate-500">Expires {getRelativeTime(product.expiryDate)}</p>
                  </div>
                  <Badge variant="warning">Expiring</Badge>
                </div>
              ))}
              {(!stats?.lowStockProducts?.length && !stats?.expiringProducts?.length) && (
                <p className="text-center text-slate-500 py-4">No alerts at the moment</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Sales</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentSales?.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{sale.invoiceNumber}</p>
                    <p className="text-sm text-slate-500">{sale.items.length} items • {sale.soldBy.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(sale.total)}</p>
                    <p className="text-sm text-slate-500">{getRelativeTime(sale.createdAt)}</p>
                  </div>
                </div>
              ))}
              {(!stats?.recentSales || stats.recentSales.length === 0) && (
                <p className="text-center text-slate-500 py-4">No recent sales</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
