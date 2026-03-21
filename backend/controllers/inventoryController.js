import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateSlug = async (name, excludeId = null) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const query = excludeId
    ? "SELECT id FROM inventory WHERE slug = ? AND id != ?"
    : "SELECT id FROM inventory WHERE slug = ?";
  const params = excludeId ? [base, excludeId] : [base];
  const [existing] = await db.execute(query, params);
  return existing.length > 0 ? `${base}-${Date.now()}` : base;
};

export const getAllInventory = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, description, quantity, image, status, created_at, updated_at FROM inventory ORDER BY created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const getInventoryById = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, description, quantity, image, status, created_at, updated_at FROM inventory WHERE id = ?",
    [req.params.id],
  );
  if (rows.length === 0)
    return res.status(404).json({ success: false, message: "Item not found" });
  res.json({ success: true, data: rows[0] });
});

export const getInventoryBySlug = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, description, quantity, image, status, created_at, updated_at FROM inventory WHERE slug = ?",
    [req.params.slug],
  );
  if (rows.length === 0)
    return res.status(404).json({ success: false, message: "Item not found" });
  res.json({ success: true, data: rows[0] });
});

export const createInventoryItem = asyncHandler(async (req, res) => {
  const { name, description, quantity, image } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  const slug = await generateSlug(name);
  const [result] = await db.execute(
    "INSERT INTO inventory (name, slug, description, quantity, image) VALUES (?, ?, ?, ?, ?)",
    [name, slug, description || null, parseInt(quantity) || 0, image || null],
  );
  res
    .status(201)
    .json({
      success: true,
      message: "Item created successfully",
      data: { id: result.insertId },
    });
});

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { name, description, quantity, image } = req.body;
  const slug = await generateSlug(name, req.params.id);
  const [result] = await db.execute(
    "UPDATE inventory SET name = ?, slug = ?, description = ?, quantity = ?, image = ? WHERE id = ?",
    [
      name,
      slug,
      description || null,
      parseInt(quantity) || 0,
      image || null,
      req.params.id,
    ],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Item not found" });
  res.json({ success: true, message: "Item updated successfully" });
});

export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM inventory WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Item not found" });
  res.json({ success: true, message: "Item deleted successfully" });
});

export const archiveInventoryItem = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE inventory SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Item not found" });
  res.json({ success: true, message: "Item archived successfully" });
});

export const restoreInventoryItem = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE inventory SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Item not found" });
  res.json({ success: true, message: "Item restored successfully" });
});
