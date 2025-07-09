// src/api/facilities.js (no auth header for testing)
import { API_URL } from './auth';

export async function fetchFacilities() {
  const resp = await fetch(`${API_URL}/facilities`);
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error('Failed to fetch facilities');
  }
  const data = await resp.json();
  return data.facilities;
}