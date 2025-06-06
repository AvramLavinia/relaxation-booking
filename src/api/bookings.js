// src/api/bookings.js
import { API_URL } from './auth';

export async function bookFacility({ facilitySlug, start, durationMin }) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ facilitySlug, start, durationMin }),
  });
  if (resp.status === 401 || resp.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
    throw new Error("Session expired. Please log in again.");
  }
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || 'Booking failed');
  }
  return resp.json();
}

export async function fetchActiveBookings() {
  const resp = await fetch(`${API_URL}/bookings/active`);
  if (!resp.ok) {
    throw new Error('Failed to fetch active bookings');
  }
  const data = await resp.json();
  return data.active;
}
