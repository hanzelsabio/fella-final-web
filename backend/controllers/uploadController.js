import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = async (req, res) => {
  try {
    const { image, folder } = req.body; // folder can be 'services', 'categories', 'products'

    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided" });
    }

    // Check if it's a base64 image
    if (!image.startsWith("data:image")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid image format" });
    }

    // Extract the base64 data and extension
    const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid image data" });
    }

    const imageType = matches[1]; // png, jpeg, etc.
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(
      __dirname,
      "..",
      "uploads",
      folder || "general"
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${imageType}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, buffer);

    // Return the URL path
    const imageUrl = `/uploads/${folder || "general"}/${filename}`;

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: { url: imageUrl },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "No image URL provided" });
    }

    // Extract filepath from URL
    const filepath = path.join(__dirname, "..", imageUrl);

    // Check if file exists
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Image not found" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};
