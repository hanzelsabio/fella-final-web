import db from "../config/database.js";

const generateWorkId = async () => {
  const [rows] = await db.query(
    "SELECT work_id FROM works ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "WRK-001";
  const last = rows[0].work_id;
  const num = parseInt(last.replace("WRK-", "")) + 1;
  return `WRK-${String(num).padStart(3, "0")}`;
};

export const getAllWorks = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM works ORDER BY sort_order ASC, created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch works" });
  }
};

export const getActiveWorks = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM works WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch works" });
  }
};

export const createWork = async (req, res) => {
  try {
    const { image, sort_order } = req.body;
    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });

    const work_id = await generateWorkId();
    const [result] = await db.query(
      "INSERT INTO works (work_id, image, sort_order) VALUES (?, ?, ?)",
      [work_id, image, sort_order || 0],
    );
    res.status(201).json({
      success: true,
      message: "Work created successfully",
      data: { id: result.insertId, work_id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create work" });
  }
};

export const updateWork = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, sort_order } = req.body;
    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });

    const [result] = await db.query(
      "UPDATE works SET image = ?, sort_order = ? WHERE id = ?",
      [image, sort_order || 0, id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Work not found" });
    res.json({ success: true, message: "Work updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update work" });
  }
};

export const deleteWork = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM works WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Work not found" });
    res.json({ success: true, message: "Work deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete work" });
  }
};

export const archiveWork = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE works SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Work not found" });
    res.json({ success: true, message: "Work archived successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to archive work" });
  }
};

export const restoreWork = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE works SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Work not found" });
    res.json({ success: true, message: "Work restored successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to restore work" });
  }
};
