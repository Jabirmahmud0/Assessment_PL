import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Product from './models/Product';
import { products } from './types/products';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('MongoDB Connected');

    // 1. Seed Admin User
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      });
      console.log('Admin user created:', admin.email);
    }

    // 2. Seed Products
    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log('Inserting sample products...');
    await Product.insertMany(products);
    console.log(`Successfully inserted ${products.length} products.`);

    await mongoose.disconnect();
    console.log('Database seeding completed smoothly.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
