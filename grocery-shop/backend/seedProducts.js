import mongoose from 'mongoose';
import { Product } from './models/index.js';

const products = [
  {
    name: 'Fresh Apples (1kg)',
    description: 'Premium quality red apples, crisp and juicy',
    category: 'Fruits',
    costPrice: 120,
    sellingPrice: 180,
    price: 180,
    stock: 50,
    lowStockThreshold: 15,
    expiryDate: new Date('2025-03-15'),
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'
  },
  {
    name: 'Bananas (1 dozen)',
    description: 'Fresh ripe bananas, perfect for smoothies',
    category: 'Fruits',
    costPrice: 40,
    sellingPrice: 60,
    price: 60,
    stock: 100,
    lowStockThreshold: 20,
    expiryDate: new Date('2025-02-25'),
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
  },
  {
    name: 'Fresh Tomatoes (1kg)',
    description: 'Farm fresh tomatoes, rich in flavor',
    category: 'Vegetables',
    costPrice: 35,
    sellingPrice: 55,
    price: 55,
    stock: 80,
    lowStockThreshold: 25,
    expiryDate: new Date('2025-02-28'),
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'
  },
  {
    name: 'Potatoes (2kg)',
    description: 'Premium quality potatoes, perfect for all dishes',
    category: 'Vegetables',
    costPrice: 50,
    sellingPrice: 80,
    price: 80,
    stock: 120,
    lowStockThreshold: 30,
    expiryDate: new Date('2025-04-30'),
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber40f?w=400'
  },
  {
    name: 'Amul Butter (500g)',
    description: 'Fresh creamy butter, perfect for cooking and spreading',
    category: 'Dairy',
    costPrice: 220,
    sellingPrice: 285,
    price: 285,
    stock: 40,
    lowStockThreshold: 10,
    expiryDate: new Date('2025-05-15'),
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'
  },
  {
    name: 'Amul Milk (1L)',
    description: 'Fresh pasteurized milk, rich in calcium',
    category: 'Dairy',
    costPrice: 55,
    sellingPrice: 72,
    price: 72,
    stock: 60,
    lowStockThreshold: 20,
    expiryDate: new Date('2025-02-22'),
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'
  },
  {
    name: 'Brown Bread',
    description: 'Freshly baked brown bread, healthy and nutritious',
    category: 'Bakery',
    costPrice: 25,
    sellingPrice: 40,
    price: 40,
    stock: 45,
    lowStockThreshold: 15,
    expiryDate: new Date('2025-02-20'),
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },
  {
    name: 'Croissants (Pack of 4)',
    description: 'Buttery flaky croissants, freshly baked',
    category: 'Bakery',
    costPrice: 80,
    sellingPrice: 120,
    price: 120,
    stock: 30,
    lowStockThreshold: 10,
    expiryDate: new Date('2025-02-19'),
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'
  },
  {
    name: 'Coca Cola (2L)',
    description: 'Refreshing cold drink, perfect for parties',
    category: 'Beverages',
    costPrice: 75,
    sellingPrice: 95,
    price: 95,
    stock: 70,
    lowStockThreshold: 20,
    expiryDate: new Date('2025-08-30'),
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400'
  },
  {
    name: 'Orange Juice (1L)',
    description: '100% pure orange juice, no preservatives',
    category: 'Beverages',
    costPrice: 90,
    sellingPrice: 125,
    price: 125,
    stock: 35,
    lowStockThreshold: 12,
    expiryDate: new Date('2025-03-10'),
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400'
  },
  {
    name: 'Lays Chips (Pack of 3)',
    description: 'Crispy potato chips, assorted flavors',
    category: 'Snacks',
    costPrice: 45,
    sellingPrice: 60,
    price: 60,
    stock: 90,
    lowStockThreshold: 25,
    expiryDate: new Date('2025-07-15'),
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'
  },
  {
    name: 'Cadbury Dairy Milk',
    description: 'Creamy milk chocolate, perfect treat',
    category: 'Snacks',
    costPrice: 35,
    sellingPrice: 50,
    price: 50,
    stock: 100,
    lowStockThreshold: 30,
    expiryDate: new Date('2025-09-20'),
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400'
  },
  {
    name: 'Basmati Rice (5kg)',
    description: 'Premium long grain basmati rice',
    category: 'Grains',
    costPrice: 350,
    sellingPrice: 450,
    price: 450,
    stock: 55,
    lowStockThreshold: 15,
    expiryDate: new Date('2026-02-28'),
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
  },
  {
    name: 'Whole Wheat Flour (5kg)',
    description: 'Stone ground whole wheat atta',
    category: 'Grains',
    costPrice: 180,
    sellingPrice: 240,
    price: 240,
    stock: 65,
    lowStockThreshold: 20,
    expiryDate: new Date('2025-08-15'),
    image: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=400'
  },
  {
    name: 'Turmeric Powder (200g)',
    description: 'Pure turmeric powder, organic quality',
    category: 'Spices',
    costPrice: 35,
    sellingPrice: 55,
    price: 55,
    stock: 85,
    lowStockThreshold: 25,
    expiryDate: new Date('2026-01-31'),
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400'
  },
  {
    name: 'Red Chili Powder (200g)',
    description: 'Premium quality red chili powder',
    category: 'Spices',
    costPrice: 40,
    sellingPrice: 65,
    price: 65,
    stock: 75,
    lowStockThreshold: 20,
    expiryDate: new Date('2026-01-31'),
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'
  },
  {
    name: 'Dove Shampoo (340ml)',
    description: 'Nourishing shampoo for healthy hair',
    category: 'Personal Care',
    costPrice: 180,
    sellingPrice: 245,
    price: 245,
    stock: 40,
    lowStockThreshold: 12,
    expiryDate: new Date('2026-06-30'),
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'
  },
  {
    name: 'Colgate Toothpaste (200g)',
    description: 'Cavity protection toothpaste',
    category: 'Personal Care',
    costPrice: 75,
    sellingPrice: 105,
    price: 105,
    stock: 95,
    lowStockThreshold: 30,
    expiryDate: new Date('2026-04-30'),
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400'
  },
  {
    name: 'Surf Excel Detergent (1kg)',
    description: 'Powerful stain removal detergent',
    category: 'Household',
    costPrice: 120,
    sellingPrice: 165,
    price: 165,
    stock: 50,
    lowStockThreshold: 15,
    expiryDate: new Date('2026-12-31'),
    image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400'
  },
  {
    name: 'Harpic Toilet Cleaner (500ml)',
    description: 'Powerful toilet cleaner, kills 99.9% germs',
    category: 'Household',
    costPrice: 65,
    sellingPrice: 95,
    price: 95,
    stock: 60,
    lowStockThreshold: 18,
    expiryDate: new Date('2026-10-31'),
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400'
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery_shop');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Successfully inserted ${insertedProducts.length} products`);

    // Calculate and display summary
    let totalInvestment = 0;
    let totalStockValue = 0;
    let totalProfit = 0;

    insertedProducts.forEach(product => {
      const investment = product.costPrice * product.stock;
      const value = product.sellingPrice * product.stock;
      const profit = (product.sellingPrice - product.costPrice) * product.stock;
      
      totalInvestment += investment;
      totalStockValue += value;
      totalProfit += profit;

      console.log(`\n${product.name}:`);
      console.log(`  Cost: ₹${product.costPrice} | Selling: ₹${product.sellingPrice}`);
      console.log(`  Profit: ₹${product.sellingPrice - product.costPrice} (${((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1)}%)`);
      console.log(`  Stock: ${product.stock} units`);
    });

    console.log('\n========== SUMMARY ==========');
    console.log(`Total Products: ${insertedProducts.length}`);
    console.log(`Total Investment: ₹${totalInvestment.toLocaleString()}`);
    console.log(`Total Stock Value: ₹${totalStockValue.toLocaleString()}`);
    console.log(`Expected Profit: ₹${totalProfit.toLocaleString()}`);
    console.log(`Average Margin: ${(totalProfit / totalStockValue * 100).toFixed(2)}%`);

    if (!process.env.AUTO_SEED) {
      process.exit(0);
    }
    
    return insertedProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    if (!process.env.AUTO_SEED) {
      process.exit(1);
    }
    throw error;
  }
}

// Export for use in server.js
export { seedProducts as seedDatabase };
