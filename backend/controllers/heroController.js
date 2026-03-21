import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateSlideId = async () => {
  const [rows] = await db.execute(
    "SELECT slide_id FROM hero_slides ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "SLD-001";
  const num = parseInt(rows[0].slide_id.replace("SLD-", "")) + 1;
  return `SLD-${String(num).padStart(3, "0")}`;
};

export const getAllSlides = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const getActiveSlides = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM hero_slides WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const createSlide = asyncHandler(async (req, res) => {
  const { image, heading, subheading, cta_text, cta_link, sort_order } =
    req.body;
  if (!image)
    return res
      .status(400)
      .json({ success: false, message: "Image is required" });

  const slide_id = await generateSlideId();
  const [result] = await db.execute(
    "INSERT INTO hero_slides (slide_id, image, heading, subheading, cta_text, cta_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      slide_id,
      image,
      heading || null,
      subheading || null,
      cta_text || null,
      cta_link || null,
      sort_order || 0,
    ],
  );
  res.status(201).json({
    success: true,
    message: "Slide created successfully",
    data: { id: result.insertId, slide_id },
  });
});

export const updateSlide = asyncHandler(async (req, res) => {
  const { image, heading, subheading, cta_text, cta_link, sort_order } =
    req.body;
  if (!image)
    return res
      .status(400)
      .json({ success: false, message: "Image is required" });

  const [result] = await db.execute(
    "UPDATE hero_slides SET image = ?, heading = ?, subheading = ?, cta_text = ?, cta_link = ?, sort_order = ? WHERE id = ?",
    [
      image,
      heading || null,
      subheading || null,
      cta_text || null,
      cta_link || null,
      sort_order || 0,
      req.params.id,
    ],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Slide not found" });
  res.json({ success: true, message: "Slide updated successfully" });
});

export const deleteSlide = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM hero_slides WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Slide not found" });
  res.json({ success: true, message: "Slide deleted successfully" });
});

export const archiveSlide = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE hero_slides SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Slide not found" });
  res.json({ success: true, message: "Slide archived successfully" });
});

export const restoreSlide = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE hero_slides SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Slide not found" });
  res.json({ success: true, message: "Slide restored successfully" });
});
