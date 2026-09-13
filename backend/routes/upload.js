const express = require("express");
const cloudinary = require("../config/cloudinary");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// POST /api/upload
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { image } = req.body; // Expect base64 or image URL string
    if (!image) {
      return res.status(400).json({ error: "image data (base64 or URL) is required." });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({ error: "Cloudinary credentials are not configured on the backend." });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "travelgenie",
    });

    return res.json({
      message: "Image uploaded successfully",
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (err) {
    console.error("[Upload Error]:", err);
    return res.status(500).json({ error: "Image upload failed." });
  }
});

module.exports = router;
