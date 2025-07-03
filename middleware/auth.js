import jwt from 'jsonwebtoken';
import db from '../db/client';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function verifyToken() {}