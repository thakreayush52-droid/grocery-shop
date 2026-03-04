import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/index.js';
import User from './models/User.js';

dotenv.config();

async function migrateProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all products without createdBy field
    const productsWithoutCreator = await Product.find({ createdBy: { $exists: false } });
    console.log(`Found ${productsWithoutCreator.length} products without createdBy field`);

    if (productsWithoutCreator.length === 0) {
      console.log('All products already have createdBy field');
      return;
    }

    // Get the first user or create a default one
    let defaultUser = await User.findOne();
    
    if (!defaultUser) {
      console.log('No users found. Creating a default admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      defaultUser = new User({
        name: 'Admin',
        email: 'admin@groceryshop.com',
        password: hashedPassword,
        role: 'admin'
      });
      await defaultUser.save();
      console.log('Created default admin user (email: admin@groceryshop.com, password: admin123)');
    }

    // Update all products without createdBy
    const result = await Product.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: defaultUser._id } }
    );

    console.log(`Updated ${result.modifiedCount} products with createdBy field`);
    console.log(`All migrated products are now owned by: ${defaultUser.email}`);

    mongoose.connection.close();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

migrateProducts();
