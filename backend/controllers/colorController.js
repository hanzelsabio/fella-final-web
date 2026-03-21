import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllColors = asyncHandler(async (req, res) => {
  const [colors] = await db.execute("SELECT * FROM colors ORDER BY name ASC");
  res.json({ success: true, data: colors });
});

export const getColorById = asyncHandler(async (req, res) => {
  const [colors] = await db.execute("SELECT * FROM colors WHERE id = ?", [
    req.params.id,
  ]);
  if (colors.length === 0)
    return res.status(404).json({ success: false, message: "Color not found" });
  res.json({ success: true, data: colors[0] });
});

export const createColor = asyncHandler(async (req, res) => {
  const { name, slug, hex_code } = req.body;
  const [result] = await db.execute(
    "INSERT INTO colors (name, slug, hex_code) VALUES (?, ?, ?)",
    [name, slug, hex_code],
  );
  res.status(201).json({
    success: true,
    message: "Color created successfully",
    data: { id: result.insertId },
  });
});

export const updateColor = asyncHandler(async (req, res) => {
  const { name, slug, hex_code, status } = req.body;
  const [result] = await db.execute(
    "UPDATE colors SET name = ?, slug = ?, hex_code = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, slug, hex_code, status, req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Colorway not found" });
  res.json({
    success: true,
    message: "Colorway updated successfully",
    data: { id: req.params.id },
  });
});

export const deleteColor = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM colors WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Color not found" });
  res.json({ success: true, message: "Color deleted successfully" });
});

export const archiveColor = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE colors SET status = ? WHERE id = ?",
    ["archived", req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Colorway not found" });
  res.json({ success: true, message: "Colorway archived successfully" });
});

export const restoreColor = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE colors SET status = ? WHERE id = ?",
    ["active", req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Colorway not found" });
  res.json({ success: true, message: "Colorway restored successfully" });
});
