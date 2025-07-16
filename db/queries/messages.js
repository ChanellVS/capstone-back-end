import db from "../client.js";

/** Create a new message (global or private) and return it with full join info */
export async function createMessage({
  sender_id,
  receiver_id = null,
  pet_id = null,
  content,
  is_global = false
}) {
  // Insert and grab the new id
  const insert = await db.query(
    `INSERT INTO messages (sender_id, receiver_id, pet_id, content, is_global)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id;`,
    [sender_id, receiver_id, pet_id, content, is_global]
  );
  const messageId = insert.rows[0].id;

  // Fetch the message again joined with user and pet data
  const result = await db.query(
    `SELECT  m.*,
            s.username AS sender_username,
            r.username AS receiver_username,
            p.name     AS pet_name
     FROM    messages m
     JOIN    users   s ON m.sender_id   = s.id
     LEFT JOIN users r ON m.receiver_id = r.id
     LEFT JOIN pets  p ON m.pet_id      = p.id
     WHERE   m.id = $1;`,
    [messageId]
  );
  return result.rows[0];
}

/** Messages for a specific pet (non-global) */
export async function getMessagesByPetId(pet_id) {
  const result = await db.query(
    `SELECT  m.*,
            s.username AS sender_username,
            r.username AS receiver_username,
            p.name     AS pet_name
     FROM    messages m
     JOIN    users   s ON m.sender_id   = s.id
     LEFT JOIN users r ON m.receiver_id = r.id
     LEFT JOIN pets  p ON m.pet_id      = p.id
     WHERE   m.pet_id = $1
       AND   m.is_global = FALSE
     ORDER BY m.created_at DESC;`,
    [pet_id]
  );
  return result.rows;
}

/** Inbox for one user: sent, received, plus globals */
export async function getMessagesByUserId(user_id) {
  const result = await db.query(
    `SELECT  m.*,
            s.username AS sender_username,
            r.username AS receiver_username,
            p.name     AS pet_name,
            CASE
              WHEN m.sender_id = $1 THEN 'sent'
              ELSE 'received'
            END AS direction
     FROM    messages m
     JOIN    users   s ON m.sender_id   = s.id
     LEFT JOIN users r ON m.receiver_id = r.id
     LEFT JOIN pets  p ON m.pet_id      = p.id
     WHERE   m.sender_id   = $1
        OR   m.receiver_id = $1
        OR   m.is_global   = TRUE
     ORDER BY m.created_at DESC;`,
    [user_id]
  );
  return result.rows;
}

/** Update a message (sender only) and return full join info */
export async function updateMessage(messageId, senderId, content) {
  await db.query(
    `UPDATE messages
     SET content = $1,
         updated_at = NOW()
     WHERE id = $2
       AND sender_id = $3;`,
    [content, messageId, senderId]
  );

  const result = await db.query(
    `SELECT  m.*,
            s.username AS sender_username,
            r.username AS receiver_username,
            p.name     AS pet_name
     FROM    messages m
     JOIN    users   s ON m.sender_id   = s.id
     LEFT JOIN users r ON m.receiver_id = r.id
     LEFT JOIN pets  p ON m.pet_id      = p.id
     WHERE   m.id = $1
       AND   m.sender_id = $2;`,
    [messageId, senderId]
  );
  return result.rows[0];
}

/** Delete a message (sender only) */
export async function deleteMessage(messageId, senderId) {
  const result = await db.query(
    `DELETE FROM messages
     WHERE id = $1
       AND sender_id = $2
     RETURNING *;`,
    [messageId, senderId]
  );
  return result.rows[0];
}

/** All global messages with sender and pet name */
export async function getGlobalMessages() {
  const result = await db.query(
    `SELECT  m.*,
            s.username AS sender_username,
            p.name     AS pet_name
     FROM    messages m
     JOIN    users   s ON m.sender_id = s.id
     LEFT JOIN pets  p ON m.pet_id    = p.id
     WHERE   m.is_global = TRUE
     ORDER BY m.created_at DESC;`
  );
  return result.rows;
}