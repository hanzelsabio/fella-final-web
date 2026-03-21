import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateFaqId = async () => {
  const [rows] = await db.execute(
    "SELECT faq_id FROM faqs ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "FAQ-001";
  const num = parseInt(rows[0].faq_id.replace("FAQ-", "")) + 1;
  return `FAQ-${String(num).padStart(3, "0")}`;
};

export const getAllFaqs = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM faqs ORDER BY sort_order ASC, created_at ASC",
  );
  res.json({ success: true, data: rows });
});

export const getActiveFaqs = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM faqs WHERE status = 'active' ORDER BY sort_order ASC, created_at ASC",
  );
  res.json({ success: true, data: rows });
});

export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, sort_order } = req.body;
  if (!question?.trim() || !answer?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Question and answer are required" });

  const faq_id = await generateFaqId();
  const [result] = await db.execute(
    "INSERT INTO faqs (faq_id, question, answer, sort_order) VALUES (?, ?, ?, ?)",
    [faq_id, question.trim(), answer.trim(), sort_order || 0],
  );
  res.status(201).json({
    success: true,
    message: "FAQ created successfully",
    data: { id: result.insertId, faq_id },
  });
});

export const updateFaq = asyncHandler(async (req, res) => {
  const { question, answer, sort_order } = req.body;
  if (!question?.trim() || !answer?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Question and answer are required" });

  const [result] = await db.execute(
    "UPDATE faqs SET question = ?, answer = ?, sort_order = ? WHERE id = ?",
    [question.trim(), answer.trim(), sort_order || 0, req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "FAQ not found" });
  res.json({ success: true, message: "FAQ updated successfully" });
});

export const deleteFaq = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM faqs WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "FAQ not found" });
  res.json({ success: true, message: "FAQ deleted successfully" });
});

export const archiveFaq = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE faqs SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "FAQ not found" });
  res.json({ success: true, message: "FAQ archived successfully" });
});

export const restoreFaq = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE faqs SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "FAQ not found" });
  res.json({ success: true, message: "FAQ restored successfully" });
});
