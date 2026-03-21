import { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, SlidersHorizontal, CircleX, CheckCheck } from "lucide-react";
import { useInquiries } from "../context/InquiryContext.jsx";

import useBasePath from "../../../../components/hooks/useBasePath";
import useTableSort from "../../../../components/hooks/useTableSort";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

import TableLayout from "../../../../components/common/Table/TableLayout.jsx";
import TableHead from "../../../../components/common/Table/TableHead.jsx";
import TableRow from "../../../../components/common/Table/TableRow.jsx";
import TableEmptyState from "../../../../components/common/Table/TableEmptyState.jsx";
import DateCell from "../../../../components/common/Cell/DateCell.jsx";
import Td from "../../../../components/common/Table/Td.jsx";
import { InquiryDropdown } from "../../../../components/common/Dropdown/Dropdowns.jsx";

// ── Inquiry-specific badges ──────────────────────────────────────────────────
const INQUIRY_STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-600",
  responded: "bg-blue-100 text-blue-600",
  cancelled: "bg-orange-100 text-orange-600",
  archived: "bg-gray-100 text-gray-600",
};

const InquiryStatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${INQUIRY_STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}
  >
    {status}
  </span>
);

const PriorityBadge = ({ priority }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${priority?.toLowerCase() === "high" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
  >
    {priority === "high" ? "High" : "Normal"}
  </span>
);

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "All (Excluding Archived)" },
  { value: "pending", label: "Pending" },
  { value: "responded", label: "Responded" },
  { value: "cancelled", label: "Cancelled" },
  { value: "archived", label: "Archived" },
];

