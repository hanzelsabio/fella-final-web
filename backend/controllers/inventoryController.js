import db from "../config/database.js";

// GET all inventory items
export const getAllInventory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, slug, description, quantity, image, status, created_at, updated_at
       FROM inventory ORDER BY created_at DESC`,
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch inventory" });
  }
};

// GET single inventory item
export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT id, name, slug, description, quantity, image, status, created_at, updated_at
       FROM inventory WHERE id = ?`,
      [id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({ success: false, message: "Failed to fetch item" });
  }
};

// GET single inventory item by slug
export const getInventoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query(
      `SELECT id, name, slug, description, quantity, image, status, created_at, updated_at
       FROM inventory WHERE slug = ?`,
      [slug],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching inventory item by slug:", error);
    res.status(500).json({ success: false, message: "Failed to fetch item" });
  }
};

// POST create inventory item
export const createInventoryItem = async (req, res) => {
  try {
    const { name, description, quantity, image } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });

    // Generate unique slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    let slug = baseSlug;
    const [existing] = await db.query(
      "SELECT id FROM inventory WHERE slug = ?",
      [slug],
    );
    if (existing.length > 0) slug = `${baseSlug}-${Date.now()}`;

    const [result] = await db.query(
      `INSERT INTO inventory (name, slug, description, quantity, image) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, description || null, parseInt(quantity) || 0, image || null],
    );
    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({ success: false, message: "Failed to create item" });
  }
};

// PUT update inventory item
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, image } = req.body;

    // Regenerate slug if name changed
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    let slug = baseSlug;
    const [existing] = await db.query(
      "SELECT id FROM inventory WHERE slug = ? AND id != ?",
      [slug, id],
    );
    if (existing.length > 0) slug = `${baseSlug}-${Date.now()}`;

    const [result] = await db.query(
      `UPDATE inventory SET name = ?, slug = ?, description = ?, quantity = ?, image = ? WHERE id = ?`,
      [
        name,
        slug,
        description || null,
        parseInt(quantity) || 0,
        image || null,
        id,
      ],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({ success: false, message: "Failed to update item" });
  }
};

// DELETE inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM inventory WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
};

// PATCH archive
export const archiveInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE inventory SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Item archived successfully" });
  } catch (error) {
    console.error("Error archiving inventory item:", error);
    res.status(500).json({ success: false, message: "Failed to archive item" });
  }
};

// PATCH restore
export const restoreInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE inventory SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Item restored successfully" });
  } catch (error) {
    console.error("Error restoring inventory item:", error);
    res.status(500).json({ success: false, message: "Failed to restore item" });
  }
};
