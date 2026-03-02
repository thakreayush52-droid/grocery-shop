import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Grains', 'Spices', 'Personal Care', 'Household', 'Other']
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  expiryDate: {
    type: Date
  },
  image: {
    type: String
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold;
});

productSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

productSchema.virtual('isExpiringSoon').get(function() {
  if (!this.expiryDate) return false;
  const daysUntilExpiry = Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
});

productSchema.virtual('profit').get(function() {
  return this.sellingPrice - this.costPrice;
});

productSchema.virtual('profitMargin').get(function() {
  if (this.sellingPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.sellingPrice * 100).toFixed(2);
});

productSchema.virtual('totalValue').get(function() {
  return this.stock * this.sellingPrice;
});

productSchema.virtual('totalCost').get(function() {
  return this.stock * this.costPrice;
});

productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
