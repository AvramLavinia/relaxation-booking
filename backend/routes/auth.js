// backend/src/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { findByEmail, createUser, validatePassword } from '../models/user.js';

dotenv.config();
const router = express.Router();

// Helper to create a JWT
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
// Accepts { email, password, display_name }
router.post('/register', async (req, res) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1) Enforce company domain (optional)
    const domain = email.split('@')[1];
    if (domain !== process.env.COMPANY_DOMAIN) {
      return res.status(403).json({ error: 'Must use your company email.' });
    }

    // 2) Check if user already exists
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // 3) Create user
    const newUser = await createUser({ email, password, display_name });
    const token   = generateAccessToken(newUser);
    return res.json({ token, user: { id: newUser.id, email: newUser.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/login
// Accepts { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await validatePassword(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = generateAccessToken(user);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
