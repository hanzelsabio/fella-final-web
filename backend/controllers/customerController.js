import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateSlug = async (name, excludeId = null) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const query = excludeId
    ? "SELECT id FROM customers WHERE slug = ? AND id != ?"
    : "SELECT id FROM customers WHERE slug = ?";
  const params = excludeId ? [base, excludeId] : [base];
  const [existing] = await db.execute(query, params);
  return existing.length > 0 ? `${base}-${Date.now()}` : base;
};

export const getAllCustomers = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, contact_no, email, status, created_at, updated_at FROM customers ORDER BY created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, description, contact_no, email, status, created_at, updated_at FROM customers WHERE id = ?",
    [req.params.id],
  );
  if (rows.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Customer not found" });
  res.json({ success: true, data: rows[0] });
});

export const getCustomerBySlug = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, slug, description, contact_no, email, status, created_at, updated_at FROM customers WHERE slug = ?",
    [req.params.slug],
  );
  if (rows.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Customer not found" });
  res.json({ success: true, data: rows[0] });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const { name, description, contact_no, email } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  const slug = await generateSlug(name);
  const [result] = await db.execute(
    "INSERT INTO customers (name, slug, description, contact_no, email) VALUES (?, ?, ?, ?, ?)",
    [name, slug, description || null, contact_no || null, email || null],
  );
  res
    .status(201)
    .json({
      success: true,
      message: "Customer created successfully",
      data: { id: result.insertId },
    });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { name, description, contact_no, email } = req.body;
  const slug = await generateSlug(name, req.params.id);
  const [result] = await db.execute(
    "UPDATE customers SET name = ?, slug = ?, description = ?, contact_no = ?, email = ? WHERE id = ?",
    [
      name,
      slug,
      description || null,
      contact_no || null,
      email || null,
      req.params.id,
    ],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Customer not found" });
  res.json({ success: true, message: "Customer updated successfully" });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM customers WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Customer not found" });
  res.json({ success: true, message: "Customer deleted successfully" });
});

export const archiveCustomer = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE customers SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Customer not found" });
  res.json({ success: true, message: "Customer archived successfully" });
});

export const restoreCustomer = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE customers SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Customer not found" });
  res.json({ success: true, message: "Customer restored successfully" });
});
