import express from 'express';
import db from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// Get all users
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  const users = await db.query('SELECT id, email, display_name FROM users ORDER BY id');
  res.json({ users: users.rows });
});

// Get all bookings
router.get('/bookings', authenticateToken, requireRole('admin'), async (req, res) => {
  const bookings = await db.query(
    `SELECT b.id, b.start_time, b.end_time, b.status, u.email AS user_email, f.name AS facility_name
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     JOIN facilities f ON b.facility_id = f.id
     ORDER BY b.start_time DESC`
  );
  res.json({ bookings: bookings.rows });
});

// Add a facility
router.post('/facilities', authenticateToken, requireRole('admin'), async (req, res) => {
  const { slug, name, icon } = req.body;
  if (!slug || !name || !icon) return res.status(400).json({ error: 'Missing fields.' });
  const result = await db.query(
    'INSERT INTO facilities (slug, name, icon) VALUES ($1, $2, $3) RETURNING id, slug, name, icon',
    [slug, name, icon]
  );
  res.status(201).json({ facility: result.rows[0] });
});

// Edit a facility
router.put('/facilities/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { slug, name, icon } = req.body;
  const result = await db.query(
    'UPDATE facilities SET slug=$1, name=$2, icon=$3 WHERE id=$4 RETURNING id, slug, name, icon',
    [slug, name, icon, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Facility not found.' });
  res.json({ facility: result.rows[0] });
});

// Delete a facility
router.delete('/facilities/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM facilities WHERE id=$1', [id]);
  res.json({ success: true });
});

// Assign admin role
router.post('/users/:id/admin', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  await db.query(
    'INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = $2)) ON CONFLICT DO NOTHING',
    [id, 'admin']
  );
  res.json({ success: true });
});

// Revoke admin role
router.delete('/users/:id/admin', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  await db.query(
    'DELETE FROM user_roles WHERE user_id = $1 AND role_id = (SELECT id FROM roles WHERE name = $2)',
    [id, 'admin']
  );
  res.json({ success: true });
});

export default router;