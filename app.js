import db from "./db/client.js";
db.connect();
db.tenv.config();

import messagesRouter from './api/messages.js';
import userRouter from './api/users.js'
import cors from 'cors';
import express from 'express';

const app = express();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    next();
});

app.use('/api/messages', messagesRouter);
app.use('/api/users',userRouter);

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send('Internal server error.')
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});