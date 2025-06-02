// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes      from './routes/auth.js';
import facilityRoutes  from './routes/facilities.js';
import bookingRoutes   from './routes/bookings.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 1) Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React frontend URL
  credentials: true
}));
app.use(express.json()); // parse JSON bodies

// 2) Routes
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);

// 3) Health‐check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// 4) 404 fallback
app.use((_, res) => res.status(404).json({ error: 'Not Found' }));

// 5) Start listening
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
