import { Link } from "react-router-dom";
import { CheckCheck } from "lucide-react";
import { useInvoices } from "../context/InvoiceContext";

import useBasePath from "../../../../components/hooks/useBasePath";
import useTableFilter from "../../../../components/hooks/useTableFilter";
import useTableSort from "../../../../components/hooks/useTableSort";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

import TableLayout from "../../../../components/common/TableLayout";
import TableHead from "../../../../components/common/TableHead";
import TableRow from "../../../../components/common/TableRow";
import TableEmptyState from "../../../../components/common/TableEmptyState";
import DateCell from "../../../../components/common/DateCell";
import Td from "../../../../components/common/Td";
import InvoiceDropdown from "../../../../components/common/Dropdown/ActionsDropdown/InvoiceDropdown";

// ── Invoice-specific status badge ────────────────────────────────────────────
const INVOICE_STATUS_STYLES = {
  paid: "bg-green-100 text-green-600",
  unpaid: "bg-yellow-100 text-yellow-600",
  archived: "bg-gray-100 text-gray-600",
};

const InvoiceStatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${INVOICE_STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}
  >
    {status}
  </span>
);

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "archived", label: "Archived" },
];

const COLUMNS = [
  {
    label: "Invoice Number",
    column: "invoice_number",
    minWidth: "min-w-[180px]",
  },
  { label: "Customer", column: "name", minWidth: "min-w-[200px]" },
  { label: "Created On", column: "created_at", minWidth: "min-w-[180px]" },
  { label: "Due Date", column: "due_date", minWidth: "min-w-[180px]" },
  {
    label: "Total",
    column: "total",
    minWidth: "min-w-[150px]",
    sortable: false,
  },
  {
    label: "Status",
    column: "status",
    minWidth: "min-w-[150px]",
    sortable: false,
  },
];

const SORT_CONFIG = [
  { key: "invoice_number", type: "string" },
  { key: "name", type: "string" },
  { key: "due_date", type: "date" },
  { key: "created_at", type: "date" },
];

const InvoiceTable = () => {
  const {
    invoices,
    deleteInvoice,
    archiveInvoice,
    restoreInvoice,
    markAsPaid,
    markAsUnpaid,
  } = useInvoices();
  const basePath = useBasePath();

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

  const filtered = useTableFilter(invoices, searchTerm, statusFilter, [
    "invoice_number",
    "name",
  ]);
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const {
    totalPages,
    startIndex,
    currentItems: currentInvoices,
  } = paginate(sorted);
  const isAllSelected =
    currentInvoices.length > 0 &&
    selectedItems.length === currentInvoices.length;

  // ── Bulk labels ──────────────────────────────────────────────────────────
  const bulkArchiveLabel = (() => {
    if (!selectedItems.length) return "Archive";
    return invoices.find((i) => i.id === selectedItems[0])?.status ===
      "archived"
      ? "Unarchive"
      : "Archive";
  })();

  const bulkPaidLabel = (() => {
    if (!selectedItems.length) return "Mark as Paid";
    return invoices.find((i) => i.id === selectedItems[0])?.status === "paid"
      ? "Mark as Unpaid"
      : "Mark as Paid";
  })();

  // ── Bulk actions ─────────────────────────────────────────────────────────
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

  // ── Row actions ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this invoice?")) {
      const result = await deleteInvoice(id);
      alert(result.success ? "Invoice deleted." : "Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const isArchived = invoices.find((i) => i.id === id)?.status === "archived";
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

  return (
    <div className="pb-4">
      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by invoice number, customer name..."
        filters={[
          {
            value: statusFilter,
            onChange: handleStatusChange,
            options: STATUS_OPTIONS,
            placeholder: "All Status",
          },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        totalItems={sorted.length}
        itemLabel="invoices"
        onPrevious={goToPrevious}
        onNext={() => goToNext(totalPages)}
        onGoToPage={goToPage}
        getPageNumbers={getPageNumbers}
        bulkCount={selectedItems.length}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
        bulkArchiveLabel={bulkArchiveLabel}
        bulkExtraActions={[
          {
            label: bulkPaidLabel,
            icon: CheckCheck,
            onClick: handleBulkPaid,
            className: "bg-green-500 hover:bg-green-600",
          },
        ]}
        thead={
          <TableHead
            columns={COLUMNS}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll(currentInvoices)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentInvoices.length > 0 ? (
              currentInvoices.map((invoice, index) => (
                <TableRow
                  key={invoice.id}
                  id={invoice.id}
                  isLast={index === currentInvoices.length - 1}
                  isSelected={selectedItems.includes(invoice.id)}
                  onSelect={() => handleSelectOne(invoice.id)}
                  actions={
                    <InvoiceDropdown
                      invoiceId={invoice.id}
                      invoiceNumber={invoice.invoice_number}
                      status={invoice.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                      onMarkAsPaid={handleMarkAsPaid}
                      onMarkAsUnpaid={handleMarkAsUnpaid}
                    />
                  }
                >
                  <Td>
                    <Link
                      to={`${basePath}/invoices/view/${invoice.invoice_number}`}
                      className="text-sm font-medium underline text-gray-900"
                    >
                      {invoice.invoice_number || "N/A"}
                    </Link>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {invoice.name || "N/A"}
                    </p>
                  </Td>
                  <Td>
                    <DateCell value={invoice.created_at} />
                  </Td>
                  <Td>
                    <DateCell value={invoice.due_date} />
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      ₱{" "}
                      {parseFloat(invoice.total || 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </Td>
                  <Td>
                    <InvoiceStatusBadge status={invoice.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                title="No invoices found matching your search criteria."
                colSpan={8}
              />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default InvoiceTable;
