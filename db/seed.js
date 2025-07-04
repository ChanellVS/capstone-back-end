import db from './client.js';
import { createUser } from './queries/users.js';
import { createPet } from './queries/pets.js';
import { createMessage } from './queries/messages.js';

const seed = async () => {
  try {
    await db.connect();

    // 1. Seed Users
    const user1 = await createUser({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      location: 'New York',
      phone_number: '123-456-7890',
    });

    const user2 = await createUser({
      username: 'bob',
      email: 'bob@example.com',
      password: 'securepass',
      location: 'Los Angeles',
      phone_number: '987-654-3210',
    });

    // 2. Seed Pets
    const pet1 = await createPet({
      name: 'Buddy',
      type: 'Dog',
      status: 'Lost',
      description: 'Friendly golden retriever',
      location: 'Redding, CA',
      owner_id: user1.id,
    });

    // 3. Seed Messages
    await createMessage({
      sender_id: user1.id,
      receiver_id: user2.id,
      pet_id: pet1.id,
      content: 'Hey, I think I saw your pet near the park!',
    });

    await createMessage({
      sender_id: user2.id,
      receiver_id: user1.id,
      pet_id: pet1.id,
      content: 'Thank you, can you tell me more?',
    });

    console.log('✅ Seeding completed successfully!');
    await db.end();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    await db.end();
  }
};

seed();
