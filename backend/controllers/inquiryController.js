import db from "../config/database.js";

// ==================== GET ALL INQUIRIES ====================

export const getAllInquiries = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        id,
        inquiry_number,
        name,
        product_type,
        service_type,
        contact,
        email,
        due_date,
        priority,
        status,
        created_at,
        updated_at
       FROM inquiries
       ORDER BY created_at DESC`,
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching inquiries:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch inquiries" });
  }
};

// ==================== GET SINGLE INQUIRY WITH MESSAGES ====================

export const getInquiryById = async (req, res) => {
  const { inquiry_number } = req.params;

  try {
    const [inquiryRows] = await db.query(
      `SELECT
        id,
        inquiry_number,
        name,
        product_type,
        service_type,
        contact,
        email,
        due_date,
        priority,
        status,
        created_at,
        updated_at
       FROM inquiries
       WHERE inquiry_number = ?`,
      [inquiry_number],
    );

    if (inquiryRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found" });
    }

    const [messageRows] = await db.query(
      `SELECT id, inquiry_id, message, sent_at
       FROM inquiry_messages
       WHERE inquiry_id = ?
       ORDER BY sent_at ASC`,
      [inquiryRows[0].id],
    );

    return res.status(200).json({
      success: true,
      data: { ...inquiryRows[0], messages: messageRows },
    });
  } catch (err) {
    console.error("Error fetching inquiry:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch inquiry" });
  }
};

// ==================== DELETE INQUIRY ====================

export const deleteInquiry = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await db.query("SELECT id FROM inquiries WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found" });
    }
    await db.query("DELETE FROM inquiries WHERE id = ?", [id]);
    return res
      .status(200)
      .json({ success: true, message: "Inquiry deleted successfully" });
  } catch (err) {
    console.error("Error deleting inquiry:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete inquiry" });
  }
};

// ==================== UPDATE STATUS (generic) ====================

const updateStatus = async (res, id, newStatus, alreadyMsg) => {
  const [existing] = await db.query(
    "SELECT id, status FROM inquiries WHERE id = ?",
    [id],
  );
  if (existing.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });
  }
  if (existing[0].status === newStatus) {
    return res.status(400).json({ success: false, message: alreadyMsg });
  }
  await db.query(
    "UPDATE inquiries SET status = ?, updated_at = NOW() WHERE id = ?",
    [newStatus, id],
  );
  return res.status(200).json({
    success: true,
    message: `Inquiry marked as ${newStatus}`,
    status: newStatus,
  });
};

export const archiveInquiry = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "archived",
      "Inquiry is already archived",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to archive inquiry" });
  }
};

export const restoreInquiry = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "pending",
      "Inquiry is already pending",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to restore inquiry" });
  }
};

export const markAsResponded = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "responded",
      "Inquiry is already marked as responded",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark as responded" });
  }
};

export const markAsCancelled = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "cancelled",
      "Inquiry is already cancelled",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to cancel inquiry" });
  }
};

export const markAsPending = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "pending",
      "Inquiry is already pending",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark as pending" });
  }
};

export const updatePriority = async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  if (!["high", "normal"].includes(priority)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid priority value" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id, priority FROM inquiries WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found" });
    }
    if (existing[0].priority === priority) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Inquiry is already ${priority} priority`,
        });
    }
    await db.query(
      "UPDATE inquiries SET priority = ?, updated_at = NOW() WHERE id = ?",
      [priority, id],
    );
    return res.status(200).json({
      success: true,
      message: `Priority updated to ${priority}`,
      priority,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update priority" });
  }
};
