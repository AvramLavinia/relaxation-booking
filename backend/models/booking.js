// backend/src/models/booking.js
import db from '../db/index.js';

/**
 * Check if a facility is occupied during a specified interval.
 * Overlap condition: NOT (existing.end_time <= newStart OR existing.start_time >= newEnd)
 */
export async function isFacilityOccupiedInInterval(facilityId, startTime, endTime) {
  const res = await db.query(
    `SELECT id
     FROM bookings
     WHERE facility_id = $1
       AND status = 'occupied'
       AND NOT (end_time <= $2 OR start_time >= $3)
     LIMIT 1;`,
    [facilityId, startTime, endTime]
  );
  return res.rows.length > 0;
}

/**
 * Create a new booking at the given start (ISO string) for durationMin minutes.
 */
export async function createBooking({ facilityId, userId, start, durationMin }) {
  const startTime = new Date(start);
  if (isNaN(startTime.getTime())) {
    throw new Error('Invalid start time');
  }
  const endTime = new Date(startTime.getTime() + durationMin * 60000);

  const res = await db.query(
    `INSERT INTO bookings
       (facility_id, user_id, start_time, end_time, status)
     VALUES ($1, $2, $3, $4, 'occupied')
     RETURNING id, facility_id, user_id, start_time, end_time, status;`,
    [facilityId, userId, startTime, endTime]
  );
  return res.rows[0];
}

/**
 * Expire any past bookings (status='occupied' AND end_time <= now → status='completed').
 */
export async function expirePastBookings() {
  const now = new Date();
  const res = await db.query(
    `UPDATE bookings
     SET status = 'completed'
     WHERE status = 'occupied'
       AND end_time <= $1
     RETURNING id;`,
    [now]
  );
  return res.rows.map((r) => r.id);
}

/**
 * Fetch all currently occupied bookings (status='occupied' AND end_time > now),
 * joined with users and facilities for extra info.
 */
export async function getActiveBookings() {
  const now = new Date();
  const res = await db.query(
    `SELECT b.id, b.facility_id, b.user_id, b.start_time, b.end_time, b.status,
            u.email    AS user_email,
            f.slug     AS facility_slug
     FROM bookings   AS b
     JOIN users      AS u ON b.user_id     = u.id
     JOIN facilities AS f ON b.facility_id = f.id
     WHERE b.status = 'occupied'
       AND b.end_time > $1
     ORDER BY b.start_time;`,
    [now]
  );
  return res.rows;
}
