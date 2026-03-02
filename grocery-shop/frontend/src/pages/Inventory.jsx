import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Package, 
  TrendingUp,
  Calendar,
  History,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import { formatPrice } from '../utils/currency';
import { formatDate, getRelativeTime } from '../utils/date';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState({ expiringSoon: [], expired: [] });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [summaryRes, lowStockRes, expiryRes, logsRes] = await Promise.all([
        api.get('/inventory/summary'),
        api.get('/inventory/alerts/low-stock'),
        api.get('/inventory/alerts/expiry'),
        api.get('/inventory/logs?limit=20')
      ]);

      setSummary(summaryRes.data);
      setLowStock(lowStockRes.data);
      setExpiryAlerts(expiryRes.data);
      setLogs(logsRes.data.logs);
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (stock, threshold) => {
    const ratio = stock / threshold;
    if (ratio <= 0.3) return 'danger';
    if (ratio <= 0.7) return 'warning';
    return 'success';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'history', label: 'History', icon: History }
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h1>
        <p className="text-slate-500 dark:text-slate-400">Track stock levels and manage inventory</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'alerts' && (lowStock.length + expiryAlerts.expiringSoon.length + expiryAlerts.expired.length > 0) && (
                <Badge variant="danger" size="sm">
                  {lowStock.length + expiryAlerts.expiringSoon.length + expiryAlerts.expired.length}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Products</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.totalProducts}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Stock Value</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(summary?.totalStockValue)}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Items</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.totalItems?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Low Stock Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{summary?.lowStockCount}</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Category Breakdown</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary?.categorySummary?.map((category) => (
                  <div
                    key={category._id}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900 dark:text-white">{category._id}</span>
                      <Badge variant="primary">{category.productCount} products</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-slate-500">
                      <p>Stock: {category.totalStock} units</p>
                      <p>Value: {formatPrice(category.stockValue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Low Stock */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Low Stock Alerts</h3>
              <Badge variant="danger">{lowStock.length}</Badge>
            </CardHeader>
            <CardContent>
              {lowStock.length > 0 ? (
                <div className="space-y-3">
                  {lowStock.map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          product.stock <= product.lowStockThreshold * 0.3
                            ? 'bg-red-200 dark:bg-red-800'
                            : 'bg-amber-200 dark:bg-amber-800'
                        }`}>
                          <Package className={`w-5 h-5 ${
                            product.stock <= product.lowStockThreshold * 0.3
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{product.stock}</p>
                        <p className="text-sm text-slate-500">of {product.lowStockThreshold} threshold</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No low stock alerts</p>
              )}
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          {expiryAlerts.expiringSoon.length > 0 && (
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expiring Soon</h3>
                <Badge variant="warning">{expiryAlerts.expiringSoon.length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiryAlerts.expiringSoon.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="warning">Expires {getRelativeTime(product.expiryDate)}</Badge>
                        <p className="text-sm text-slate-500 mt-1">Stock: {product.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expired */}
          {expiryAlerts.expired.length > 0 && (
            <Card>
              <CardHeader className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expired Products</h3>
                <Badge variant="danger">{expiryAlerts.expired.length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiryAlerts.expired.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="danger">Expired on {formatDate(product.expiryDate)}</Badge>
                        <p className="text-sm text-slate-500 mt-1">Stock: {product.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inventory History</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Quantity</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Stock Change</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4 text-slate-500">{formatDate(log.createdAt)}</td>
                      <td className="py-3 px-4 font-medium">{log.product?.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {log.type === 'in' ? (
                            <>
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                              <span className="text-green-600">Stock In</span>
                            </>
                          ) : log.type === 'out' ? (
                            <>
                              <ArrowDownRight className="w-4 h-4 text-red-500" />
                              <span className="text-red-600">Stock Out</span>
                            </>
                          ) : (
                            <span className="text-amber-600">Adjustment</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{log.quantity}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-500">{log.previousStock}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{log.newStock}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{log.reason.replace('_', ' ')}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <p className="text-center text-slate-500 py-8">No inventory history</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Inventory;
