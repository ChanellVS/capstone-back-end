import db from '../client.js';
import bcrypt from 'bcrypt';

// Create a new user with hashed password
export async function createUser({ username, email, password, location, phone_number }) {
  const hashed = await bcrypt.hash(password, 10);

  const result = await db.query(
    `
    INSERT INTO users (username, email, password, location, phone_number)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (username) DO NOTHING
    RETURNING id, username;
    `,
    [username, email, hashed, location, phone_number]
  );

  if (result.rows.length > 0) {
    return result.rows[0];
  }

  // Fetch existing user if already present
  const fallback = await db.query(
    `SELECT id, username FROM users WHERE username = $1`,
    [username]
  );

  return fallback.rows[0];
}

// Get user by username
export async function getUserByUsername(username) {
  const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

// Get user by ID (excluding password)
export async function getUserById(id) {
  const result = await db.query(
    `SELECT id, username, email, location, phone_number FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}
