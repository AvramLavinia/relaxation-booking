// backend/src/routes/bookings.js
import express from 'express';
import {
  isFacilityOccupied,
  createBooking,
  getActiveBookings,
  expirePastBookings
} from '../models/booking.js';
import { findFacilityBySlug } from '../models/facility.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/bookings
// Body: { facilitySlug: 'ps5', durationMin: 20 }
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { facilitySlug, durationMin } = req.body;
    if (!facilitySlug || !durationMin) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // 1) Look up facility by slug
    const facility = await findFacilityBySlug(facilitySlug);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found.' });
    }

    // 2) Check for active booking conflict
    const occupied = await isFacilityOccupied(facility.id);
    if (occupied) {
      return res.status(409).json({ error: 'Facility is currently occupied.' });
    }

    // 3) Create new booking
    const newBooking = await createBooking({
      facilityId: facility.id,
      userId:     req.user.id,
      durationMin
    });
    return res.status(201).json({ booking: newBooking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/bookings/active
// Returns a list of all currently occupied bookings, after expiring old ones.
router.get('/active', authenticateToken, async (req, res) => {
  try {
    // Expire anything past its end_time
    await expirePastBookings();

    // Fetch remaining occupied bookings
    const active = await getActiveBookings();
    return res.json({ active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
