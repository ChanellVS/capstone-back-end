import db from '../client.js';

export async function getAllPets() {
    const result = await db.query(`
        SELECT * FROM pets
        ORDER BY created_at DESC;
    `);
    return result.rows;
}

export async function createPet({ name, type, status, description, image_url, lat, lng, location, owner_id }) {
    const result = await db.query(`
        INSERT INTO pets (name, type, status, description, image_url, lat, lng, location, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `, [name, type, status, description, image_url, lat, lng, location, owner_id]);

    return result.rows[0];
}

export async function getPetsByCity(city) {
    const result = await db.query(
        `SELECT *
         FROM pets
         WHERE location ILIKE $1`,
        [`%${city}%`]
    );
    return result.rows;
}

export async function getPetById(id) {
  const result = await db.query(
    `SELECT * 
       FROM pets 
      WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function updatePet(id, owner_id, updates) {
  const { name, type, status, description, image_url, location } = updates;

  const result = await db.query(`
    UPDATE pets
    SET name = $1, type = $2, status = $3, description = $4,
        image_url = $5, location = $6, updated_at = NOW()
    WHERE id = $7 AND owner_id = $8
    RETURNING *;
  `, [name, type, status, description, image_url, location, id, owner_id]);

  return result.rows[0];
}

export async function deletePet(id, owner_id) {
  const result = await db.query(`
    DELETE FROM pets WHERE id = $1 AND owner_id = $2 RETURNING *;
  `, [id, owner_id]);

  return result.rows[0];
}
