import db from "../config/database.js";

// ── Helpers ──────────────────────────────────────────────────────

const generateInvoiceNumber = async () => {
  const [rows] = await db.query(
    "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "INV-0001";
  const last = rows[0].invoice_number; // e.g. "INV-0042"
  const num = parseInt(last.split("-")[1], 10) + 1;
  return `INV-${String(num).padStart(4, "0")}`;
};

const updateStatus = async (res, id, newStatus, alreadyMsg) => {
  const [existing] = await db.query(
    "SELECT id, status FROM invoices WHERE id = ?",
    [id],
  );
  if (existing.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });
  if (existing[0].status === newStatus)
    return res.status(400).json({ success: false, message: alreadyMsg });
  await db.query(
    "UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?",
    [newStatus, id],
  );
  return res.status(200).json({
    success: true,
    message: `Invoice marked as ${newStatus}`,
    status: newStatus,
  });
};

// ── Controllers ──────────────────────────────────────────────────

export const getAllInvoices = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        i.id, i.invoice_number, i.name, i.email, i.contact,
        i.due_date, i.status, i.notes, i.created_at, i.updated_at,
        COALESCE(SUM(li.price * li.quantity), 0) AS total
       FROM invoices i
       LEFT JOIN invoice_line_items li ON li.invoice_id = i.id
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoices" });
  }
};

export const getInvoiceById = async (req, res) => {
  const { id } = req.params; // "id" here is actually the invoice_number value from the URL
  try {
    const [invoiceRows] = await db.query(
      `SELECT id, invoice_number, name, email, contact,
              due_date, status, notes, created_at, updated_at
       FROM invoices WHERE invoice_number = ?`, // ← changed from id to invoice_number
      [id],
    );
    if (invoiceRows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    const [lineItems] = await db.query(
      `SELECT id, product_type, service_type, description, quantity, price
       FROM invoice_line_items WHERE invoice_id = ?`,
      [invoiceRows[0].id], // ← still use the actual DB id for the join
    );

    return res.status(200).json({
      success: true,
      data: { ...invoiceRows[0], line_items: lineItems },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoice" });
  }
};

export const createInvoice = async (req, res) => {
  const { name, email, contact, due_date, notes, line_items } = req.body;

  if (!name || !line_items || line_items.length === 0)
    return res.status(400).json({
      success: false,
      message: "Name and at least one line item are required",
    });

  try {
    const invoice_number = await generateInvoiceNumber();
    const [result] = await db.query(
      `INSERT INTO invoices (invoice_number, name, email, contact, due_date, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'unpaid', NOW(), NOW())`,
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
      await db.query(
        `INSERT INTO invoice_line_items (invoice_id, product_type, service_type, description, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?)`,
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

    return res.status(201).json({
      success: true,
      message: "Invoice created",
      data: { id: invoiceId, invoice_number },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create invoice" });
  }
};

export const updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { name, email, contact, due_date, notes, line_items } = req.body;

  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Customer name is required" });

  try {
    const [existing] = await db.query("SELECT id FROM invoices WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    await db.query(
      `UPDATE invoices SET name = ?, email = ?, contact = ?, due_date = ?, notes = ?, updated_at = NOW() WHERE id = ?`,
      [
        name,
        email || null,
        contact || null,
        due_date || null,
        notes || null,
        id,
      ],
    );

    if (line_items && line_items.length > 0) {
      await db.query("DELETE FROM invoice_line_items WHERE invoice_id = ?", [
        id,
      ]);
      for (const item of line_items) {
        await db.query(
          `INSERT INTO invoice_line_items (invoice_id, product_type, service_type, description, quantity, price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.product_type || null,
            item.service_type || null,
            item.description || null,
            item.quantity || 1,
            item.price || 0,
          ],
        );
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Invoice updated successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update invoice" });
  }
};

export const deleteInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await db.query("SELECT id FROM invoices WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    await db.query("DELETE FROM invoice_line_items WHERE invoice_id = ?", [id]);
    await db.query("DELETE FROM invoices WHERE id = ?", [id]);
    return res
      .status(200)
      .json({ success: true, message: "Invoice deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete invoice" });
  }
};

export const archiveInvoice = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "archived",
      "Invoice is already archived",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to archive invoice" });
  }
};

export const restoreInvoice = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "unpaid",
      "Invoice is already active",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to restore invoice" });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "paid",
      "Invoice is already paid",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark as paid" });
  }
};

export const markAsUnpaid = async (req, res) => {
  try {
    return await updateStatus(
      res,
      req.params.id,
      "unpaid",
      "Invoice is already unpaid",
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark as unpaid" });
  }
};
