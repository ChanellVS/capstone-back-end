import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createUser, getUserByUsername, getUserById } from '../db/queries/users.js';
import { verifyToken, newUserCheck } from '../middleware/auth.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// POST /api/users/register
router.post('/register', newUserCheck, async (req, res, next) => {
  const { username, email, password, location, phone_number } = req.body;

  try {
    const user = await createUser({ username, email, password, location, phone_number });
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });

    console.log(`✅ Registered user: ${username}`);
    res.json({ token });
  } catch (err) {
    next(err);
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

    console.log(`🔓 User logged in: ${username}`);
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

export default router;