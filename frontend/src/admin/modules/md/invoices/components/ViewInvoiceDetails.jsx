import { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Printer, SquarePen } from "lucide-react";
import { invoiceAPI } from "../services/invoiceAPI";

// ── Constants ───────────────────────────────────────────────────
const STATUS_STYLES = {
  paid: "bg-green-100 text-green-600",
  unpaid: "bg-yellow-100 text-yellow-600",
  archived: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS = {
  paid: "Paid",
  unpaid: "Unpaid",
  archived: "Archived",
};

const PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1a1a;
    padding: 48px 52px;
    font-size: 13px;
    line-height: 1.6;
  }

  .invoice-wrap { max-width: 680px; margin: 0 auto; }

  .inv-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
  }
  .inv-logo { height: 52px; object-fit: contain; }
  .inv-company { text-align: right; }
  .inv-company-name {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #1a1a1a;
    letter-spacing: -0.3px;
  }
  .inv-company-sub {
    font-size: 11px;
    color: #888;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  .inv-title-strip {
    background: #1a1a1a;
    color: #fff;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 6px;
    margin-bottom: 32px;
  }
  .inv-title-strip h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: -0.2px;
  }
  .inv-number { font-size: 13px; color: #aaa; letter-spacing: 0.5px; }

  .inv-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    margin-bottom: 32px;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    overflow: hidden;
  }
  .inv-info-cell {
    padding: 14px 18px;
    border-right: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
  }
  .inv-info-cell:nth-child(even) { border-right: none; }
  .inv-info-cell:nth-last-child(-n+2) { border-bottom: none; }
  .inv-info-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #999;
    margin-bottom: 4px;
  }
  .inv-info-value { font-size: 13px; color: #1a1a1a; font-weight: 500; }

  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
  }
  .badge-paid     { background: #e6f4ea; color: #1e7e34; }
  .badge-unpaid   { background: #fff8e1; color: #b45309; }
  .badge-archived { background: #f3f4f6; color: #6b7280; }

  .inv-section-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #999;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e8e8e8;
  }

  .table-wrap {
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #f7f7f7; }
  th {
    padding: 10px 14px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #888;
    font-weight: 500;
    text-align: left;
    border-bottom: 1px solid #e8e8e8;
  }
  th.r { text-align: right; }
  th.c { text-align: center; }
  td {
    padding: 12px 14px;
    font-size: 13px;
    color: #333;
    border-bottom: 1px solid #f2f2f2;
    vertical-align: top;
  }
  td.r { text-align: right; }
  td.c { text-align: center; }
  td.primary { color: #1a1a1a; font-weight: 500; }
  tbody tr:last-child td { border-bottom: none; }

  .total-section { display: flex; justify-content: flex-end; margin-bottom: 32px; }
  .total-box { width: 260px; border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #1a1a1a;
  }
  .total-label { font-size: 12px; color: #aaa; text-transform: uppercase; letter-spacing: 0.8px; }
  .total-amount { font-size: 16px; font-weight: 600; color: #1a1a1a; }

  .notes-box {
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 14px 18px;
    margin-bottom: 32px;
  }
  .notes-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 6px; }
  .notes-text { font-size: 12px; color: #555; white-space: pre-wrap; line-height: 1.7; }

  .inv-footer {
    border-top: 1px solid #e8e8e8;
    padding-top: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .inv-footer-brand { font-family: 'DM Serif Display', serif; font-size: 13px; color: #bbb; }
  .inv-footer-date  { font-size: 11px; color: #bbb; }
`;

// ── Small UI components ─────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

const InfoField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {label}
    </label>
    <div className="text-sm text-gray-900">{children}</div>
  </div>
);

const Divider = () => <hr className="border-gray-200 mb-6" />;

// ── Loading / Not Found states ──────────────────────────────────
const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p className="mt-4 text-gray-600">Loading invoice...</p>
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="flex items-center justify-center h-64 m-20">
    <div className="text-sm text-center">
      <p className="text-gray-600">Invoice not found</p>
      <Link
        to={`${basePath}/invoices`}
        className="mt-4 inline-block text-blue-600 hover:text-blue-800"
      >
        Back to Invoices
      </Link>
    </div>
  </div>
);

// ── Main component ──────────────────────────────────────────────
const ViewInvoiceDetails = () => {
  const { invoice_number } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef(null);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await invoiceAPI.getById(invoice_number);
        if (res.data.success) setInvoice(res.data.data);
      } catch (err) {
        console.error("Error fetching invoice:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoice_number]);

  // ── Computed ────────────────────────────────────────────────────
  const total =
    invoice?.line_items?.reduce(
      (sum, item) =>
        sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      0,
    ) ?? 0;

  // ── Handlers ────────────────────────────────────────────────────
  const handleSendViaEmail = () => {
    const to = encodeURIComponent(invoice.email || "");
    const isPaid = invoice.status === "paid";

    const subject = encodeURIComponent(
      isPaid
        ? `Receipt Confirmed: Invoice #${invoice.invoice_number} - Fella Screen Prints`
        : `Invoice #${invoice.invoice_number} - Payment Due | Fella Screen Prints`,
    );

    const body = encodeURIComponent(
      isPaid
        ? `Hi ${invoice.name},\n\nThank you for your payment! We're happy to confirm that Invoice #${invoice.invoice_number} has been fully settled.\n\nInvoice Number: ${invoice.invoice_number}\nAmount Paid: ₱ ${total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\nPayment Status: Paid\n\nWe appreciate your business and look forward to working with you again.\n\nWarm regards,\nFella Screen Prints`
        : `Hi ${invoice.name},\n\nThis is a friendly reminder that Invoice #${invoice.invoice_number} is currently due for payment.\n\nInvoice Number: ${invoice.invoice_number}\nAmount Due: ₱ ${total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\nDue Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}\nPayment Status: Unpaid\n\nPlease settle at your earliest convenience. If you have any questions, feel free to reach out.\n\nThank you,\nFella Screen Prints`,
    );

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>${PRINT_STYLES}</style>
        </head>
        <body>
          <div class="invoice-wrap">
            <div class="inv-header">
              <img class="inv-logo" src="/fella-screen-prints-logo.png" alt="Fella Screen Prints" />
              <div class="inv-company">
                <div class="inv-company-name">Fella Screen Prints</div>
                <div class="inv-company-sub">Official Invoice</div>
              </div>
            </div>

            <div class="inv-title-strip">
              <h1>Invoice</h1>
              <span class="inv-number">${invoice.invoice_number}</span>
            </div>

            <div class="inv-info-grid">
              <div class="inv-info-cell">
                <div class="inv-info-label">Customer Name</div>
                <div class="inv-info-value">${invoice.name || "N/A"}</div>
              </div>
              <div class="inv-info-cell">
                <div class="inv-info-label">Status</div>
                <div class="inv-info-value">
                  <span class="badge badge-${invoice.status}">${STATUS_LABELS[invoice.status] || invoice.status}</span>
                </div>
              </div>
              <div class="inv-info-cell">
                <div class="inv-info-label">Email Address</div>
                <div class="inv-info-value">${invoice.email || "N/A"}</div>
              </div>
              <div class="inv-info-cell">
                <div class="inv-info-label">Contact Number</div>
                <div class="inv-info-value">${invoice.contact || "N/A"}</div>
              </div>
              <div class="inv-info-cell">
                <div class="inv-info-label">Due Date</div>
                <div class="inv-info-value">${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</div>
              </div>
              <div class="inv-info-cell">
                <div class="inv-info-label">Invoice Date</div>
                <div class="inv-info-value">${new Date(invoice.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div class="inv-section-label">Line Items</div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product Type</th>
                    <th>Service Type</th>
                    <th>Description</th>
                    <th class="c">Qty</th>
                    <th class="r">Price</th>
                    <th class="r">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    invoice.line_items?.length > 0
                      ? invoice.line_items
                          .map(
                            (item) => `
                        <tr>
                          <td class="primary">${item.product_type || "N/A"}</td>
                          <td>${item.service_type || "N/A"}</td>
                          <td>${item.description || "—"}</td>
                          <td class="c">${item.quantity}</td>
                          <td class="r">₱ ${parseFloat(item.price).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td class="r primary">₱ ${(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>`,
                          )
                          .join("")
                      : `<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px;">No line items found.</td></tr>`
                  }
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <div class="total-box">
                <div class="total-row">
                  <span class="total-label">Total Due</span>
                  <span class="total-amount ">₱ ${total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            ${
              invoice.notes
                ? `
              <div class="notes-box">
                <div class="notes-label">Notes</div>
                <div class="notes-text">${invoice.notes}</div>
              </div>`
                : ""
            }

            <div class="inv-footer">
              <span class="inv-footer-brand">Fella Screen Prints</span>
              <span class="inv-footer-date">Created ${new Date(invoice.created_at).toLocaleString()}</span>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  // ── Render guards ───────────────────────────────────────────────
  if (loading) return <LoadingState />;
  if (!invoice) return <NotFoundState />;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Page header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-lg font-bold">Invoice Details</h2>
            <p className="text-xs text-gray-600">
              View complete invoice information
            </p>
          </div>
          <div className="flex text-xs gap-3 flex-shrink-0 px-4 sm:px-6">
            <button
              onClick={handlePrint}
              className="bg-white border border-gray-400 text-black rounded-md px-3 md:px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </div>
            </button>
            <Link
              to={`${basePath}/invoices/edit/${invoice.invoice_number}`}
              className="bg-white border border-gray-400 text-black rounded-md px-3 md:px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SquarePen className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </div>
            </Link>
            <Link
              to={`${basePath}/invoices`}
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-8">
          {/* ── Printable / PDF capture area ── */}
          <div ref={printRef} className="bg-white p-2">
            {/* Logo + company */}
            <div className="flex justify-between items-start mb-8">
              <img
                src="/fella-screen-prints-logo.png"
                alt="Fella Screen Prints"
                className="h-14 object-contain"
                crossOrigin="anonymous"
              />
              <div className="text-right">
                <p
                  style={{ fontFamily: "Georgia, serif" }}
                  className="text-lg font-semibold text-gray-900 tracking-tight"
                >
                  Fella Screen Prints
                </p>
                <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">
                  Official Invoice
                </p>
              </div>
            </div>

            {/* Invoice title strip */}
            <div className="flex justify-between items-center text-black py-3.5 rounded-md mb-8">
              <p className="text-base font-normal tracking-tight">Invoice</p>
              <p className="text-sm text-gray-600 tracking-wide">
                {invoice.invoice_number}
              </p>
            </div>

            {/* Info grid */}
            <div className="border border-gray-200 rounded-md overflow-hidden mb-8">
              {[
                { label: "Customer Name", value: invoice.name || "N/A" },
                {
                  label: "Status",
                  value: <StatusBadge status={invoice.status} />,
                },
                { label: "Email Address", value: invoice.email || "N/A" },
                { label: "Contact Number", value: invoice.contact || "N/A" },
                {
                  label: "Due Date",
                  value: invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString()
                    : "N/A",
                },
                {
                  label: "Invoice Date",
                  value: new Date(invoice.created_at).toLocaleDateString(),
                },
              ]
                .reduce((rows, item, i, arr) => {
                  if (i % 2 === 0) rows.push(arr.slice(i, i + 2));
                  return rows;
                }, [])
                .map((pair, rowIdx, allRows) => (
                  <div
                    key={rowIdx}
                    className={`grid grid-cols-2 ${rowIdx < allRows.length - 1 ? "border-b border-gray-200" : ""}`}
                  >
                    {pair.map((cell, colIdx) => (
                      <div
                        key={colIdx}
                        className={`px-4 py-3 ${colIdx === 0 ? "border-r border-gray-200" : ""}`}
                      >
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                          {cell.label}
                        </p>
                        <div className="text-sm font-medium text-gray-900">
                          {cell.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>

            {/* Line items section label */}
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2.5 pb-1.5 border-b border-gray-200">
              Line Items
            </p>

            {/* Line items table */}
            <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {[
                      { label: "Product Type", cls: "text-left" },
                      { label: "Service Type", cls: "text-left" },
                      { label: "Description", cls: "text-left" },
                      { label: "Qty", cls: "text-center" },
                      { label: "Price", cls: "text-right" },
                      { label: "Subtotal", cls: "text-right" },
                    ].map((h) => (
                      <th
                        key={h.label}
                        className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200 ${h.cls}`}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items?.length > 0 ? (
                    invoice.line_items.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-t border-gray-100 first:border-t-0"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.product_type || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {item.service_type || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {item.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-right">
                          ₱{" "}
                          {parseFloat(item.price).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 text-right">
                          ₱{" "}
                          {(
                            parseFloat(item.price) * parseInt(item.quantity)
                          ).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-6 text-center text-gray-400"
                      >
                        No line items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-8">
              <div className="w-64 rounded-md overflow-hidden border border-gray-200">
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-xs uppercase tracking-widest text-black">
                    Total Due
                  </span>
                  <span className="text-base font-semibold text-black">
                    ₱{" "}
                    {total.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3.5 mb-8">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  Notes
                </p>
                <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                  {invoice.notes}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <p
                style={{ fontFamily: "Georgia, serif" }}
                className="text-sm text-gray-600"
              >
                Fella Screen Prints
              </p>
              <p className="text-xs text-gray-400">
                Created {new Date(invoice.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          {/* ── End printable area ── */}

          {/* Send via Email — outside print area */}
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSendViaEmail}
              disabled={!invoice.email}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Send via Email</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoiceDetails;
