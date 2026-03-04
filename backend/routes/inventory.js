import express from 'express';
import { Product, InventoryLog } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get inventory logs (USER SPECIFIC)
router.get('/logs', authenticate, async (req, res) => {
  try {
    const { product, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = { performedBy: req.user._id };
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

// Get low stock products (USER SPECIFIC)
router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      createdBy: req.user._id,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).sort({ stock: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expiring products (USER SPECIFIC)
router.get('/expiring', authenticate, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(days));

    const products = await Product.find({
      isActive: true,
      createdBy: req.user._id,
      expiryDate: { $lte: targetDate, $gte: new Date() }
    }).sort({ expiryDate: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
