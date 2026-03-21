import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateInvoiceNumber = async () => {
  const [rows] = await db.execute(
    "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "INV-0001";
  const num = parseInt(rows[0].invoice_number.split("-")[1], 10) + 1;
  return `INV-${String(num).padStart(4, "0")}`;
};

const updateStatus = async (res, id, newStatus, alreadyMsg) => {
  const [existing] = await db.execute(
    "SELECT id, status FROM invoices WHERE id = ?",
    [id],
  );
  if (existing.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });
  if (existing[0].status === newStatus)
    return res.status(400).json({ success: false, message: alreadyMsg });
  await db.execute(
    "UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?",
    [newStatus, id],
  );
  return res
    .status(200)
    .json({
      success: true,
      message: `Invoice marked as ${newStatus}`,
      status: newStatus,
    });
};

export const getAllInvoices = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT i.id, i.invoice_number, i.name, i.email, i.contact,
            i.due_date, i.status, i.notes, i.created_at, i.updated_at,
            COALESCE(SUM(li.price * li.quantity), 0) AS total
     FROM invoices i
     LEFT JOIN invoice_line_items li ON li.invoice_id = i.id
     GROUP BY i.id ORDER BY i.created_at DESC`,
  );
  res.status(200).json({ success: true, data: rows });
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const [invoiceRows] = await db.execute(
    "SELECT id, invoice_number, name, email, contact, due_date, status, notes, created_at, updated_at FROM invoices WHERE invoice_number = ?",
    [req.params.id],
  );
  if (invoiceRows.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });

  const [lineItems] = await db.execute(
    "SELECT id, product_type, service_type, description, quantity, price FROM invoice_line_items WHERE invoice_id = ?",
    [invoiceRows[0].id],
  );
  res
    .status(200)
    .json({
      success: true,
      data: { ...invoiceRows[0], line_items: lineItems },
    });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const { name, email, contact, due_date, notes, line_items } = req.body;
  if (!name || !line_items?.length)
    return res
      .status(400)
      .json({
        success: false,
        message: "Name and at least one line item are required",
      });

  const invoice_number = await generateInvoiceNumber();
  const [result] = await db.execute(
    "INSERT INTO invoices (invoice_number, name, email, contact, due_date, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'unpaid', NOW(), NOW())",
    [
      invoice_number,
      name,
      email || null,
      contact || null,
      due_date || null,
      notes || null,
    ],
  );
  const invoiceId = result.insertId;

  for (const item of line_items) {
    await db.execute(
      "INSERT INTO invoice_line_items (invoice_id, product_type, service_type, description, quantity, price) VALUES (?, ?, ?, ?, ?, ?)",
      [
        invoiceId,
        item.product_type || null,
        item.service_type || null,
        item.description || null,
        item.quantity || 1,
        item.price || 0,
      ],
    );
  }

  res
    .status(201)
    .json({
      success: true,
      message: "Invoice created",
      data: { id: invoiceId, invoice_number },
    });
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const { name, email, contact, due_date, notes, line_items } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Customer name is required" });

  const [existing] = await db.execute("SELECT id FROM invoices WHERE id = ?", [
    req.params.id,
  ]);
  if (existing.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });

  await db.execute(
    "UPDATE invoices SET name = ?, email = ?, contact = ?, due_date = ?, notes = ?, updated_at = NOW() WHERE id = ?",
    [
      name,
      email || null,
      contact || null,
      due_date || null,
      notes || null,
      req.params.id,
    ],
  );

  if (line_items?.length) {
    await db.execute("DELETE FROM invoice_line_items WHERE invoice_id = ?", [
      req.params.id,
    ]);
    for (const item of line_items) {
      await db.execute(
        "INSERT INTO invoice_line_items (invoice_id, product_type, service_type, description, quantity, price) VALUES (?, ?, ?, ?, ?, ?)",
        [
          req.params.id,
          item.product_type || null,
          item.service_type || null,
          item.description || null,
          item.quantity || 1,
          item.price || 0,
        ],
      );
    }
  }
  res
    .status(200)
    .json({ success: true, message: "Invoice updated successfully" });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const [existing] = await db.execute("SELECT id FROM invoices WHERE id = ?", [
    req.params.id,
  ]);
  if (existing.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });
  await db.execute("DELETE FROM invoice_line_items WHERE invoice_id = ?", [
    req.params.id,
  ]);
  await db.execute("DELETE FROM invoices WHERE id = ?", [req.params.id]);
  res
    .status(200)
    .json({ success: true, message: "Invoice deleted successfully" });
});

export const archiveInvoice = asyncHandler((req, res) =>
  updateStatus(res, req.params.id, "archived", "Invoice is already archived"),
);
export const restoreInvoice = asyncHandler((req, res) =>
  updateStatus(res, req.params.id, "unpaid", "Invoice is already active"),
);
export const markAsPaid = asyncHandler((req, res) =>
  updateStatus(res, req.params.id, "paid", "Invoice is already paid"),
);
export const markAsUnpaid = asyncHandler((req, res) =>
  updateStatus(res, req.params.id, "unpaid", "Invoice is already unpaid"),
);
