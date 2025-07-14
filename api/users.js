import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/client.js';

import { createUser, getUserByUsername, getUserById } from '../db/queries/users.js';
import { getSavedPetByUserId } from '../db/queries/saved_pets.js';
import { verifyToken, newUserCheck } from '../middleware/auth.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// POST /api/users/register
router.post('/register', newUserCheck, async (req, res, next) => {
  console.log("Received registration request:", req.body); 
  const { username, email, password, location, phone_number } = req.body;

  try {
    const user = await createUser({ username, email, password, location, phone_number });
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });

    console.log(`Registered user: ${username}`);
    res.json({ token });
  } catch (err) {
 console.error("Error during registration:", err);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });

    console.log(`User logged in: ${username}`);
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/me
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/users
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, username FROM users WHERE id != $1;`,
      [req.user.id] // exclude current user
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// -----------------------------------------------------------------------------------------------
// Saved Pets Routes

// GET /api/users/saved
router.get('/saved', verifyToken, async (req, res, next) => {
  try {
    const savedPets = await getSavedPetByUserId( { user_id: req.user.id });
    res.json(savedPets);
  } catch (err) {
    next(err);
  }
});
export default router;