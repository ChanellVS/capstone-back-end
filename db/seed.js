import db from './client.js';
import { createUser } from './queries/users.js';
import { createMessage } from './queries/messages.js';

const seedUsers = async () => {
  console.log('Seeding users...');

  await createUser({
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123',
    location: 'New York',
    phone_number: '123-456-7890',
  });

  await createUser({
    username: 'bob',
    email: 'bob@example.com',
    password: 'securepass',
    location: 'Los Angeles',
    phone_number: '987-654-3210',
  });
};

const seedMessages = async () => {
  console.log('Seeding messages...');

  const messages = [
    {
      sender_id: 1,
      receiver_id: 2,
      pet_id: 1,
      content: "Hey, I think I saw your pet near the park!"
    },
    {
      sender_id: 2,
      receiver_id: 1,
      pet_id: 1,
      content: "Thank you, can you tell me more?"
    },
  ];

  for (let message of messages) {
    await createMessage(message);
  }
};

const finalSeed = async () => {
  await db.connect();

  await seedUsers();
  await seedMessages();

 

  await db.end();
};

finalSeed();