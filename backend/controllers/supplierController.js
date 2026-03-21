import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateSlug = async (name, excludeId = null) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const query = excludeId
    ? "SELECT id FROM suppliers WHERE slug = ? AND id != ?"
    : "SELECT id FROM suppliers WHERE slug = ?";
  const params = excludeId ? [base, excludeId] : [base];
  const [existing] = await db.execute(query, params);
  return existing.length > 0 ? `${base}-${Date.now()}` : base;
};

export const getAllSuppliers = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, contact_no, status, created_at, updated_at FROM suppliers ORDER BY created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const getSupplierById = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, description, contact_no, status, created_at, updated_at FROM suppliers WHERE id = ?",
    [req.params.id],
  );
  if (rows.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Supplier not found" });
  res.json({ success: true, data: rows[0] });
});

export const getSupplierBySlug = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, description, contact_no, status, created_at, updated_at FROM suppliers WHERE slug = ?",
    [req.params.slug],
  );
  if (rows.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Supplier not found" });
  res.json({ success: true, data: rows[0] });
});

export const createSupplier = asyncHandler(async (req, res) => {
  const { name, description, contact_no } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  const slug = await generateSlug(name);
  const [result] = await db.execute(
    "INSERT INTO suppliers (name, slug, description, contact_no) VALUES (?, ?, ?, ?)",
    [name, slug, description || null, contact_no || null],
  );
  res
    .status(201)
    .json({
      success: true,
      message: "Supplier created successfully",
      data: { id: result.insertId },
    });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const { name, description, contact_no } = req.body;
  const slug = await generateSlug(name, req.params.id);
  const [result] = await db.execute(
    "UPDATE suppliers SET name = ?, slug = ?, description = ?, contact_no = ? WHERE id = ?",
    [name, slug, description || null, contact_no || null, req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Supplier not found" });
  res.json({ success: true, message: "Supplier updated successfully" });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM suppliers WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Supplier not found" });
  res.json({ success: true, message: "Supplier deleted successfully" });
});

export const archiveSupplier = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE suppliers SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Supplier not found" });
  res.json({ success: true, message: "Supplier archived successfully" });
});

export const restoreSupplier = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE suppliers SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Supplier not found" });
  res.json({ success: true, message: "Supplier restored successfully" });
});
