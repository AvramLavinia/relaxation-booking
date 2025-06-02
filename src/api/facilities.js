// src/api/facilities.js
import { API_URL } from './auth';

export async function fetchFacilities() {
  const token = localStorage.getItem('rb_token');
  const resp = await fetch(`${API_URL}/facilities`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!resp.ok) {
    throw new Error('Failed to fetch facilities');
  }
  const data = await resp.json();
  return data.facilities; // array of { id, slug, name, icon }
}
