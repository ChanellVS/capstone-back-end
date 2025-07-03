import db from "./client.js";

import { createMessage } from "./queries/messages.js";

const finalSeed = async () => {
    await db.connect();
    await seedMessages();
    await db.end();
}

async function seedMessages() {
    console.log('Seeding Messages...');

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
}

finalSeed();
