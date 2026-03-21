import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllServices = asyncHandler(async (req, res) => {
  const [services] = await db.execute(
    "SELECT * FROM services ORDER BY created_at DESC",
  );
  res.json({ success: true, data: services });
});

export const getServiceById = asyncHandler(async (req, res) => {
  const [services] = await db.execute("SELECT * FROM services WHERE id = ?", [
    req.params.id,
  ]);
  if (services.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Service not found" });
  res.json({ success: true, data: services[0] });
});

export const createService = asyncHandler(async (req, res) => {
  const { name, slug, description, body, image, status } = req.body;
  const [result] = await db.execute(
    "INSERT INTO services (name, slug, description, body, image, status) VALUES (?, ?, ?, ?, ?, ?)",
    [
      name,
      slug,
      description || null,
      body || null,
      image || null,
      status || "active",
    ],
  );
  res
    .status(201)
    .json({
      success: true,
      message: "Service created successfully",
      data: { id: result.insertId },
    });
});

export const updateService = asyncHandler(async (req, res) => {
  const { name, slug, description, body, image, status } = req.body;
  const [result] = await db.execute(
    "UPDATE services SET name = ?, slug = ?, description = ?, body = ?, image = ?, status = ? WHERE id = ?",
    [
      name,
      slug,
      description || null,
      body || null,
      image || null,
      status || "active",
      req.params.id,
    ],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Service not found" });
  res.json({ success: true, message: "Service updated successfully" });
});

export const deleteService = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM services WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Service not found" });
  res.json({ success: true, message: "Service deleted successfully" });
});

export const archiveService = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE services SET status = ? WHERE id = ?",
    ["archived", req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Service not found" });
  res.json({ success: true, message: "Service archived successfully" });
});

export const restoreService = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE services SET status = ? WHERE id = ?",
    ["active", req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Service not found" });
  res.json({ success: true, message: "Service restored successfully" });
});
