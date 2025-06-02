// src/api/bookings.js
import { API_URL } from './auth';

export async function bookFacility(facilitySlug, durationMin) {
  const token = localStorage.getItem('rb_token');
  const resp = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ facilitySlug, durationMin })
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || 'Booking failed');
  }
  return resp.json(); // { booking }
}

export async function fetchActiveBookings() {
  const token = localStorage.getItem('rb_token');
  const resp = await fetch(`${API_URL}/bookings/active`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!resp.ok) {
    throw new Error('Failed to fetch active bookings');
  }
  const data = await resp.json();
  return data.active; // array of bookings
}
