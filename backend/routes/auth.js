import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/index.js'; // or your db connection
import dotenv from 'dotenv';
import { findByEmail } from '../models/user.js';
import { authenticateToken } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  const user = await findByEmail(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ id: user.id, email: user.email, display_name: user.display_name });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Missing fields.' });
  }
  // Check domain
  const companyDomain = process.env.COMPANY_DOMAIN || 'endava.com';
  if (!email.endsWith(`@${companyDomain}`)) {
    return res.status(400).json({ error: 'Email must be a company email.' });
  }
  // Check if user exists
  const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email already registered.' });
  }
  // Hash password
  const password_hash = await bcrypt.hash(password, 10);
  // Create user
  const userRes = await db.query(
    'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
    [email, password_hash, displayName]
  );
  const user = userRes.rows[0];
  // Assign user role
  await db.query(
    'INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = $2))',
    [user.id, 'user']
  );
  // Create JWT
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields.' });
  }
  // Find user
  const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userRes.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const user = userRes.rows[0];
  // Check password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  // Create JWT
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name } });
});

export default router;