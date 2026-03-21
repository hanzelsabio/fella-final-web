import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// ── ID generator — capped retries to prevent infinite loop ───────────────────
const generateInquiryNumber = async () => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const number = `IN${Math.floor(100000 + Math.random() * 900000)}`;
    const [existing] = await db.execute(
      "SELECT id FROM inquiries WHERE inquiry_number = ?",
      [number],
    );
    if (existing.length === 0) return number;
  }
  throw new Error("Failed to generate unique inquiry number");
};

// ── Shared status updater ─────────────────────────────────────────────────────
const updateStatus = async (res, id, newStatus, alreadyMsg) => {
  const [existing] = await db.execute(
    "SELECT id, status FROM inquiries WHERE id = ?",
    [id],
  );
  if (existing.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });
  if (existing[0].status === newStatus)
    return res.status(400).json({ success: false, message: alreadyMsg });
  await db.execute(
    "UPDATE inquiries SET status = ?, updated_at = NOW() WHERE id = ?",
    [newStatus, id],
  );
  return res
    .status(200)
    .json({
      success: true,
      message: `Inquiry marked as ${newStatus}`,
      status: newStatus,
    });
};

// ── Public submit ─────────────────────────────────────────────────────────────
export const submitInquiry = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, product, service, message } =
    req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone ||
    !product ||
    !service ||
    !message
  )
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });

  const inquiry_number = await generateInquiryNumber();
  const name = `${first_name.trim()} ${last_name.trim()}`;

  const [result] = await db.execute(
    `INSERT INTO inquiries (inquiry_number, name, product_type, service_type, contact, email, priority, status)
     VALUES (?, ?, ?, ?, ?, ?, 'normal', 'pending')`,
    [
      inquiry_number,
      name,
      product.trim(),
      service.trim(),
      phone.trim(),
      email.trim(),
    ],
  );

  await db.execute(
    "INSERT INTO inquiry_messages (inquiry_id, message, sent_at) VALUES (?, ?, NOW())",
    [result.insertId, message.trim()],
  );

  res
    .status(201)
    .json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiry_number,
    });
});

// ── Admin controllers ──────────────────────────────────────────────────────────
export const getAllInquiries = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT id, inquiry_number, name, product_type, service_type, contact, email,
            due_date, priority, status, created_at, updated_at
     FROM inquiries ORDER BY created_at DESC`,
  );
  res.status(200).json({ success: true, data: rows });
});

export const getInquiryById = asyncHandler(async (req, res) => {
  const [inquiryRows] = await db.execute(
    `SELECT id, inquiry_number, name, product_type, service_type, contact, email,
            due_date, priority, status, created_at, updated_at
     FROM inquiries WHERE inquiry_number = ?`,
    [req.params.inquiry_number],
  );
  if (inquiryRows.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });

  const [messageRows] = await db.execute(
    "SELECT id, inquiry_id, message, sent_at FROM inquiry_messages WHERE inquiry_id = ? ORDER BY sent_at ASC",
    [inquiryRows[0].id],
  );
  res
    .status(200)
    .json({
      success: true,
      data: { ...inquiryRows[0], messages: messageRows },
    });
});

export const deleteInquiry = asyncHandler(async (req, res) => {
  const [existing] = await db.execute("SELECT id FROM inquiries WHERE id = ?", [
    req.params.id,
  ]);
  if (existing.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });
  await db.execute("DELETE FROM inquiries WHERE id = ?", [req.params.id]);
  res
    .status(200)
    .json({ success: true, message: "Inquiry deleted successfully" });
});

export const archiveInquiry = asyncHandler((req, res) =>
  updateStatus(res, req.params.id, "archived", "Inquiry is already archived"),
);
export const restoreInquiry = asyncHandler((req, res) =>
  updateStatus(res, req.params.id, "pending", "Inquiry is already pending"),
);
export const markAsResponded = asyncHandler((req, res) =>
  updateStatus(
    res,
    req.params.id,
    "responded",
    "Inquiry is already marked as responded",
  ),
);
export const markAsCancelled = asyncHandler((req, res) =>
  updateStatus(res, req.params.id, "cancelled", "Inquiry is already cancelled"),
);
export const markAsPending = asyncHandler((req, res) =>
  updateStatus(res, req.params.id, "pending", "Inquiry is already pending"),
);

export const updatePriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  if (!["high", "normal"].includes(priority))
    return res
      .status(400)
      .json({ success: false, message: "Invalid priority value" });

  const [existing] = await db.execute(
    "SELECT id, priority FROM inquiries WHERE id = ?",
    [req.params.id],
  );
  if (existing.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });
  if (existing[0].priority === priority)
    return res
      .status(400)
      .json({
        success: false,
        message: `Inquiry is already ${priority} priority`,
      });

  await db.execute(
    "UPDATE inquiries SET priority = ?, updated_at = NOW() WHERE id = ?",
    [priority, req.params.id],
  );
  res
    .status(200)
    .json({
      success: true,
      message: `Priority updated to ${priority}`,
      priority,
    });
});
