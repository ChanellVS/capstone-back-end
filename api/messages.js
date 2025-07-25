import express from 'express';
import { verifyToken } from "../middleware/auth.js";
import {
  getMessagesByPetId,
  getMessagesByUserId,
  createMessage,
  updateMessage,
  deleteMessage,
  getGlobalMessages
} from '../db/queries/messages.js';

const router = express.Router();

//GET global messages (no token required for read)
router.get("/global", async (req, res) => {
  try {
    const globalMessages = await getGlobalMessages();
    res.json(globalMessages);
  } catch (error) {
    console.error("Failed to fetch global messages:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

//POST a new message (global or private)
router.post("/", verifyToken, async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, pet_id, content, is_global = false } = req.body;

  const isGlobal = is_global === true || is_global === "true";

  if (!content) {
    return res.status(400).json({ error: "Message content is required." });
  }

  if (!isGlobal && (!receiver_id || !pet_id)) {
    return res.status(400).json({ error: "receiver_id and pet_id are required for private messages." });
  }

  try {
    const newMessage = await createMessage({
      sender_id: senderId,
      receiver_id: isGlobal ? null : receiver_id,
      pet_id: isGlobal ? null : pet_id,
      content,
      is_global: isGlobal
    });

    req.app.get("io")?.emit("receive_message", newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Message creation failed:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

//GET inbox (messages for current user)
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const inbox = await getMessagesByUserId(req.user.id);
    res.json(inbox);
  } catch (error) {
    console.error("Failed to get inbox:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

//GET all messages for a pet
router.get("/pet/:id", verifyToken, async (req, res) => {
  try {
    const messages = await getMessagesByPetId(req.params.id);
    res.json(messages);
  } catch (error) {
    console.error("Failed to get messages by pet:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

//PUT edit a message
router.put("/:id", verifyToken, async (req, res) => {
  const { content } = req.body;

  try {
    const updated = await updateMessage(req.params.id, req.user.id, content);
    if (!updated) {
      return res.status(403).json({ error: "Unauthorized or message not found." });
    }
    res.json(updated);
  } catch (error) {
    console.error("Failed to update message:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

//DELETE a message
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await deleteMessage(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(403).json({ error: "Unauthorized or message not found." });
    }
    res.json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Failed to delete message:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;