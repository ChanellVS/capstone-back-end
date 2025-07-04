import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const geocodeRouter = express.Router();

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

export async function geocodeAddress(location) {
  try {
    const response = await geocodingClient
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();

    if (
      response &&
      response.body &&
      response.body.features &&
      response.body.features.length > 0
    ) {
      const [lng, lat] = response.body.features[0].center;
      return { lat, lng };
    } else {
      throw new Error('No geocoding result found');
    }
  } catch (error) {
    console.error('Geocoding error:', error); // <-- ADD THIS
    throw error;
  }
}

geocodeRouter.get('/:city/:state', async (req, res) => {
  const { city, state } = req.params;
  const location = `${city}, ${state}`;

  try {
    const coords = await geocodeAddress(location);
    res.json(coords);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Location not found' });
  }
});

export default geocodeRouter;
