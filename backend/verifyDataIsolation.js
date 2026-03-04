import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, Sale } from './models/index.js';

dotenv.config();

async function verifyDataIsolation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all users
    const User = mongoose.model('User');
    const users = await User.find().select('name email');
    
    console.log('=== DATA ISOLATION VERIFICATION ===\n');
    
    for (const user of users) {
      console.log(`\n📊 User: ${user.name} (${user.email})`);
      console.log(`   ID: ${user._id}\n`);
      
      // Count products
      const productCount = await Product.countDocuments({ createdBy: user._id });
      console.log(`   📦 Products: ${productCount}`);
      
      // Count sales
      const saleCount = await Sale.countDocuments({ soldBy: user._id });
      console.log(`   💰 Sales: ${saleCount}`);
      
      // Calculate total revenue
      const revenueAgg = await Sale.aggregate([
        { $match: { soldBy: user._id } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const totalRevenue = revenueAgg[0]?.total || 0;
      console.log(`   💵 Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
      
      // Calculate profit
      const profitAgg = await Sale.aggregate([
        { $match: { soldBy: user._id } },
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
            totalCost: { $sum: { $multiply: ['$product.costPrice', '$items.quantity'] } }
          }
        }
      ]);
      const profit = (profitAgg[0]?.totalRevenue || 0) - (profitAgg[0]?.totalCost || 0);
      console.log(`   📈 Profit: ₹${profit.toLocaleString('en-IN')}`);
    }

    // Check for orphaned data
    const orphanedProducts = await Product.countDocuments({ createdBy: { $exists: false } });
    const orphanedSales = await Sale.countDocuments({ soldBy: { $exists: false } });
    
    console.log('\n\n⚠️  ORPHANED DATA CHECK:');
    console.log(`   Products without owner: ${orphanedProducts}`);
    console.log(`   Sales without owner: ${orphanedSales}`);
    
    if (orphanedProducts > 0 || orphanedSales > 0) {
      console.log('\n❌ RUN MIGRATION SCRIPT IMMEDIATELY!');
      console.log('   Command: node migrateProducts.js\n');
    } else {
      console.log('\n✅ All data is properly isolated!\n');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

verifyDataIsolation();
