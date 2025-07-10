import express from 'express';
import { verifyToken } from "../middleware/auth.js";
import { getMessagesByPetId, getMessagesByUserId, createMessage, updateMessage, deleteMessage } from '../db/queries/messages.js';

const router = express.Router();

router.post("/", async (req, res, next) => {
    //const senderId = req.user?.id || req.body.sender_id; // for testing when removing the verifytoken

    const senderId = req.user.id;
    const { receiver_id, pet_id, content } = req.body;

    if (!receiver_id || !pet_id || !content) {
        return res.status(400).json({error: "All fields are required"});
    }
    try {
        const newMessage = await createMessage({sender_id: senderId, receiver_id, pet_id, content})
        
        req.app.get("io")?.emit("receive_message", newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error)
        res.status(500).json({error: "Failed to send message."});
    }
});

router.get("/pet/:id", verifyToken, async (req, res, next) => {
    const petId = req.params.id;

    try {
        const messages = await getMessagesByPetId(petId)
        res.json(messages);
    } catch (error) {
        console.error('Failed to get messages by pet:', error);
        res.status(500).json({error: "Something went wrong."});
    }
});

router.get("/inbox", verifyToken, async (req, res, next) => {
    const userId = req.user.id;

    try {
        const inbox = await getMessagesByUserId(userId)
        res.json(inbox);
    } catch (error) {
        console.error('Failed to get inbox:', error);
        res.status(500).json({error: 'Something went wrong.'});
    }
});

router.put("/:id", verifyToken, async (req, res, next) => {
    const messageId = req.params.id;
    const {content} = req.body;

    try{
        const updated = await updateMessage(messageId, req.user.id, content);
        if (!updated) {
            return res.status(403).json({error: 'Unauthorized or message not found'});
        }
        res.json(updated);
    } catch (error) {
        console.error('Failed to update message:', error);
        res.status(500).json({error: 'Something went wrong'});
    }
});

router.delete("/:id", verifyToken, async (req, res, next) => {
    const messageId = req.params.id;

    try{
        const deleted = await deleteMessage(messageId, req.user.id);
        if (!deleted) {
            return res.status(403).json({error: 'Unauthorized or message not found'});
        }
        res.json({message: 'Message deleted successfully'});
    } catch (error) {
        console.error('Failed to delete message:', error);
        res.status(500).json({error: 'Something went wrong'});
    }    
});

export default router;
