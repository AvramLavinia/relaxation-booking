// src/api/auth.js
export const API_URL = 'http://localhost:5000/api';

export async function signUp({ email, password, displayName }) {
  const resp = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, displayName }),
  });
  if (resp.status === 401 || resp.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
    throw new Error("Session expired. Please log in again.");
  }
  if (!resp.ok) throw new Error((await resp.json()).error || "Registration failed");
  return resp.json();
}

export async function logIn({ email, password }) {
  const resp = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (resp.status === 401 || resp.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
    throw new Error("Session expired. Please log in again.");
  }
  if (!resp.ok) throw new Error((await resp.json()).error || "Login failed");
  return resp.json();
}

