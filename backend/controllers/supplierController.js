import db from "../config/database.js";

const generateSlug = async (name, excludeId = null) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  let slug = base;
  const query = excludeId
    ? "SELECT id FROM suppliers WHERE slug = ? AND id != ?"
    : "SELECT id FROM suppliers WHERE slug = ?";
  const params = excludeId ? [slug, excludeId] : [slug];
  const [existing] = await db.query(query, params);
  if (existing.length > 0) slug = `${base}-${Date.now()}`;
  return slug;
};

export const getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, slug, contact_no, status, created_at, updated_at
       FROM suppliers ORDER BY created_at DESC`,
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch suppliers" });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT id, name, slug, description, contact_no, status, created_at, updated_at
       FROM suppliers WHERE id = ?`,
      [id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch supplier" });
  }
};

export const getSupplierBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query(
      `SELECT id, name, slug, description, contact_no, status, created_at, updated_at
       FROM suppliers WHERE slug = ?`,
      [slug],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch supplier" });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { name, description, contact_no } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    const slug = await generateSlug(name);
    const [result] = await db.query(
      `INSERT INTO suppliers (name, slug, description, contact_no) VALUES (?, ?, ?, ?)`,
      [name, slug, description || null, contact_no || null],
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Supplier created successfully",
        data: { id: result.insertId },
      });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create supplier" });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, contact_no } = req.body;
    const slug = await generateSlug(name, id);
    const [result] = await db.query(
      `UPDATE suppliers SET name = ?, slug = ?, description = ?, contact_no = ? WHERE id = ?`,
      [name, slug, description || null, contact_no || null, id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update supplier" });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM suppliers WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete supplier" });
  }
};

export const archiveSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE suppliers SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier archived successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to archive supplier" });
  }
};

export const restoreSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE suppliers SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier restored successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to restore supplier" });
  }
};
