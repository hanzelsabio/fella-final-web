import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllCategories = asyncHandler(async (req, res) => {
  const [categories] = await db.execute(`
    SELECT c.id, c.name, c.slug, c.description, c.image, c.status, c.created_at, c.updated_at,
      (SELECT COUNT(*) FROM products p WHERE p.category = c.id AND p.status = 'active') AS active_product_count
    FROM categories c ORDER BY c.created_at DESC
  `);
  res.json({ success: true, data: categories });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const [categories] = await db.execute(
    "SELECT * FROM categories WHERE id = ?",
    [req.params.id],
  );
  if (categories.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  res.json({ success: true, data: categories[0] });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, status, product_count } = req.body;
  const [result] = await db.execute(
    "INSERT INTO categories (name, slug, description, image, product_count, status) VALUES (?, ?, ?, ?, ?, ?)",
    [
      name,
      slug,
      description || null,
      image || null,
      product_count || 0,
      status || "active",
    ],
  );
  res
    .status(201)
    .json({
      success: true,
      message: "Category created successfully",
      data: { id: result.insertId },
    });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, status } = req.body;
  const [result] = await db.execute(
    "UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, status = ? WHERE id = ?",
    [
      name,
      slug,
      description || null,
      image || null,
      status || "active",
      req.params.id,
    ],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category updated successfully" });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM categories WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category deleted successfully" });
});

export const archiveCategory = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE categories SET status = ? WHERE id = ?",
    ["archived", req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category archived successfully" });
});

export const restoreCategory = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE categories SET status = ? WHERE id = ?",
    ["active", req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category restored successfully" });
});
