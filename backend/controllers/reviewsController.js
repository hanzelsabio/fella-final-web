import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateReviewId = async () => {
  const [rows] = await db.execute(
    "SELECT review_id FROM reviews ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "REV-001";
  const num = parseInt(rows[0].review_id.replace("REV-", "")) + 1;
  return `REV-${String(num).padStart(3, "0")}`;
};

export const getAllReviews = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM reviews ORDER BY created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const getActiveReviews = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM reviews WHERE status = 'active' ORDER BY created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const createReview = asyncHandler(async (req, res) => {
  const { name, text, rating } = req.body;
  if (!name?.trim() || !text?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Name and text are required" });

  const review_id = await generateReviewId();
  const [result] = await db.execute(
    "INSERT INTO reviews (review_id, name, text, rating) VALUES (?, ?, ?, ?)",
    [review_id, name.trim(), text.trim(), rating || 5],
  );
  res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: { id: result.insertId, review_id },
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const { name, text, rating } = req.body;
  if (!name?.trim() || !text?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Name and text are required" });

  const [result] = await db.execute(
    "UPDATE reviews SET name = ?, text = ?, rating = ? WHERE id = ?",
    [name.trim(), text.trim(), rating || 5, req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  res.json({ success: true, message: "Review updated successfully" });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM reviews WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  res.json({ success: true, message: "Review deleted successfully" });
});

export const archiveReview = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE reviews SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  res.json({ success: true, message: "Review archived successfully" });
});

export const restoreReview = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE reviews SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  res.json({ success: true, message: "Review restored successfully" });
});

export const getReviewsSettings = asyncHandler(async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM reviews_settings LIMIT 1");
  res.json({ success: true, data: rows[0] || { heading: "", subheading: "" } });
});

export const updateReviewsSettings = asyncHandler(async (req, res) => {
  const { heading, subheading } = req.body;
  if (!heading?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Heading is required" });

  const [existing] = await db.execute(
    "SELECT id FROM reviews_settings LIMIT 1",
  );
  if (existing.length > 0) {
    await db.execute(
      "UPDATE reviews_settings SET heading = ?, subheading = ? WHERE id = ?",
      [heading.trim(), subheading || null, existing[0].id],
    );
  } else {
    await db.execute(
      "INSERT INTO reviews_settings (heading, subheading) VALUES (?, ?)",
      [heading.trim(), subheading || null],
    );
  }
  res.json({ success: true, message: "Settings updated successfully" });
});
