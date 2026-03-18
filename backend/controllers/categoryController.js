import db from "../config/database.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image,
        c.status,
        c.created_at,
        c.updated_at,
        (
          SELECT COUNT(*)
          FROM products p
          WHERE p.category = c.id
            AND p.status = 'active'
        ) AS active_product_count
      FROM categories c
      ORDER BY c.created_at DESC
    `);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// Get single category
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await db.query(
      "SELECT * FROM categories WHERE id = ?",
      [id],
    );

    if (categories.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: categories[0] });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, status, product_count } = req.body;

    const [result] = await db.query(
      `INSERT INTO categories (name, slug, description, image, product_count, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description || null,
        image || null,
        product_count || 0,
        status || "active",
      ],
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
      details: error.sqlMessage,
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, status } = req.body;

    const [result] = await db.query(
      `UPDATE categories 
       SET name = ?, slug = ?, description = ?, image = ?, status = ?
       WHERE id = ?`,
      [name, slug, description || null, image || null, status || "active", id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

// Archive category
export const archiveCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE categories SET status = ? WHERE id = ?",
      ["archived", id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category archived successfully" });
  } catch (error) {
    console.error("Error archiving category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive category",
      error: error.message,
    });
  }
};

// Restore category
export const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE categories SET status = ? WHERE id = ?",
      ["active", id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category restored successfully" });
  } catch (error) {
    console.error("Error restoring category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore category",
      error: error.message,
    });
  }
};
