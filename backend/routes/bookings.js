// backend/src/routes/bookings.js
import express from 'express';
import {
  isFacilityOccupiedInInterval,
  createBooking,
  getActiveBookings,
  expirePastBookings
} from '../models/booking.js';
import { findFacilityBySlug } from '../models/facility.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/bookings
 * Body: { facilitySlug: string, start: ISOString, durationMin: number }
 * Requires authentication!
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { facilitySlug, start, durationMin } = req.body;
    if (!facilitySlug || !start || typeof durationMin !== 'number') {
      return res
        .status(400)
        .json({ error: 'Missing or invalid fields (facilitySlug, start, durationMin).' });
    }

    // 1) Look up facility
    const facility = await findFacilityBySlug(facilitySlug);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found.' });
    }

    // 2) Parse start & compute end
    const startTime = new Date(start);
    if (isNaN(startTime.getTime())) {
      return res.status(400).json({ error: 'Invalid start time format.' });
    }
    const endTime = new Date(startTime.getTime() + durationMin * 60000);

    // 3) Check for overlap
    const occupied = await isFacilityOccupiedInInterval(facility.id, startTime, endTime);
    if (occupied) {
      return res.status(409).json({ error: 'Facility is occupied during that interval.' });
    }

    // 4) Create booking for the authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const newBooking = await createBooking({
      facilityId: facility.id,
      userId:     req.user.id,
      start,
      durationMin
    });
    return res.status(201).json({ booking: newBooking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /api/bookings/active
 * Expires past bookings, then returns all still-occupied.
 */
router.get('/active', async (req, res) => {
  try {
    await expirePastBookings();
    const active = await getActiveBookings();
    return res.json({ active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
