import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { initializeDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS Configuration ───
// In production, FRONTEND_URL should be your Vercel domain
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ─── Body parsers ───
// Increased limit to handle base64 image data in JSON payloads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ─── Health check endpoint (useful for Render) ───
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Employee Management API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ─── Routes ───
app.use('/api', authRoutes);
app.use('/api/employees', employeeRoutes);

// ─── Error handling ───
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size must be less than 1MB.' });
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// ─── Start server ───
async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 CORS allowing: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