const COLUMNS = [
  {
    label: "Inquiry Number",
    column: "inquiry_number",
    minWidth: "min-w-[180px]",
  },
  { label: "Customer", column: "name", minWidth: "min-w-[200px]" },
  {
    label: "Product Type",
    column: "product_type",
    minWidth: "min-w-[200px]",
    sortable: false,
  },
  {
    label: "Service Type",
    column: "service_type",
    minWidth: "min-w-[250px]",
    sortable: false,
  },
  { label: "Created On", column: "created_at", minWidth: "min-w-[180px]" },
  {
    label: "Priority",
    column: "priority",
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
  { key: "inquiry_number", type: "string" },
  { key: "name", type: "string" },
  { key: "created_at", type: "date" },
];

const InquiriesTable = () => {
  const {
    inquiries,
    deleteInquiry,
    archiveInquiry,
    restoreInquiry,
    markAsResponded,
    markAsCancelled,
    markAsPending,
    changePriority,
  } = useInquiries();
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
    data: inquiries,
    defaultSortColumn: "created_at",
    defaultSortOrder: "desc",
  });

  const [priorityFilter, setPriorityFilter] = useState("all");

  // Inquiries has custom status logic (active = not archived) + priority filter — manual filter
  const filtered = inquiries.filter((inquiry) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      inquiry.inquiry_number?.toLowerCase().includes(term) ||
      inquiry.name?.toLowerCase().includes(term);
    const matchesPriority =
      priorityFilter === "all" ||
      inquiry.priority?.toLowerCase() === priorityFilter;
    const matchesStatus =
      statusFilter === "active"
        ? inquiry.status !== "archived"
        : inquiry.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const {
    totalPages,
    startIndex,
    currentItems: currentInquiries,
  } = paginate(sorted);
  const isAllSelected =
    currentInquiries.length > 0 &&
    selectedItems.length === currentInquiries.length;

  // ── Bulk labels ──────────────────────────────────────────────────────────
  const bulkArchiveLabel = (() => {
    if (!selectedItems.length) return "Archive";
    return inquiries.find((i) => i.id === selectedItems[0])?.status ===
      "archived"
      ? "Unarchive"
      : "Archive";
  })();

  const bulkRespondedLabel = (() => {
    if (!selectedItems.length) return "Mark as Responded";
    return inquiries.find((i) => i.id === selectedItems[0])?.status ===
      "responded"
      ? "Mark as Pending"
      : "Mark as Responded";
  })();

  // ── Bulk actions ─────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} inquiry(s)?`)) return;
    for (const id of selectedItems) await deleteInquiry(id);
    setSelectedItems([]);
    alert("Selected inquiries deleted.");
  };

  const handleBulkArchive = async () => {
    const first = inquiries.find((i) => i.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedItems.length} inquiry(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreInquiry(id);
      else await archiveInquiry(id);
    }
    setSelectedItems([]);
    alert(`Selected inquiries ${action}d.`);
  };

  const handleBulkCancelled = async () => {
    if (
      !window.confirm(`Mark ${selectedItems.length} inquiry(s) as cancelled?`)
    )
      return;
    for (const id of selectedItems) await markAsCancelled(id);
    setSelectedItems([]);
    alert("Selected inquiries marked as cancelled.");
  };

  const handleBulkResponded = async () => {
    const first = inquiries.find((i) => i.id === selectedItems[0]);
    const isResponded = first?.status === "responded";
    if (
      !window.confirm(
        `Mark ${selectedItems.length} inquiry(s) as ${isResponded ? "pending" : "responded"}?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isResponded) await markAsPending(id);
      else await markAsResponded(id);
    }
    setSelectedItems([]);
    alert(
      `Selected inquiries marked as ${isResponded ? "pending" : "responded"}.`,
    );
  };

  // ── Row actions ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this inquiry?")) {
      const result = await deleteInquiry(id);
      alert(
        result.success
          ? "Inquiry deleted successfully"
          : "Failed: " + result.message,
      );
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm("Archive this inquiry?")) {
      const result = await archiveInquiry(id);
      alert(result.success ? "Inquiry archived" : "Failed: " + result.message);
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("Restore this inquiry?")) {
      const result = await restoreInquiry(id);
      alert(result.success ? "Inquiry restored" : "Failed: " + result.message);
    }
  };

  const handleResponded = async (id) => {
    if (window.confirm("Mark as responded?")) {
      const result = await markAsResponded(id);
      alert(
        result.success ? "Marked as responded" : "Failed: " + result.message,
      );
    }
  };

  const handleCancelled = async (id) => {
    if (window.confirm("Mark as cancelled?")) {
      const result = await markAsCancelled(id);
      alert(
        result.success ? "Marked as cancelled" : "Failed: " + result.message,
      );
    }
  };

  const handleRowPriorityChange = async (id, newPriority) => {
    const result = await changePriority(id, newPriority);
    if (!result.success) alert("Failed to update priority: " + result.message);
  };

  return (
    <div className="pb-4">
      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by inquiry number, customer name..."
        filters={[
          {
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: PRIORITY_OPTIONS,
            placeholder: "All Priority",
            icon: Filter,
          },
          {
            value: statusFilter,
            onChange: handleStatusChange,
            options: STATUS_OPTIONS,
            placeholder: "All (Excluding Archived)",
            icon: SlidersHorizontal,
          },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        totalItems={sorted.length}
        itemLabel="inquiries"
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
            label: "Mark as Cancelled",
            icon: CircleX,
            onClick: handleBulkCancelled,
            className: "bg-red-500 hover:bg-red-600",
          },
          {
            label: bulkRespondedLabel,
            icon: CheckCheck,
            onClick: handleBulkResponded,
            className: "bg-green-500 hover:bg-green-600",
          },
        ]}
        thead={
          <TableHead
            columns={COLUMNS}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll(currentInquiries)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentInquiries.length > 0 ? (
              currentInquiries.map((inquiry, index) => (
                <TableRow
                  key={inquiry.id}
                  id={inquiry.id}
                  isLast={index === currentInquiries.length - 1}
                  isSelected={selectedItems.includes(inquiry.id)}
                  onSelect={() => handleSelectOne(inquiry.id)}
                  actions={
                    <InquiryDropdown
                      inquiryId={inquiry.id}
                      inquiryNumber={inquiry.inquiry_number}
                      status={inquiry.status}
                      priority={inquiry.priority}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onResponded={handleResponded}
                      onCancelled={handleCancelled}
                      onPriorityChange={handleRowPriorityChange}
                    />
                  }
                >
                  <Td>
                    <Link
                      to={`${basePath}/inquiries/view/${inquiry.inquiry_number}`}
                      className="text-sm font-medium underline text-gray-900"
                    >
                      {inquiry.inquiry_number || "N/A"}
                    </Link>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {inquiry.name || "N/A"}
                    </p>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {inquiry.product_type || "N/A"}
                    </p>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {inquiry.service_type || "N/A"}
                    </p>
                  </Td>
                  <Td>
                    <DateCell value={inquiry.created_at} />
                  </Td>
                  <Td>
                    <PriorityBadge priority={inquiry.priority} />
                  </Td>
                  <Td>
                    <InquiryStatusBadge status={inquiry.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                title="No inquiries found matching your search criteria."
                colSpan={9}
              />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default InquiriesTable;
