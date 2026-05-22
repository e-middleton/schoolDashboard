import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  // ADD THIS LINE BELOW TO STOP AUTOMATIC CRC32 CHECKSUMS
  requestChecksumCalculation: "WHEN_REQUIRED" 
});

// get a temp signed url to upload images to aws
app.post("/generate-upload-url", async (req, res) => {
  const { fileName, fileType } = req.body;
  const fileKey = `profiles/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  res.json({ uploadUrl, fileKey });
});

// get a temp signed url to view images uploaded to aws
app.post("/get-view-url", async (req, res) => {
  const { fileKey } = req.body; // e.g., "profiles/1779395269151-vanGogh.png"

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileKey,
    });

    // Generate a signed URL valid for 1 hour (3600 seconds)
    const viewUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    res.json({ viewUrl });
  } catch (error) {
    console.error("Backend S3 signing crash:", error); 
    res.status(500).json({ error: "Failed to generate view URL" });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});