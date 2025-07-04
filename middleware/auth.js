import jwt from 'jsonwebtoken';
import db from '../db/client.js';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';


export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Authorization header required" });

  const token = authHeader.replace('Bearer ', '');
  try {
    const user = jwt.verify(token, SECRET);
    req.user = user; 
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}


export async function newUserCheck(req, res, next) {
  const { username } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      return res.status(409).json({ error: "This username already exists" });
    }
    next();
  } catch (err) {
    next(err);
  }
}