import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useInquiries } from "../context/InquiryContext.jsx";
import {
  Search,
  Filter,
  SlidersHorizontal,
  CircleX,
  CheckCheck,
} from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import InquiryDropdown from "../../../../components/common/Dropdown/ActionsDropdown/InquiryDropdown.jsx";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar.jsx";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable.js";

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
    data: inquiries,
    defaultSortColumn: "created_at",
    defaultSortOrder: "desc",
  });

  // ── Priority filter (extra — not in hook) ───────────────────────
  const [priorityFilter, setPriorityFilter] = useState("all");
  const handlePriorityChange = (value) => {
    setPriorityFilter(value);
  };

  const priorityOptions = [
    { value: "all", label: "All Priority" },
    { value: "high", label: "High" },
    { value: "normal", label: "Normal" },
  ];

  const statusOptions = [
    { value: "active", label: "All (Excluding Archived)" },
    { value: "pending", label: "Pending" },
    { value: "responded", label: "Responded" },
    { value: "cancelled", label: "Cancelled" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.inquiry_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" ||
      inquiry.priority?.toLowerCase() === priorityFilter;
    const matchesStatus =
      statusFilter === "active"
        ? inquiry.status !== "archived"
        : inquiry.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedInquiries = [...filteredInquiries].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "inquiry_number":
        valA = a.inquiry_number?.toLowerCase() ?? "";
        valB = b.inquiry_number?.toLowerCase() ?? "";
        break;
      case "name":
        valA = a.name?.toLowerCase() ?? "";
        valB = b.name?.toLowerCase() ?? "";
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
    currentItems: currentInquiries,
  } = paginate(sortedInquiries);
  const isAllSelected =
    currentInquiries.length > 0 &&
    selectedItems.length === currentInquiries.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk action labels ──────────────────────────────────────────
  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = inquiries.find((p) => p.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  const bulkRespondedLabel = (() => {
    if (!hasSelection) return "Mark as Responded";
    const first = inquiries.find((p) => p.id === selectedItems[0]);
    return first?.status === "responded"
      ? "Mark as Pending"
      : "Mark as Responded";
  })();

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} inquiry(s)?`)) return;
    for (const id of selectedItems) await deleteInquiry(id);
    setSelectedItems([]);
    alert("Selected inquiries deleted.");
  };

  const handleBulkArchive = async () => {
    const first = inquiries.find((p) => p.id === selectedItems[0]);
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
    const first = inquiries.find((p) => p.id === selectedItems[0]);
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

  // ── Row-level handlers ──────────────────────────────────────────
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

  // ── Status badge ────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-600",
      responded: "bg-blue-100 text-blue-600",
      cancelled: "bg-orange-100 text-orange-600",
      archived: "bg-gray-100 text-gray-600",
    };
    const labels = {
      pending: "Pending",
      responded: "Responded",
      cancelled: "Cancelled",
      archived: "Archived",
    };
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
          <div className="flex flex-col md:flex-row gap-3 items-start justify-between">
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by inquiry number, customer name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <CustomDropdown
                value={priorityFilter}
                onChange={handlePriorityChange}
                options={priorityOptions}
                placeholder="All Priority"
                icon={Filter}
              />
              <CustomDropdown
                value={statusFilter}
                onChange={handleStatusChange}
                options={statusOptions}
                placeholder="All (Excluding Archived)"
                icon={SlidersHorizontal}
              />
            </div>
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
                    onChange={handleSelectAll(currentInquiries)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[180px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="inquiry_number"
                    label="Inquiry Number"
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
                <th className="min-w-[200px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Product Type
                </th>
                <th className="min-w-[250px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Service Type
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
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Priority
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-end" />
              </tr>
            </thead>
            <tbody>
              {currentInquiries.length > 0 ? (
                currentInquiries.map((inquiry, index) => (
                  <tr
                    key={inquiry.id}
                    className={`${index !== currentInquiries.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(inquiry.id)}
                        onChange={() => handleSelectOne(inquiry.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <Link
                        to={`${basePath}/inquiries/view/${inquiry.inquiry_number}`}
                        className="text-sm font-medium underline text-gray-900"
                      >
                        {inquiry.inquiry_number || "N/A"}
                      </Link>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {inquiry.name || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {inquiry.product_type || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {inquiry.service_type || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {inquiry.created_at
                          ? new Date(inquiry.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${inquiry.priority?.toLowerCase() === "high" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
                      >
                        {inquiry.priority === "high" ? "High" : "Normal"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      {getStatusBadge(inquiry.status)}
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 sm:px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      No inquiries found matching your search criteria.
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
          totalItems={sortedInquiries.length}
          itemLabel="inquiries"
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
        />
      )}
    </div>
  );
};

export default InquiriesTable;
