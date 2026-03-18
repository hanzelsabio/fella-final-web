import db from "../config/database.js";

// Get all colors
export const getAllColors = async (req, res) => {
  try {
    const [colors] = await db.query(`
      SELECT * FROM colors 
      ORDER BY name ASC
    `);

    res.json({ success: true, data: colors });
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch colors",
      error: error.message,
    });
  }
};

// Get single color
export const getColorById = async (req, res) => {
  try {
    const { id } = req.params;

    const [colors] = await db.query("SELECT * FROM colors WHERE id = ?", [id]);

    if (colors.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Color not found" });
    }

    res.json({ success: true, data: colors[0] });
  } catch (error) {
    console.error("Error fetching color:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch color",
      error: error.message,
    });
  }
};

// Create color
export const createColor = async (req, res) => {
  try {
    const { name, slug, hex_code } = req.body;

    const [result] = await db.query(
      `INSERT INTO colors (name, slug, hex_code) VALUES (?, ?, ?)`,
      [name, slug, hex_code]
    );

    res.status(201).json({
      success: true,
      message: "Color created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating color:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create color",
      error: error.message,
    });
  }
};

// Update color
export const updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, hex_code, status } = req.body;

    const [result] = await db.query(
      `UPDATE colors SET name = ?, slug = ?, hex_code = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, slug, hex_code, status, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Colorway not found" });
    }

    res.json({
      success: true,
      message: "Colorway updated successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Error updating colorway:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update colorway",
      error: error.message,
    });
  }
};
// Delete color
export const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM colors WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Color not found" });
    }

    res.json({ success: true, message: "Color deleted successfully" });
  } catch (error) {
    console.error("Error deleting color:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete color",
      error: error.message,
    });
  }
};

// Archive color
export const archiveColor = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE colors SET status = ? WHERE id = ?",
      ["archived", id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Colorway not found" });
    }

    res.json({ success: true, message: "Colorway archived successfully" });
  } catch (error) {
    console.error("Error archiving colorway:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive colorway",
      error: error.message,
    });
  }
};

// Restore color (add this new function)
export const restoreColor = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE colors SET status = ? WHERE id = ?",
      ["active", id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Colorway not found" });
    }

    res.json({ success: true, message: "Colorway restored successfully" });
  } catch (error) {
    console.error("Error restoring colorway:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore colorway",
      error: error.message,
    });
  }
};
