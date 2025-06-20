// backend/src/models/user.js
import db from '../db/index.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function findByEmail(email) {
  const result = await db.query(
    'SELECT id, email, password_hash, display_name FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

export async function createUser({ email, password, display_name }) {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await db.query(
    `INSERT INTO users (email, password_hash, display_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, display_name`,
    [email, password_hash, display_name]
  );
  return result.rows[0];
}

export async function validatePassword(email, plainPassword) {
  const user = await findByEmail(email);
  if (!user) return false;
  const match = await bcrypt.compare(plainPassword, user.password_hash);
  return match ? user : false;
}