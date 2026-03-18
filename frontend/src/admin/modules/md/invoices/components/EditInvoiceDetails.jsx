import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useInvoices } from "../context/InvoiceContext";
import { invoiceAPI } from "../services/invoiceAPI";

const EMPTY_ITEM = {
  product_type: "",
  service_type: "",
  description: "",
  quantity: 1,
  price: "",
};

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

// ── Loading state ───────────────────────────────────────────────
const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p className="mt-4 text-gray-600">Loading invoice...</p>
    </div>
  </div>
);

// ── Main component ──────────────────────────────────────────────
const EditInvoiceDetails = () => {
  const { invoice_number } = useParams();
  const { updateInvoice } = useInvoices();
  const navigate = useNavigate();

  const [invoiceId, setInvoiceId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    due_date: "",
    notes: "",
  });
  const [lineItems, setLineItems] = useState([{ ...EMPTY_ITEM }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  // ── Load existing invoice ───────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await invoiceAPI.getById(invoice_number);
        if (res.data.success) {
          const inv = res.data.data;
          setInvoiceId(inv.id);
          setForm({
            name: inv.name || "",
            email: inv.email || "",
            contact: inv.contact || "",
            due_date: inv.due_date
              ? new Date(inv.due_date).toISOString().split("T")[0]
              : "",
            notes: inv.notes || "",
          });
          setLineItems(
            inv.line_items?.length > 0
              ? inv.line_items.map((item) => ({
                  product_type: item.product_type || "",
                  service_type: item.service_type || "",
                  description: item.description || "",
                  quantity: item.quantity || 1,
                  price: item.price || "",
                }))
              : [{ ...EMPTY_ITEM }],
          );
        }
      } catch (err) {
        console.error("Error loading invoice:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoice_number]);

  // ── Form handlers ───────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addLineItem = () =>
    setLineItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Computed ────────────────────────────────────────────────────
  const subtotal = lineItems.reduce(
    (sum, item) =>
      sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
    0,
  );

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Customer name is required.");
    if (lineItems.some((item) => !item.price))
      return alert("All line items must have a price.");

    setSaving(true);
    const result = await updateInvoice(invoiceId, {
      ...form,
      line_items: lineItems,
    });
    setSaving(false);

    if (result.success) {
      alert("Invoice updated successfully.");
      navigate(`${basePath}/invoices/view/${invoice_number}`);
    } else {
      alert("Failed to update invoice: " + result.message);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="pb-6">
      <form onSubmit={handleSubmit}>
        <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
            <div className="flex-1 pb-5 px-4 sm:px-6">
              <h2 className="text-lg font-bold">Edit Invoice</h2>
              <p className="text-xs text-gray-600">
                Update the details for {invoice_number}.
              </p>
            </div>
            <div className="flex text-xs gap-3 flex-shrink-0 px-4 sm:px-6">
              <Link
                to={`${basePath}/invoices/view/${invoice_number}`}
                className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancel</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="px-4 sm:px-6 space-y-8">
            {/* Customer Information */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="e.g. Juan dela Cruz"
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. juan@email.com"
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Number</label>
                  <input
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 09XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input
                    name="due_date"
                    type="date"
                    value={form.due_date}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Line Items
                </h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-3 text-xs bg-black hover:bg-gray-800 text-white rounded-md px-4 py-3 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-gray-500">
                        Item {index + 1}
                      </p>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Product Type</label>
                        <input
                          value={item.product_type}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "product_type",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                          placeholder="e.g. Tarpaulin"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Service Type</label>
                        <input
                          value={item.service_type}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "service_type",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                          placeholder="e.g. Printing"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Description</label>
                        <input
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                          placeholder="Optional description"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Price (PHP) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(index, "price", e.target.value)
                          }
                          className={inputClass}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="mt-4 flex justify-end">
                <div className="w-full md:w-72 border border-gray-200 rounded-lg p-4 bg-white space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">
                      ₱{" "}
                      {subtotal.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>
                      ₱{" "}
                      {subtotal.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Additional Notes
              </h3>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder="Optional notes for this invoice..."
              />
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
          <div className="flex justify-end items-end text-xs gap-2">
            <div className="flex flex-wrap text-xs gap-3 flex-shrink-0">
              <button
                type="submit"
                disabled={saving}
                className="bg-black hover:bg-gray-800 text-white rounded-md px-4 md:px-6 py-3 hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span className="font-medium">Save Changes</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditInvoiceDetails;
