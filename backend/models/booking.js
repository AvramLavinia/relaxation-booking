// backend/src/models/booking.js
import db from '../db/index.js';

// 1) Check if a facility is currently occupied (active booking).
export async function isFacilityOccupied(facilityId) {
  const now = new Date();
  const result = await db.query(
    `SELECT id
     FROM bookings
     WHERE facility_id = $1
       AND start_time <= $2
       AND end_time   >  $2
       AND status = 'occupied'
     LIMIT 1`,
    [facilityId, now]
  );
  return result.rows.length > 0;
}

// 2) Create a new booking record.
export async function createBooking({ facilityId, userId, durationMin }) {
  const start = new Date();
  const end   = new Date(start.getTime() + durationMin * 60000);

  const result = await db.query(
    `INSERT INTO bookings
       (facility_id, user_id, start_time, end_time, status)
     VALUES ($1, $2, $3, $4, 'occupied')
     RETURNING id, facility_id, user_id, start_time, end_time, status`,
    [facilityId, userId, start, end]
  );
  return result.rows[0];
}

// 3) Expire past bookings (mark them “completed” when end_time ≤ now).
export async function expirePastBookings() {
  const now = new Date();
  const result = await db.query(
    `UPDATE bookings
     SET status = 'completed'
     WHERE status = 'occupied'
       AND end_time <= $1
     RETURNING id`,
    [now]
  );
  return result.rows.map(r => r.id);
}

// 4) Fetch all active bookings (after expiring old ones).
export async function getActiveBookings() {
  const now = new Date();
  const result = await db.query(
    `SELECT b.id, b.facility_id, b.user_id,
            b.start_time, b.end_time, b.status,
            u.email    AS user_email,
            f.slug     AS facility_slug
     FROM bookings       AS b
     JOIN users         AS u ON b.user_id     = u.id
     JOIN facilities    AS f ON b.facility_id = f.id
     WHERE b.status = 'occupied'
       AND b.end_time > $1
     ORDER BY b.start_time`,
    [now]
  );
  return result.rows;
}
