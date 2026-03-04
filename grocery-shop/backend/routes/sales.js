import express from 'express';
import { body, validationResult } from 'express-validator';
import { Sale, Product, InventoryLog } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { calculateTotals } from '../utils/currency.js';

const router = express.Router();

// Get all sales
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      paymentMode,
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (paymentMode) query.paymentMode = paymentMode;

    const skip = (Number(page) - 1) * Number(limit);

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('items.product', 'name category')
        .populate('soldBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Sale.countDocuments(query)
    ]);

    res.json({
      sales,
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

// Get single sale
router.get('/:id', authenticate, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.product', 'name category price image')
      .populate('soldBy', 'name');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create sale
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('paymentMode').isIn(['Cash', 'UPI', 'Card', 'Other']).withMessage('Valid payment mode is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, paymentMode, customerName, customerPhone, gstRate = 0 } = req.body;

    // Validate stock and prepare sale items
    const saleItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemPrice = product.sellingPrice || product.price;
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice,
        total: itemPrice * item.quantity
      });
    }

    // Calculate totals
    const { subtotal, gstAmount, total } = calculateTotals(saleItems, gstRate);

    // Create sale
    const sale = new Sale({
      items: saleItems,
      subtotal,
      gstRate,
      gstAmount,
      total,
      paymentMode,
      customerName,
      customerPhone,
      soldBy: req.user._id
    });

    await sale.save();

    // Update stock and create inventory logs
    for (const item of saleItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      const inventoryLog = new InventoryLog({
        product: product._id,
        type: 'out',
        quantity: item.quantity,
        previousStock,
        newStock: product.stock,
        reason: 'sale',
        reference: sale.invoiceNumber,
        performedBy: req.user._id
      });
      await inventoryLog.save();
    }

    await sale.populate('items.product', 'name category');
    await sale.populate('soldBy', 'name');

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales summary for dashboard
router.get('/summary/daily', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailySales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      date: today,
      totalSales: dailySales[0]?.totalSales || 0,
      count: dailySales[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly sales
router.get('/summary/monthly', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlySales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalSales: monthlySales[0]?.totalSales || 0,
      count: monthlySales[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales by payment mode
router.get('/summary/payment-modes', authenticate, async (req, res) => {
  try {
    const paymentModeStats = await Sale.aggregate([
      {
        $group: {
          _id: '$paymentMode',
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(paymentModeStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
