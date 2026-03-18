import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { useInvoices } from "../context/InvoiceContext";

const InvoiceStats = () => {
  const { invoices } = useInvoices();

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  // ── Computed stats ──────────────────────────────────────────────
  const activeInvoices = invoices.filter((i) => i.status !== "archived");

  const totalPayout = activeInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + parseFloat(i.total || 0), 0);

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dueIn30 = activeInvoices
    .filter((i) => {
      if (i.status !== "unpaid" || !i.due_date) return false;
      const due = new Date(i.due_date);
      return due >= now && due <= in30Days;
    })
    .reduce((sum, i) => sum + parseFloat(i.total || 0), 0);

  const upcomingPayout = activeInvoices
    .filter((i) => i.status === "unpaid")
    .reduce((sum, i) => sum + parseFloat(i.total || 0), 0);

  // Average days to get paid — compares created_at vs updated_at for paid invoices
  const paidInvoices = activeInvoices.filter((i) => i.status === "paid");
  const avgDaysToPay = (() => {
    if (paidInvoices.length === 0) return null;
    const totalDays = paidInvoices.reduce((sum, i) => {
      const created = new Date(i.created_at);
      const updated = new Date(i.updated_at);
      return (
        sum +
        Math.max(0, Math.round((updated - created) / (1000 * 60 * 60 * 24)))
      );
    }, 0);
    return Math.round(totalDays / paidInvoices.length);
  })();

  const formatPHP = (amount) =>
    `₱ ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    {
      label: "Total Payout",
      value: formatPHP(totalPayout),
    },
    {
      label: "Due within 30 days",
      value: formatPHP(dueIn30),
    },
    {
      label: "Avg. time to get paid",
      value:
        avgDaysToPay !== null
          ? `${avgDaysToPay} day${avgDaysToPay !== 1 ? "s" : ""}`
          : "N/A",
    },
    {
      label: "Upcoming Payout",
      value: formatPHP(upcomingPayout),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      {/* Header */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Overview</h2>
            <p className="text-xs text-gray-600">
              Monitor and manage your invoices here.
            </p>
          </div>
          <div className="flex text-xs gap-3 flex-shrink-0 self-end sm:self-auto">
            <Link
              to={`${basePath}/invoices/new`}
              className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-3"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Create an Invoice</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 bg-white rounded-lg p-4 md:p-5"
          >
            <p className="text-xs md:text-sm text-gray-500">{item.label}</p>
            <p className="text-xl md:text-2xl font-medium mt-1 md:mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceStats;
