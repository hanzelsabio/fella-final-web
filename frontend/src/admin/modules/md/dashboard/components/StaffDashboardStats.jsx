import { Link } from "react-router-dom";
import { useProducts } from "../../../pms/products/context/ProductContext";
import { useInventory } from "../../../oms/inventory/context/InventoryContext";
import { useCustomer } from "../../../oms/customer/context/CustomerContext";
import { useInquiries } from "../../../md/inquiries/context/InquiryContext";
import { useInvoices } from "../../../md/invoices/context/InvoiceContext";
import { useAuth } from "../../../../../modules/auth/context/AuthContext";
import { AlertTriangle, Clock } from "lucide-react";

const StaffDashboardStats = () => {
  const { products } = useProducts();
  const { inventory } = useInventory();
  const { customers } = useCustomer();
  const { inquiries } = useInquiries();
  const { invoices } = useInvoices();
  const { staff } = useAuth();

  const displayName = staff
    ? `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim() ||
      staff.username
    : "User";

  // ── Stats — no System Users, Inventory, Suppliers ──────────────
  const stats = [
    {
      label: "Active Product",
      value: products.filter((p) => p.status === "active").length,
      to: "/staff/products",
    },
    {
      label: "Listed Items",
      value: inventory.length,
      to: "/staff/inventory",
    },
    {
      label: "Listed Customer",
      value: customers.length,
      to: "/staff/customers",
    },
    {
      label: "Total Inquiries",
      value: inquiries.filter((i) => i.status !== "archived").length,
      to: "/staff/inquiries",
    },
  ];

  // ── Alerts ──────────────────────────────────────────────────────
  const highPriorityInquiries = inquiries.filter(
    (i) => i.priority?.toLowerCase() === "high" && i.status === "pending",
  );

  const unpaidInvoices = invoices.filter((i) => i.status === "unpaid");

  // ── Recent (latest 5, excluding archived) ───────────────────────
  const recentInvoices = [...invoices]
    .filter((i) => i.status !== "archived")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const recentInquiries = [...inquiries]
    .filter((i) => i.status !== "archived")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-600",
      responded: "bg-blue-100 text-blue-600",
      cancelled: "bg-orange-100 text-orange-600",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      {/* Welcome */}
      <h1 className="text-lg">
        Hi, <span className="font-semibold">{displayName}</span>. Welcome back!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="border border-gray-200 bg-white rounded-lg p-4 md:p-5 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <p className="text-xs md:text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">
              {item.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* High Priority Inquiries */}
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-red-700">
              High Priority Inquiries
            </h3>
            <span className="ml-auto text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {highPriorityInquiries.length}
            </span>
          </div>
          {highPriorityInquiries.length > 0 ? (
            <ul className="space-y-2">
              {highPriorityInquiries.slice(0, 4).map((inq) => (
                <li key={inq.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/staff/inquiries/view/${inq.inquiry_number}`}
                      className="text-xs font-medium text-gray-900 underline"
                    >
                      {inq.inquiry_number}
                    </Link>
                    <p className="text-xs text-gray-500">{inq.name || "N/A"}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
              {highPriorityInquiries.length > 4 && (
                <li>
                  <Link
                    to="/staff/inquiries"
                    className="text-xs text-red-600 hover:underline"
                  >
                    +{highPriorityInquiries.length - 4} more
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-red-400">No high priority inquiries.</p>
          )}
        </div>

        {/* Unpaid Invoices */}
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-yellow-700">
              Unpaid Invoices
            </h3>
            <span className="ml-auto text-xs font-medium bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
              {unpaidInvoices.length}
            </span>
          </div>
          {unpaidInvoices.length > 0 ? (
            <ul className="space-y-2">
              {unpaidInvoices.slice(0, 4).map((inv) => (
                <li key={inv.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/staff/invoices/view/${inv.invoice_number}`}
                      className="text-xs font-medium text-gray-900 underline"
                    >
                      {inv.invoice_number}
                    </Link>
                    <p className="text-xs text-gray-500">{inv.name || "N/A"}</p>
                  </div>
                  <span className="text-xs font-medium text-yellow-700">
                    ₱{" "}
                    {parseFloat(inv.total || 0).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </li>
              ))}
              {unpaidInvoices.length > 4 && (
                <li>
                  <Link
                    to="/staff/invoices"
                    className="text-xs text-yellow-600 hover:underline"
                  >
                    +{unpaidInvoices.length - 4} more
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-yellow-500">All invoices are settled.</p>
          )}
        </div>
      </div>

      {/* Recent Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Inquiries */}
        <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Recent Inquiries
            </h3>
            <Link
              to="/staff/inquiries"
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-0.5">
                    <Link
                      to={`/staff/inquiries/view/${inq.inquiry_number}`}
                      className="text-sm font-medium text-gray-900 underline"
                    >
                      {inq.inquiry_number}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {inq.name || "N/A"} — {inq.product_type || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(inq.status)}
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 sm:px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No recent inquiries.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Recent Invoices
            </h3>
            <Link
              to="/staff/invoices"
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-0.5">
                    <Link
                      to={`/staff/invoices/view/${inv.invoice_number}`}
                      className="text-sm font-medium text-gray-900 underline"
                    >
                      {inv.invoice_number}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {inv.name || "N/A"}
                      {inv.due_date
                        ? ` — Due ${new Date(inv.due_date).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === "paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}
                    >
                      {inv.status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      ₱{" "}
                      {parseFloat(inv.total || 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 sm:px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No recent invoices.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardStats;
