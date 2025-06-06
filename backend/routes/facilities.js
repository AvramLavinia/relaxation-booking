// backend/src/routes/facilities.js
import express from 'express';
import { getAllFacilities } from '../models/facility.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await getAllFacilities();
    return res.json({ facilities });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
