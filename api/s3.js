// routes/s3Routes.js
import express from 'express';
import { getSignedUrlUpload } from '../utils/s3.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post("/sign-url", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    return res.status(400).json({ error: "Missing fileName or fileType" });
  }

  try {
    const url = await getSignedUrlUpload(fileName, fileType);
    res.json({
      signedUrl: url,
      publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
    });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

export default router;