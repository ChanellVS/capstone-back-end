import db from "../client.js";

// Adds pet to saved_pets table
export async function savePets({user_id, pet_id, saved_at}){
    const result = await db.query(`
        INSERT INTO saved_pets (user_id, pet_id, saved_at)
        VALUES ($1, $2, $3)
        RETURNING *;
        `, [user_id, pet_id, saved_at]);
        return result.rows[0]
}

// Retrieves all saved pets for a user
export async function getSavedPetByUserId({user_id}){
const results = await db.query(`
    SELECT * FROM saved_pets WHERE user_id = $1 ORDER BY saved_at DESC;
`, [user_id]);
return results.rows[0];
}

// Deletes a saved pet from the saved_pets table
export async function deleteSavedPet({user_id, pet_id}){
    const result = await db.query(`
        DELETE FROM saved_pets WHERE user_id = $1 AND pet_id= $2 RETURNING *;
        `, [user_id, pet_id]);
        return result.rows[0];
}