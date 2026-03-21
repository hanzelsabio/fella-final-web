import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_FOLDERS = new Set([
  "general",
  "about",
  "hero",
  "works",
  "services",
  "categories",
  "products",
  "inventory",
]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadImage = async (req, res) => {
  try {
    const { image, folder } = req.body;
    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "No image provided" });

    const safeFolder = ALLOWED_FOLDERS.has(folder) ? folder : "general";

    if (!image.startsWith("data:image"))
      return res
        .status(400)
        .json({ success: false, message: "Invalid image format" });

    const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3)
      return res
        .status(400)
        .json({ success: false, message: "Invalid image data" });

    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === "jpeg" ? "jpg" : rawExt;
    if (!ALLOWED_EXTENSIONS.has(ext))
      return res.status(400).json({
        success: false,
        message: "Unsupported image type. Use JPG, PNG, GIF, or WebP.",
      });

    const buffer = Buffer.from(matches[2], "base64");
    if (buffer.length > MAX_FILE_SIZE)
      return res
        .status(400)
        .json({ success: false, message: "File exceeds 5MB limit" });

    const uploadDir = path.join(__dirname, "..", "uploads", safeFolder);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: { url: `/uploads/${safeFolder}/${filename}` },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl)
      return res
        .status(400)
        .json({ success: false, message: "No image URL provided" });

    if (!imageUrl.startsWith("/uploads/"))
      return res
        .status(400)
        .json({ success: false, message: "Invalid image URL" });

    const uploadsRoot = path.resolve(__dirname, "..", "uploads");
    const fullPath = path.resolve(__dirname, "..", imageUrl.slice(1));

    if (!fullPath.startsWith(uploadsRoot))
      return res
        .status(400)
        .json({ success: false, message: "Invalid image path" });

    if (!fs.existsSync(fullPath))
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });

    fs.unlinkSync(fullPath);
    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
};
