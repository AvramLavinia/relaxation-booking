import express from 'express';
const router = express.Router();
import { requireRole } from '../middleware/requireRole.js';
import { authenticateToken } from '../middleware/auth.js';

router.post('/admin-action', authenticateToken, requireRole('admin'), async (req, res) => {
  // Only admins can reach here
  res.json({ message: "Admin action performed." });
});

export default router;