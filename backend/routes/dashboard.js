import express from 'express';
import { Sale, Product, InventoryLog } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { getSalesPrediction, getRestockRecommendations } from '../utils/mlService.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total Revenue
    const totalRevenueAgg = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Today's Sales
    const todaySalesAgg = await Sale.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    const todaySales = todaySalesAgg[0]?.total || 0;
    const todayCount = todaySalesAgg[0]?.count || 0;

    // Monthly Sales
    const monthlySalesAgg = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    const monthlySales = monthlySalesAgg[0]?.total || 0;
    const monthlyCount = monthlySalesAgg[0]?.count || 0;

    // Total Products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Calculate total stock value and cost
    const stockValueAgg = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: { $multiply: ['$costPrice', '$stock'] } },
          totalValue: { $sum: { $multiply: ['$sellingPrice', '$stock'] } }
        }
      }
    ]);
    const totalStockCost = stockValueAgg[0]?.totalCost || 0;
    const totalStockValue = stockValueAgg[0]?.totalValue || 0;
    const potentialProfit = totalStockValue - totalStockCost;

    // Calculate actual profit from sales
    const salesProfitAgg = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.total' },
          totalCost: { 
            $sum: { 
              $multiply: ['$product.costPrice', '$items.quantity'] 
            } 
          }
        }
      }
    ]);
    const totalSalesRevenue = salesProfitAgg[0]?.totalRevenue || 0;
    const totalSalesCost = salesProfitAgg[0]?.totalCost || 0;
    const actualProfit = totalSalesRevenue - totalSalesCost;

    // Low Stock Products
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).limit(10);

    // Expiring Soon Products
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringProducts = await Product.find({
      isActive: true,
      expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() }
    }).limit(10);

    // Best Selling Products
    const bestSellers = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Sales by Category
    const salesByCategory = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: '$items.total' },
          count: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Recent Sales
    const recentSales = await Sale.find()
      .populate('items.product', 'name')
      .populate('soldBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalRevenue,
      totalSalesRevenue,
      totalSalesCost,
      actualProfit,
      totalStockCost,
      totalStockValue,
      potentialProfit,
      todaySales,
      todayCount,
      monthlySales,
      monthlyCount,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      expiringCount: expiringProducts.length,
      lowStockProducts,
      expiringProducts,
      bestSellers,
      salesByCategory,
      recentSales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales chart data
router.get('/charts/sales', authenticate, async (req, res) => {
  try {
    const { period = '7days' } = req.query;
    
    let startDate = new Date();
    let groupBy = {};

    if (period === '7days') {
      startDate.setDate(startDate.getDate() - 7);
      groupBy = {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
      };
    } else if (period === '30days') {
      startDate.setDate(startDate.getDate() - 30);
      groupBy = {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
      };
    } else if (period === '12months') {
      startDate.setMonth(startDate.getMonth() - 12);
      groupBy = {
        $dateToString: { format: '%Y-%m', date: '$createdAt' }
      };
    }

    const salesData = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ML predictions
router.get('/predictions', authenticate, async (req, res) => {
  try {
    // Get historical sales data
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const historicalData = await Sale.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get predictions from ML service
    const predictions7Days = await getSalesPrediction(historicalData, 7);
    const predictions30Days = await getSalesPrediction(historicalData, 30);

    // Get inventory data for restock recommendations
    const inventoryData = await Product.find({ isActive: true })
      .select('name stock lowStockThreshold price category');

    const restockRecommendations = await getRestockRecommendations(inventoryData);

    res.json({
      salesForecast7Days: predictions7Days,
      salesForecast30Days: predictions30Days,
      restockRecommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
