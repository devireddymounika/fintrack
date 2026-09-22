import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import savingsRoutes from './routes/savings.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps) or matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // permissive for Vercel same-domain (origin === undefined)
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FinTrack API', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// In local dev, start an actual HTTP server.
// In production (Vercel), the file is imported as a serverless function — no listen needed.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 FinTrack API Server running on http://localhost:${PORT}`);
  });
}

export default app;

