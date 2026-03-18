import db from "../config/database.js";

const generateAnnouncementId = async () => {
  const [rows] = await db.query(
    "SELECT announcement_id FROM announcements ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "ANN-001";
  const last = rows[0].announcement_id;
  const num = parseInt(last.replace("ANN-", "")) + 1;
  return `ANN-${String(num).padStart(3, "0")}`;
};

export const getAllAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM announcements ORDER BY created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch announcements" });
  }
};

export const getActiveAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM announcements WHERE status = 'active' ORDER BY created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch announcements" });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Text is required" });

    const announcement_id = await generateAnnouncementId();
    const [result] = await db.query(
      "INSERT INTO announcements (announcement_id, text) VALUES (?, ?)",
      [announcement_id, text.trim()],
    );
    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: { id: result.insertId, announcement_id },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create announcement" });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Text is required" });

    const [result] = await db.query(
      "UPDATE announcements SET text = ? WHERE id = ?",
      [text.trim(), id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });

    res.json({ success: true, message: "Announcement updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update announcement" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM announcements WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete announcement" });
  }
};

export const archiveAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE announcements SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    res.json({ success: true, message: "Announcement archived successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to archive announcement" });
  }
};

export const restoreAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE announcements SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    res.json({ success: true, message: "Announcement restored successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to restore announcement" });
  }
};
