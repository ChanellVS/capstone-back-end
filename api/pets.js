import { verifyToken } from '../middleware/auth.js';
import { createPet, getPetsByCity, getAllPets, deletePet, updatePet } from '../db/queries/pets.js';
import { savePets, deleteSavedPet } from '../db/queries/saved_pets.js';
import { geocodeAddress } from '../utils/geocode.js';
import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
    const { city } = req.query;

    try {
        let pets;
        if (city) {
            pets = await getPetsByCity(city);
        } else {
            // Optional: fetch all pets if no city specified
            pets = await getAllPets();
        }
        res.json(pets);
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { name, type, status, description, image_url, location } = req.body;
    const owner_id = req.user.id;

    try {
        console.log("About to geocode:", location);
        const { lat, lng } = await geocodeAddress(location);
        console.log("Got geocode:", lat, lng);

        const newPet = await createPet({
            name,
            type,
            status,
            description,
            image_url,
            location,
            lat,
            lng,
            owner_id,
        });

        res.status(201).json(newPet);
    } catch (error) {
        console.error('Error creating pet:', error);
        res.status(500).json({ error: 'Failed to create pet.' });
    }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await getPetById(id);

    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    res.json(pet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const owner_id = req.user.id;

  try {
    const pet = await updatePet(id, owner_id, updates);

    if (!pet) return res.status(403).json({ error: 'Unauthorized or pet not found' });

    res.json(pet);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Failed to update pet.' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const owner_id = req.user.id;

  try {
    const deleted = await deletePet(id, owner_id);

    if (!deleted) return res.status(403).json({ error: 'Unauthorized or pet not found' });

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ error: 'Failed to delete pet.' });
  }
});

// -------------------------------------------------------------------------------------------
// Saved Pets Routes

router.post("/:id/save", verifyToken, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const savedPet = await savePets({
            user_id,
            pet_id: id,
            saved_at: new Date().toISOString(),
        });

        res.status(201).json(savedPet);
    } catch (error) {
        console.error('Error saving pet:', error);
        res.status(500).json({ error: 'Failed to save pet.' });
    }
});

router.delete("/:id/save", verifyToken, async (req, res) => {
const { id } = req.params;
const user_id = req.user.id;

try {
    const deletedPet = await deleteSavedPet({ user_id, pet_id: id });

    if (!deletedPet) return res.status(404).json({ error: 'Saved pet not found' });

    res.json({ message: 'Pet removed from saved list successfully' });
} catch (error) {
    console.error('Error removing saved pet:', error);
    res.status(500).json({ error: 'Failed to remove saved pet.' });
}});


export default router;