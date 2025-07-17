import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import s3Routes from './api/s3.js';
import messagesRouter from './api/messages.js';
import userRouter from './api/users.js';
import petsRouter from './api/pets.js';
import geocodeRouter from './utils/geocode.js';

dotenv.config();

const app = express();

// Debugging mapbox token (can remove if not needed)
console.log("Mapbox Token:", process.env.MAPBOX_TOKEN);

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/messages', messagesRouter);
app.use('/api/users', userRouter);
app.use('/api/pets', petsRouter);
app.use('/api/geocode', geocodeRouter);
app.use('/api/s3', s3Routes); 

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal server error.');
});

export default app;