import db from "../config/database.js";

const generateSlideId = async () => {
  const [rows] = await db.query(
    "SELECT slide_id FROM hero_slides ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "SLD-001";
  const last = rows[0].slide_id;
  const num = parseInt(last.replace("SLD-", "")) + 1;
  return `SLD-${String(num).padStart(3, "0")}`;
};

export const getAllSlides = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch slides" });
  }
};

export const getActiveSlides = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM hero_slides WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch slides" });
  }
};

export const createSlide = async (req, res) => {
  try {
    const { image, heading, subheading, cta_text, cta_link, sort_order } =
      req.body;
    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });

    const slide_id = await generateSlideId();
    const [result] = await db.query(
      `INSERT INTO hero_slides (slide_id, image, heading, subheading, cta_text, cta_link, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create slide" });
  }
};

export const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, heading, subheading, cta_text, cta_link, sort_order } =
      req.body;
    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });

    const [result] = await db.query(
      `UPDATE hero_slides SET image = ?, heading = ?, subheading = ?, cta_text = ?, cta_link = ?, sort_order = ? WHERE id = ?`,
      [
        image,
        heading || null,
        subheading || null,
        cta_text || null,
        cta_link || null,
        sort_order || 0,
        id,
      ],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Slide not found" });
    res.json({ success: true, message: "Slide updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update slide" });
  }
};

export const deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM hero_slides WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Slide not found" });
    res.json({ success: true, message: "Slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete slide" });
  }
};

export const archiveSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE hero_slides SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Slide not found" });
    res.json({ success: true, message: "Slide archived successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to archive slide" });
  }
};

export const restoreSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE hero_slides SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Slide not found" });
    res.json({ success: true, message: "Slide restored successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to restore slide" });
  }
};
