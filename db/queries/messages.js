import db from "../client.js";

// Create a new message (supports global or private)
export async function createMessage({
  sender_id,
  receiver_id = null,
  pet_id = null,
  content,
  is_global = false
}) {
  const result = await db.query(
    `INSERT INTO messages (sender_id, receiver_id, pet_id, content, is_global)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *;`,
    [sender_id, receiver_id, pet_id, content, is_global]
  );
  return result.rows[0];
}

// Get messages related to a specific pet (non-global)
export async function getMessagesByPetId(pet_id) {
  const result = await db.query(
    `SELECT messages.*,
            sender.username AS sender_username,
            receiver.username AS receiver_username
     FROM messages
     JOIN users AS sender ON messages.sender_id = sender.id
     LEFT JOIN users AS receiver ON messages.receiver_id = receiver.id
     WHERE messages.pet_id = $1 AND is_global = FALSE
     ORDER BY messages.created_at DESC;`,
    [pet_id]
  );
  return result.rows;
}

// Get all messages for a specific user (sent, received, and global)
export async function getMessagesByUserId(user_id) {
  const result = await db.query(
    `SELECT messages.*,
            sender.username AS sender_username,
            receiver.username AS receiver_username,
            CASE
              WHEN messages.sender_id = $1 THEN 'sent'
              ELSE 'received'
            END AS direction
     FROM messages
     JOIN users AS sender ON messages.sender_id = sender.id
     LEFT JOIN users AS receiver ON messages.receiver_id = receiver.id
     WHERE messages.sender_id = $1
        OR messages.receiver_id = $1
        OR is_global = TRUE
     ORDER BY messages.created_at DESC;`,
    [user_id]
  );
  return result.rows;
}

// Update a message (only if user is sender)
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

// Delete a message (only if user is sender)
export async function deleteMessage(messageId, senderId) {
  const result = await db.query(
    `DELETE FROM messages
     WHERE id = $1 AND sender_id = $2
     RETURNING *;`,
    [messageId, senderId]
  );
  return result.rows[0];
}

// Fetch all global messages (optional)
export async function getGlobalMessages() {
  const result = await db.query(
    `SELECT messages.*,
            sender.username AS sender_username
     FROM messages
     JOIN users AS sender ON messages.sender_id = sender.id
     WHERE is_global = TRUE
     ORDER BY created_at DESC;`
  );
  return result.rows;
}
