import db from '../client.js';

//Get all pets including owner info
export async function getAllPets() {
    const result = await db.query(`
        SELECT pets.*, 
               users.username AS owner_username, 
               users.email AS owner_email
        FROM pets
        JOIN users ON pets.owner_id = users.id
        ORDER BY pets.created_at DESC;
    `);
    return result.rows;
}

//Create a new pet
export async function createPet({ name, type, status, description, image_url, lat, lng, location, owner_id }) {
    const result = await db.query(`
        INSERT INTO pets (name, type, status, description, image_url, lat, lng, location, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `, [name, type, status, description, image_url, lat, lng, location, owner_id]);

    return result.rows[0];
}

//Get pets by city (with owner info)
export async function getPetsByCity(city) {
    const result = await db.query(`
        SELECT pets.*, 
               users.username AS owner_username, 
               users.email AS owner_email
        FROM pets
        JOIN users ON pets.owner_id = users.id
        WHERE pets.location ILIKE $1
        ORDER BY pets.created_at DESC;
    `, [`%${city}%`]);

    return result.rows;
}

//Get single pet by ID (with owner info)
export async function getPetById(id) {
    const result = await db.query(`
        SELECT pets.*, 
               users.username AS owner_username, 
               users.email AS owner_email
        FROM pets
        JOIN users ON pets.owner_id = users.id
        WHERE pets.id = $1;
    `, [id]);

    return result.rows[0] || null;
}

//Update pet dynamically
export async function updatePet(id, owner_id, updates) {
    if (!updates || Object.keys(updates).length === 0) return null;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const query = `
        UPDATE pets
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${fields.length + 1} AND owner_id = $${fields.length + 2}
        RETURNING *;
    `;

    const result = await db.query(query, [...values, id, owner_id]);
    return result.rows[0];
}

//Delete pet
export async function deletePet(id, owner_id) {
    const result = await db.query(`
        DELETE FROM pets 
        WHERE id = $1 AND owner_id = $2 
        RETURNING *;
    `, [id, owner_id]);

    return result.rows[0];
}