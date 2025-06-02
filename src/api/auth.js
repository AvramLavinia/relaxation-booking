// src/api/auth.js
export const API_URL = 'http://localhost:5000/api';

export async function signUp({ email, password, displayName }) {
  const resp = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      display_name: displayName
    })
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || 'Failed to register');
  }
  return resp.json(); // { token, user }
}

export async function logIn({ email, password }) {
  const resp = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || 'Login failed');
  }
  return resp.json(); // { token, user }
}
