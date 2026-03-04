import express from 'express';
import { Product, InventoryLog } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get inventory logs
router.get('/logs', authenticate, async (req, res) => {
  try {
    const { product, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = {};
    if (product) query.product = product;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      InventoryLog.find(query)
        .populate('product', 'name category')
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InventoryLog.countDocuments(query)
    ]);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', authenticate, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).sort({ stock: 1 });

    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expiry alerts
router.get('/alerts/expiry', authenticate, async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringProducts = await Product.find({
      isActive: true,
      expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() }
    }).sort({ expiryDate: 1 });

    const expiredProducts = await Product.find({
      isActive: true,
      expiryDate: { $lt: new Date() }
    });

    res.json({
      expiringSoon: expiringProducts,
      expired: expiredProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    const totalStockValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          totalItems: { $sum: '$stock' }
        }
      }
    ]);

    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    const categorySummary = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          stockValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    res.json({
      totalProducts,
      totalStockValue: totalStockValue[0]?.totalValue || 0,
      totalItems: totalStockValue[0]?.totalItems || 0,
      lowStockCount,
      categorySummary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
