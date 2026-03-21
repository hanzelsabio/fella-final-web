import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateAnnouncementId = async () => {
  const [rows] = await db.execute(
    "SELECT announcement_id FROM announcements ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "ANN-001";
  const num = parseInt(rows[0].announcement_id.replace("ANN-", "")) + 1;
  return `ANN-${String(num).padStart(3, "0")}`;
};

export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM announcements ORDER BY created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM announcements WHERE status = 'active' ORDER BY created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Text is required" });

  const announcement_id = await generateAnnouncementId();
  const [result] = await db.execute(
    "INSERT INTO announcements (announcement_id, text) VALUES (?, ?)",
    [announcement_id, text.trim()],
  );
  res.status(201).json({
    success: true,
    message: "Announcement created successfully",
    data: { id: result.insertId, announcement_id },
  });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Text is required" });

  const [result] = await db.execute(
    "UPDATE announcements SET text = ? WHERE id = ?",
    [text.trim(), id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Announcement not found" });
  res.json({ success: true, message: "Announcement updated successfully" });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM announcements WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Announcement not found" });
  res.json({ success: true, message: "Announcement deleted successfully" });
});

export const archiveAnnouncement = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE announcements SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Announcement not found" });
  res.json({ success: true, message: "Announcement archived successfully" });
});

export const restoreAnnouncement = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE announcements SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Announcement not found" });
  res.json({ success: true, message: "Announcement restored successfully" });
});
