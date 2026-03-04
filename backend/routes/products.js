import express from 'express';
import { body, validationResult } from 'express-validator';
import { Product, InventoryLog } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all products with search, filter, sort (SHARED PRODUCTS - ALL USERS CAN SEE)
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      lowStock, 
      expiringSoon, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let query = { isActive: true }; // No user filter - products are shared

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (minPrice) query.price = { $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    if (expiringSoon === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      query.expiryDate = { $lte: sevenDaysFromNow, $gte: new Date() };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
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

// Get single product
router.get('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (only admins can add new products)
router.post('/', authenticate, upload.single('image'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Valid cost price is required'),
  body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Valid selling price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = {
      ...req.body,
      createdBy: req.user._id,
      costPrice: Number(req.body.costPrice) || Number(req.body.price),
      sellingPrice: Number(req.body.sellingPrice) || Number(req.body.price),
      price: Number(req.body.sellingPrice) || Number(req.body.price),
      stock: Number(req.body.stock),
      lowStockThreshold: Number(req.body.lowStockThreshold) || 10
    };

    if (req.body.expiryDate) {
      productData.expiryDate = new Date(req.body.expiryDate);
    }

    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }

    const product = new Product(productData);
    await product.save();

    // Log inventory entry
    const inventoryLog = new InventoryLog({
      product: product._id,
      type: 'in',
      quantity: product.stock,
      previousStock: 0,
      newStock: product.stock,
      reason: 'purchase',
      performedBy: req.user._id,
      notes: 'Initial stock'
    });
    await inventoryLog.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (only the creator can update)
router.put('/:id', authenticate, upload.single('image'), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Valid cost price is required'),
  body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Valid selling price is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Valid stock quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only allow creator to update, or admin role
    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { ...req.body };
    
    if (req.body.costPrice) updateData.costPrice = Number(req.body.costPrice);
    if (req.body.sellingPrice) {
      updateData.sellingPrice = Number(req.body.sellingPrice);
      updateData.price = Number(req.body.sellingPrice);
    }
    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.stock) updateData.stock = Number(req.body.stock);
    if (req.body.lowStockThreshold) updateData.lowStockThreshold = Number(req.body.lowStockThreshold);
    if (req.body.expiryDate) updateData.expiryDate = new Date(req.body.expiryDate);

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (soft delete - only creator or admin can delete)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only allow creator to delete, or admin role
    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
