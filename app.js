import db from "./db/client.js";
db.connect();

import messagesRouter from './api/messages.js';
import cors from 'cors';
import express from 'express';

const app = express();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    next();
});

app.use('/api/messages', messagesRouter);

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send('Internal server error.')
});
