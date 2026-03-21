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
