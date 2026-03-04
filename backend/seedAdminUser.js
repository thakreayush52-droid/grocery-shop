import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function seedAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@grocery.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      mongoose.connection.close();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@grocery.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Email: admin@grocery.com');
    console.log('   Password: password');
    console.log('\n⚠️  Please change this password after first login!\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedAdminUser();
