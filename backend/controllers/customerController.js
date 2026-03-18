import db from "../config/database.js";

const generateSlug = async (name, excludeId = null) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  let slug = base;
  const query = excludeId
    ? "SELECT id FROM customers WHERE slug = ? AND id != ?"
    : "SELECT id FROM customers WHERE slug = ?";
  const params = excludeId ? [slug, excludeId] : [slug];
  const [existing] = await db.query(query, params);
  if (existing.length > 0) slug = `${base}-${Date.now()}`;
  return slug;
};

export const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, slug, contact_no, email, status, created_at, updated_at
       FROM customers ORDER BY created_at DESC`,
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customers" });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT id, name, slug, description, contact_no, email, status, created_at, updated_at
       FROM customers WHERE id = ?`,
      [id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customer" });
  }
};

export const getCustomerBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query(
      `SELECT id, name, slug, description, contact_no, email, status, created_at, updated_at
       FROM customers WHERE slug = ?`,
      [slug],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customer" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, description, contact_no, email } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    const slug = await generateSlug(name);
    const [result] = await db.query(
      `INSERT INTO customers (name, slug, description, contact_no, email) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, description || null, contact_no || null, email || null],
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Customer created successfully",
        data: { id: result.insertId },
      });
  } catch (error) {
    console.error("Error creating customer:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create customer" });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, contact_no, email } = req.body;
    const slug = await generateSlug(name, id);
    const [result] = await db.query(
      `UPDATE customers SET name = ?, slug = ?, description = ?, contact_no = ?, email = ? WHERE id = ?`,
      [name, slug, description || null, contact_no || null, email || null, id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, message: "Customer updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update customer" });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM customers WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete customer" });
  }
};

export const archiveCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE customers SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, message: "Customer archived successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to archive customer" });
  }
};

export const restoreCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE customers SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, message: "Customer restored successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to restore customer" });
  }
};
