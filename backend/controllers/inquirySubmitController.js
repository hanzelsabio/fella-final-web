import db from "../config/database.js";

// ==================== GENERATE INQUIRY NUMBER ====================

const generateInquiryNumber = async () => {
  // Format: IN + 6 random digits, ensure uniqueness
  let inquiryNumber;
  let isUnique = false;

  while (!isUnique) {
    const random = Math.floor(100000 + Math.random() * 900000);
    inquiryNumber = `IN${random}`;

    const [existing] = await db.query(
      "SELECT id FROM inquiries WHERE inquiry_number = ?",
      [inquiryNumber]
    );
    isUnique = existing.length === 0;
  }

  return inquiryNumber;
};

// ==================== SUBMIT INQUIRY (Public Form) ====================

export const submitInquiry = async (req, res) => {
  const { first_name, last_name, email, phone, product, service, message } =
    req.body;

  // Basic validation
  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone ||
    !product ||
    !service ||
    !message
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const inquiry_number = await generateInquiryNumber();
    const name = `${first_name.trim()} ${last_name.trim()}`;

    // Insert into inquiries table
    const [result] = await db.query(
      `INSERT INTO inquiries
        (inquiry_number, name, product_type, service_type, contact, email, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, 'normal', 'pending')`,
      [
        inquiry_number,
        name,
        product.trim(),
        service.trim(),
        phone.trim(),
        email.trim(),
      ]
    );

    const inquiryId = result.insertId;

    // Insert message into inquiry_messages table
    await db.query(
      `INSERT INTO inquiry_messages (inquiry_id, message, sent_at)
       VALUES (?, ?, NOW())`,
      [inquiryId, message.trim()]
    );

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiry_number,
    });
  } catch (err) {
    console.error("Error submitting inquiry:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit inquiry",
    });
  }
};
