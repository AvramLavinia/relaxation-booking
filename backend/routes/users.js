import express from 'express';
import db from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - list all users (id, email, display_name)
router.get('/', authenticateToken, async (req, res) => {
  const result = await db.query(
    'SELECT id, email, display_name FROM users ORDER BY display_name, email'
  );
  res.json({ users: result.rows });
});

export default router;