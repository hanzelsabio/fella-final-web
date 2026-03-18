import db from "../config/database.js";

const generateReviewId = async () => {
  const [rows] = await db.query(
    "SELECT review_id FROM reviews ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "REV-001";
  const last = rows[0].review_id;
  const num = parseInt(last.replace("REV-", "")) + 1;
  return `REV-${String(num).padStart(3, "0")}`;
};

export const getAllReviews = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM reviews ORDER BY created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews" });
  }
};

export const getActiveReviews = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM reviews WHERE status = 'active' ORDER BY created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews" });
  }
};

export const createReview = async (req, res) => {
  try {
    const { name, text, rating } = req.body;
    if (!name?.trim() || !text?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Name and text are required" });

    const review_id = await generateReviewId();
    const [result] = await db.query(
      "INSERT INTO reviews (review_id, name, text, rating) VALUES (?, ?, ?, ?)",
      [review_id, name.trim(), text.trim(), rating || 5],
    );
    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: { id: result.insertId, review_id },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create review" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, text, rating } = req.body;
    if (!name?.trim() || !text?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Name and text are required" });

    const [result] = await db.query(
      "UPDATE reviews SET name = ?, text = ?, rating = ? WHERE id = ?",
      [name.trim(), text.trim(), rating || 5, id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res.json({ success: true, message: "Review updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update review" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete review" });
  }
};

export const archiveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE reviews SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res.json({ success: true, message: "Review archived successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to archive review" });
  }
};

export const restoreReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE reviews SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res.json({ success: true, message: "Review restored successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to restore review" });
  }
};

// ✅ Settings
export const getReviewsSettings = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reviews_settings LIMIT 1");
    res.json({
      success: true,
      data: rows[0] || { heading: "", subheading: "" },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch settings" });
  }
};

export const updateReviewsSettings = async (req, res) => {
  try {
    const { heading, subheading } = req.body;
    if (!heading?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Heading is required" });

    const [existing] = await db.query(
      "SELECT id FROM reviews_settings LIMIT 1",
    );
    if (existing.length > 0) {
      await db.query(
        "UPDATE reviews_settings SET heading = ?, subheading = ? WHERE id = ?",
        [heading.trim(), subheading || null, existing[0].id],
      );
    } else {
      await db.query(
        "INSERT INTO reviews_settings (heading, subheading) VALUES (?, ?)",
        [heading.trim(), subheading || null],
      );
    }
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update settings" });
  }
};
