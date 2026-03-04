import mongoose from 'mongoose';
import { Product } from './models/index.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

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
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'
  },
  {
    name: 'Whole Milk (1L)',
    description: 'Fresh organic whole milk',
    category: 'Dairy',
    costPrice: 60,
    sellingPrice: 80,
    price: 80,
    stock: 40,
    lowStockThreshold: 10,
    expiryDate: new Date('2025-02-22'),
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'
  },
  {
    name: 'Bread Loaf',
    description: 'Soft white bread loaf',
    category: 'Bakery',
    costPrice: 30,
    sellingPrice: 45,
    price: 45,
    stock: 60,
    lowStockThreshold: 15,
    expiryDate: new Date('2025-02-20'),
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },
  {
    name: 'Orange Juice (1L)',
    description: '100% pure orange juice',
    category: 'Beverages',
    costPrice: 80,
    sellingPrice: 120,
    price: 120,
    stock: 35,
    lowStockThreshold: 10,
    expiryDate: new Date('2025-03-10'),
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'
  },
  {
    name: 'Basmati Rice (5kg)',
    description: 'Premium aged basmati rice',
    category: 'Grains',
    costPrice: 400,
    sellingPrice: 550,
    price: 550,
    stock: 25,
    lowStockThreshold: 5,
    expiryDate: new Date('2025-12-31'),
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
  },
  {
    name: 'Atta Flour (10kg)',
    description: 'Whole wheat atta flour',
    category: 'Grains',
    costPrice: 350,
    sellingPrice: 480,
    price: 480,
    stock: 30,
    lowStockThreshold: 8,
    expiryDate: new Date('2025-08-15'),
    image: 'https://images.unsplash.com/photo-1627483262762-00a15c13a951?w=400'
  },
  {
    name: 'Turmeric Powder (100g)',
    description: 'Pure turmeric powder',
    category: 'Spices',
    costPrice: 40,
    sellingPrice: 65,
    price: 65,
    stock: 70,
    lowStockThreshold: 20,
    expiryDate: new Date('2025-12-31'),
    image: 'https://images.unsplash.com/photo-1627483262762-00a15c13a951?w=400'
  },
  {
    name: 'Red Chili Powder (100g)',
    description: 'Spicy red chili powder',
    category: 'Spices',
    costPrice: 50,
    sellingPrice: 80,
    price: 80,
    stock: 65,
    lowStockThreshold: 18,
    expiryDate: new Date('2025-11-30'),
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'
  },
  {
    name: 'Toor Dal (1kg)',
    description: 'Split pigeon pea lentils',
    category: 'Grains',
    costPrice: 120,
    sellingPrice: 170,
    price: 170,
    stock: 45,
    lowStockThreshold: 12,
    expiryDate: new Date('2025-09-30'),
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
  },
  {
    name: 'Sugar (1kg)',
    description: 'Refined white sugar',
    category: 'Grains',
    costPrice: 45,
    sellingPrice: 65,
    price: 65,
    stock: 90,
    lowStockThreshold: 25,
    expiryDate: new Date('2026-12-31'),
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400'
  },
  {
    name: 'Tea Leaves (250g)',
    description: 'Premium Assam tea leaves',
    category: 'Beverages',
    costPrice: 150,
    sellingPrice: 220,
    price: 220,
    stock: 40,
    lowStockThreshold: 10,
    expiryDate: new Date('2025-10-31'),
    image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400'
  },
  {
    name: 'Coffee Powder (200g)',
    description: 'Rich aromatic coffee powder',
    category: 'Beverages',
    costPrice: 200,
    sellingPrice: 300,
    price: 300,
    stock: 30,
    lowStockThreshold: 8,
    expiryDate: new Date('2025-09-30'),
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
  },
  {
    name: 'Shampoo (200ml)',
    description: 'Silky smooth hair shampoo',
    category: 'Personal Care',
    costPrice: 120,
    sellingPrice: 180,
    price: 180,
    stock: 35,
    lowStockThreshold: 10,
    expiryDate: new Date('2026-06-30'),
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400'
  },
  {
    name: 'Soap Bar',
    description: 'Moisturizing bathing soap',
    category: 'Personal Care',
    costPrice: 25,
    sellingPrice: 40,
    price: 40,
    stock: 100,
    lowStockThreshold: 30,
    expiryDate: new Date('2027-12-31'),
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400'
  },
  {
    name: 'Toothpaste (150g)',
    description: 'Complete care toothpaste',
    category: 'Personal Care',
    costPrice: 60,
    sellingPrice: 95,
    price: 95,
    stock: 50,
    lowStockThreshold: 15,
    expiryDate: new Date('2026-08-31'),
    image: 'https://images.unsplash.com/photo-1559599238-308793637427?w=400'
  },
  {
    name: 'Dish Soap (500ml)',
    description: 'Powerful grease fighter dish soap',
    category: 'Household',
    costPrice: 70,
    sellingPrice: 110,
    price: 110,
    stock: 45,
    lowStockThreshold: 12,
    expiryDate: new Date('2026-12-31'),
    image: 'https://images.unsplash.com/photo-1585421514738-01798e1e8f7d?w=400'
  },
  {
    name: 'Laundry Detergent (1L)',
    description: 'Concentrated laundry detergent',
    category: 'Household',
    costPrice: 150,
    sellingPrice: 220,
    price: 220,
    stock: 35,
    lowStockThreshold: 10,
    expiryDate: new Date('2026-12-31'),
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400'
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get or create system user for predefined products
    let systemUser = await User.findOne({ email: 'system@groceryshop.com' });
    
    if (!systemUser) {
      const hashedPassword = await bcrypt.hash('System@123', 10);
      systemUser = new User({
        name: 'System Admin',
        email: 'system@groceryshop.com',
        password: hashedPassword,
        role: 'admin'
      });
      await systemUser.save();
      console.log('✅ Created system user for predefined products\n');
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products\n');

    // Add createdBy to all products
    const productsWithCreator = products.map(product => ({
      ...product,
      createdBy: systemUser._id
    }));

    // Insert all products
    const insertedProducts = await Product.insertMany(productsWithCreator);

    console.log(`✅ Successfully inserted ${insertedProducts.length} products\n`);

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

      console.log(`${product.name}:`);
      console.log(`  Cost: ₹${product.costPrice} | Selling: ₹${product.sellingPrice}`);
      console.log(`  Profit: ₹${product.sellingPrice - product.costPrice} (${((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1)}%)`);
      console.log(`  Stock: ${product.stock} units\n`);
    });

    console.log('\n========== SUMMARY ==========');
    console.log(`Total Products: ${insertedProducts.length}`);
    console.log(`Total Investment: ₹${totalInvestment.toLocaleString()}`);
    console.log(`Total Stock Value: ₹${totalStockValue.toLocaleString()}`);
    console.log(`Expected Profit: ₹${totalProfit.toLocaleString()}`);
    console.log(`Average Margin: ${(totalProfit / totalStockValue * 100).toFixed(2)}%`);
    console.log('\n✅ All products are now visible to ALL users!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
