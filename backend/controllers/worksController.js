import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateWorkId = async () => {
  const [rows] = await db.execute(
    "SELECT work_id FROM works ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "WRK-001";
  const num = parseInt(rows[0].work_id.replace("WRK-", "")) + 1;
  return `WRK-${String(num).padStart(3, "0")}`;
};

export const getAllWorks = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM works ORDER BY sort_order ASC, created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const getActiveWorks = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM works WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const createWork = asyncHandler(async (req, res) => {
  const { image, sort_order } = req.body;
  if (!image)
    return res
      .status(400)
      .json({ success: false, message: "Image is required" });
  const work_id = await generateWorkId();
  const [result] = await db.execute(
    "INSERT INTO works (work_id, image, sort_order) VALUES (?, ?, ?)",
    [work_id, image, sort_order || 0],
  );
  res
    .status(201)
    .json({
      success: true,
      message: "Work created successfully",
      data: { id: result.insertId, work_id },
    });
});

export const updateWork = asyncHandler(async (req, res) => {
  const { image, sort_order } = req.body;
  if (!image)
    return res
      .status(400)
      .json({ success: false, message: "Image is required" });
  const [result] = await db.execute(
    "UPDATE works SET image = ?, sort_order = ? WHERE id = ?",
    [image, sort_order || 0, req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Work not found" });
  res.json({ success: true, message: "Work updated successfully" });
});

export const deleteWork = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM works WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Work not found" });
  res.json({ success: true, message: "Work deleted successfully" });
});

export const archiveWork = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE works SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Work not found" });
  res.json({ success: true, message: "Work archived successfully" });
});

export const restoreWork = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE works SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Work not found" });
  res.json({ success: true, message: "Work restored successfully" });
});
