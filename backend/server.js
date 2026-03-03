import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios'; // Add axios to talk to the ML service
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import dashboardRoutes from './routes/dashboard.js';
import inventoryRoutes from './routes/inventory.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Updated for Production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allows your Render frontend to talk to this backend
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);

// NEW: ML Service Integration Route
// This endpoint acts as a bridge between your Frontend and your Python ML Service
app.post('/api/predict', async (req, res) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL; 
    
    // Sending data to the Python FastAPI service
    const response = await axios.post(`${mlServiceUrl}/predict`, req.body);
    
    res.json(response.data);
  } catch (error) {
    console.error('ML Service Error:', error.message);
    res.status(500).json({ message: 'Error communicating with ML Service' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    ml_status: process.env.ML_SERVICE_URL ? 'Configured' : 'Missing'
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});