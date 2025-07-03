import db from "../client.js";

export async function createMessage({sender_id, receiver_id, pet_id, content}) {
    const result = await db.query(
        `INSERT INTO messages (sender_id, receiver_id, pet_id, content)
    VALUES ($1, $2, $3, $4)
    RETURNING *;`,
        [sender_id, receiver_id, pet_id, content]
    );
    return result.rows[0];
}

export async function getMessagesByPetId(pet_id) {
    const result = await db.query(
        `SELECT messages.*,
            sender.username AS sender_username,
            receiver.username AS receiver_username
        FROM messages
        JOIN users AS sender ON messages.sender_id = sender.id
        JOIN users AS receiver ON messages.receiver_id = receiver.id
        WHERE messages.pet_id = $1
        ORDER BY messages.created_at DESC;`,
        [pet_id]
    );
    return result.rows;
}

export async function getMessagesByUserId(user_id) {
    const result = await db.query(
        `SELECT messages.*,
            sender.username AS sender_username,
            receiver.username AS receiver_username
        FROM messages
        JOIN users AS sender ON messages.sender_id = sender.id
        JOIN users AS receiver ON messages.receiver_id = receiver.id
        WHERE messages.receiver_id = $1
        ORDER BY messages.created_at DESC;`,
        [user_id]
    );
    return result.rows;
}

export async function updateMessage(messageId, senderId, content) {
    const result = await db.query(
        `UPDATE messages
        SET content = $1, updated_at = NOW()
        WHERE id = $2 AND sender_id = $3
        RETURNING *;`,
        [content, messageId, senderId]
    );
    return result.rows[0];
}

export async function deleteMessage(messageId, senderId) {
    const result = await db.query(
        `DELETE FROM messages
        WHERE id = $1 AND sender_id = $2
        RETURNING *;`,
        [messageId, senderId]
    );
    return result.rows[0];
}