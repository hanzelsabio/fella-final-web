import { Link, useLocation } from "react-router-dom";
import { useInvoices } from "../context/InvoiceContext";
import { Search, Filter, CheckCheck } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import InvoiceDropdown from "../../../../components/common/Dropdown/ActionsDropdown/InvoiceDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const InvoiceTable = () => {
  const {
    invoices,
    deleteInvoice,
    archiveInvoice,
    restoreInvoice,
    markAsPaid,
    markAsUnpaid,
  } = useInvoices();

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  const {
    searchTerm,
    statusFilter,
    currentPage,
    sortColumn,
    sortOrder,
    selectedItems,
    setSelectedItems,
    handleSort,
    handleSearchChange,
    handleStatusChange,
    goToPage,
    goToPrevious,
    goToNext,
    paginate,
    getPageNumbers,
    handleSelectAll,
    handleSelectOne,
  } = usePaginatedTable({
    data: invoices,
    defaultSortColumn: "created_at",
    defaultSortOrder: "desc",
    defaultStatusFilter: "all",
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch &&
      (statusFilter === "all" || invoice.status === statusFilter)
    );
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "invoice_number":
        valA = a.invoice_number?.toLowerCase() ?? "";
        valB = b.invoice_number?.toLowerCase() ?? "";
        break;
      case "name":
        valA = a.name?.toLowerCase() ?? "";
        valB = b.name?.toLowerCase() ?? "";
        break;
      case "due_date":
        valA = new Date(a.due_date ?? 0);
        valB = new Date(b.due_date ?? 0);
        break;
      case "created_at":
      default:
        valA = new Date(a.created_at ?? 0);
        valB = new Date(b.created_at ?? 0);
        break;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const {
    totalPages,
    startIndex,
    currentItems: currentInvoices,
  } = paginate(sortedInvoices);
  const isAllSelected =
    currentInvoices.length > 0 &&
    selectedItems.length === currentInvoices.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk action labels ──────────────────────────────────────────
  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = invoices.find((i) => i.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  const bulkPaidLabel = (() => {
    if (!hasSelection) return "Mark as Paid";
    const first = invoices.find((i) => i.id === selectedItems[0]);
    return first?.status === "paid" ? "Mark as Unpaid" : "Mark as Paid";
  })();

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} invoice(s)?`)) return;
    for (const id of selectedItems) await deleteInvoice(id);
    setSelectedItems([]);
    alert("Selected invoices deleted.");
  };

  const handleBulkArchive = async () => {
    const first = invoices.find((i) => i.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedItems.length} invoice(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreInvoice(id);
      else await archiveInvoice(id);
    }
    setSelectedItems([]);
    alert(`Selected invoices ${action}d.`);
  };

  const handleBulkPaid = async () => {
    const first = invoices.find((i) => i.id === selectedItems[0]);
    const isPaid = first?.status === "paid";
    if (
      !window.confirm(
        `Mark ${selectedItems.length} invoice(s) as ${isPaid ? "unpaid" : "paid"}?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isPaid) await markAsUnpaid(id);
      else await markAsPaid(id);
    }
    setSelectedItems([]);
    alert(`Selected invoices marked as ${isPaid ? "unpaid" : "paid"}.`);
  };

  // ── Row-level handlers ──────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this invoice?")) {
      const result = await deleteInvoice(id);
      alert(result.success ? "Invoice deleted." : "Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const invoice = invoices.find((i) => i.id === id);
    const isArchived = invoice?.status === "archived";
    if (
      window.confirm(
        isArchived ? "Restore this invoice?" : "Archive this invoice?",
      )
    ) {
      const result = isArchived
        ? await restoreInvoice(id)
        : await archiveInvoice(id);
      alert(
        result.success
          ? `Invoice ${isArchived ? "restored" : "archived"}.`
          : "Failed: " + result.message,
      );
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (window.confirm("Mark as paid?")) {
      const result = await markAsPaid(id);
      alert(
        result.success
          ? "Invoice marked as paid."
          : "Failed: " + result.message,
      );
    }
  };

  const handleMarkAsUnpaid = async (id) => {
    if (window.confirm("Mark as unpaid?")) {
      const result = await markAsUnpaid(id);
      alert(
        result.success
          ? "Invoice marked as unpaid."
          : "Failed: " + result.message,
      );
    }
  };

  // ── Status badge ────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-green-100 text-green-600",
      unpaid: "bg-yellow-100 text-yellow-600",
      archived: "bg-gray-100 text-gray-600",
    };
    const labels = { paid: "Paid", unpaid: "Unpaid", archived: "Archived" };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="pb-4">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number, customer name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <CustomDropdown
              value={statusFilter}
              onChange={handleStatusChange}
              options={statusOptions}
              placeholder="All Status"
              icon={Filter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="min-w-[50px] px-6 pt-5 pb-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll(currentInvoices)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[180px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="invoice_number"
                    label="Invoice Number"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[200px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="name"
                    label="Customer"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[180px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="created_at"
                    label="Created On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[180px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="due_date"
                    label="Due Date"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Total
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold uppercase text-end" />
              </tr>
            </thead>
            <tbody>
              {currentInvoices.length > 0 ? (
                currentInvoices.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    className={`${index !== currentInvoices.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(invoice.id)}
                        onChange={() => handleSelectOne(invoice.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <Link
                        to={`${basePath}/invoices/view/${invoice.invoice_number}`}
                        className="text-sm font-medium underline text-gray-900"
                      >
                        {invoice.invoice_number || "N/A"}
                      </Link>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {invoice.name || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        ₱{" "}
                        {parseFloat(invoice.total || 0).toLocaleString(
                          "en-PH",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
                      <InvoiceDropdown
                        invoiceId={invoice.id}
                        invoiceNumber={invoice.invoice_number}
                        status={invoice.status}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onMarkAsPaid={handleMarkAsPaid}
                        onMarkAsUnpaid={handleMarkAsUnpaid}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 sm:px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      No invoices found matching your search criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          totalItems={sortedInvoices.length}
          itemLabel="invoices"
          onPrevious={goToPrevious}
          onNext={() => goToNext(totalPages)}
          onGoToPage={goToPage}
          getPageNumbers={getPageNumbers}
        />
      </div>

      {hasSelection && (
        <BulkActionBar
          count={selectedItems.length}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          archiveLabel={bulkArchiveLabel}
          extraActions={[
            {
              label: bulkPaidLabel,
              icon: CheckCheck,
              onClick: handleBulkPaid,
              className: "bg-green-500 hover:bg-green-600",
            },
          ]}
        />
      )}
    </div>
  );
};

export default InvoiceTable;
