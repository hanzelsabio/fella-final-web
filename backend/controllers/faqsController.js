import db from "../config/database.js";

const generateFaqId = async () => {
  const [rows] = await db.query(
    "SELECT faq_id FROM faqs ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "FAQ-001";
  const last = rows[0].faq_id;
  const num = parseInt(last.replace("FAQ-", "")) + 1;
  return `FAQ-${String(num).padStart(3, "0")}`;
};

export const getAllFaqs = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM faqs ORDER BY sort_order ASC, created_at ASC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch FAQs" });
  }
};

export const getActiveFaqs = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM faqs WHERE status = 'active' ORDER BY sort_order ASC, created_at ASC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch FAQs" });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer, sort_order } = req.body;
    if (!question?.trim() || !answer?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Question and answer are required" });

    const faq_id = await generateFaqId();
    const [result] = await db.query(
      "INSERT INTO faqs (faq_id, question, answer, sort_order) VALUES (?, ?, ?, ?)",
      [faq_id, question.trim(), answer.trim(), sort_order || 0],
    );
    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: { id: result.insertId, faq_id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create FAQ" });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, sort_order } = req.body;
    if (!question?.trim() || !answer?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Question and answer are required" });

    const [result] = await db.query(
      "UPDATE faqs SET question = ?, answer = ?, sort_order = ? WHERE id = ?",
      [question.trim(), answer.trim(), sort_order || 0, id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, message: "FAQ updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update FAQ" });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM faqs WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete FAQ" });
  }
};

export const archiveFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE faqs SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, message: "FAQ archived successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to archive FAQ" });
  }
};

export const restoreFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE faqs SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, message: "FAQ restored successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to restore FAQ" });
  }
};
