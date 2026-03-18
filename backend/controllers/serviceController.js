import db from "../config/database.js";

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT * FROM services 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: services });
  } catch (error) {
    console.error("Error fetching services:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch services",
        error: error.message,
      });
  }
};

// Get single service
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const [services] = await db.query("SELECT * FROM services WHERE id = ?", [
      id,
    ]);
    if (services.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, data: services[0] });
  } catch (error) {
    console.error("Error fetching service:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch service",
        error: error.message,
      });
  }
};

// Create service
export const createService = async (req, res) => {
  try {
    const { name, slug, description, body, image, status } = req.body;

    const [result] = await db.query(
      `INSERT INTO services (name, slug, description, body, image, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description || null,
        body || null, // JSON array string e.g. '["Item 1","Item 2"]'
        image || null,
        status || "active",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create service",
        error: error.message,
        details: error.sqlMessage,
      });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, body, image, status } = req.body;

    const [result] = await db.query(
      `UPDATE services 
       SET name = ?, slug = ?, description = ?, body = ?, image = ?, status = ?
       WHERE id = ?`,
      [
        name,
        slug,
        description || null,
        body || null,
        image || null,
        status || "active",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.json({ success: true, message: "Service updated successfully" });
  } catch (error) {
    console.error("Error updating service:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update service",
        error: error.message,
      });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM services WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete service",
        error: error.message,
      });
  }
};

// Archive service
export const archiveService = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE services SET status = ? WHERE id = ?",
      ["archived", id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, message: "Service archived successfully" });
  } catch (error) {
    console.error("Error archiving service:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to archive service",
        error: error.message,
      });
  }
};

// Restore service
export const restoreService = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE services SET status = ? WHERE id = ?",
      ["active", id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, message: "Service restored successfully" });
  } catch (error) {
    console.error("Error restoring service:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to restore service",
        error: error.message,
      });
  }
};
