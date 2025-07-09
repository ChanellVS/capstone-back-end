import { verifyToken } from "../middleware/auth.js";
import express from "express";
import { savePets, getSavedPetByUserId, deleteSavedPet } from "../db/queries/saved_pets.js";

const router = express.Router();

// Save a pet
router.post