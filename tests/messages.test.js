import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app.js';
import db from '../db/client.js';

// Dummy JWT token for testing protected routes (replace with a valid one if needed)
const testToken = jwt.sign({ id: 1, username: 'alice' }, process.env.JWT_SECRET);

let createdMessageId;

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.end();
}, 20000);

describe('POST /api/messages', () => {
  it('returns 400 when required fields are missing', async () => {
    const response = await request(app).post('/api/messages').send({});
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("All fields are required");
  });

  it('creates a new message successfully', async () => {
    const response = await request(app).post('/api/messages').send({
      sender_id: 1,
      receiver_id: 2,
      pet_id: 1,
      content: 'Test message content'
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.content).toBe('Test message content');
    createdMessageId = response.body.id;
  });
});

describe('GET /api/messages/pet/:id', () => {
  it('fetches messages for a given pet', async () => {
    const response = await request(app)
      .get('/api/messages/pet/3')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('GET /api/messages/inbox', () => {
  it('returns inbox for authorized user', async () => {
    const response = await request(app)
      .get('/api/messages/inbox')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('PUT /api/messages/:id', () => {
  it('updates an existing message', async () => {
    const response = await request(app)
      .put(`/api/messages/${createdMessageId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ content: 'Updated message content' });

    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe('Updated message content');
  });
});

describe('DELETE /api/messages/:id', () => {
  it('deletes a message by ID', async () => {
    const response = await request(app)
      .delete(`/api/messages/${createdMessageId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Message deleted successfully');
  });
});

