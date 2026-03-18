import { Link, useLocation } from "react-router-dom";
import { useSupplier } from "../context/SupplierContext";
import { Plus, Search, Filter } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import SupplierDropdown from "../../../../components/common/Dropdown/ActionsDropdown/SupplierDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const SuppliersTable = () => {
  const { suppliers, deleteSupplier, archiveSupplier, restoreSupplier } =
    useSupplier();
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
  } = usePaginatedTable({ data: suppliers });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch = s.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || s.status === statusFilter)
    );
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "name":
        valA = a.name?.toLowerCase() ?? "";
        valB = b.name?.toLowerCase() ?? "";
        break;
      case "updated_at":
        valA = new Date(a.updated_at ?? 0);
        valB = new Date(b.updated_at ?? 0);
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

  const { totalPages, startIndex, currentItems } = paginate(sortedSuppliers);
  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} supplier(s)?`)) return;
    for (const id of selectedItems) await deleteSupplier(id);
    setSelectedItems([]);
    alert("Selected suppliers deleted.");
  };

  const handleBulkArchive = async () => {
    const first = suppliers.find((s) => s.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedItems.length} supplier(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreSupplier(id);
      else await archiveSupplier(id);
    }
    setSelectedItems([]);
    alert(`Selected suppliers ${action}d.`);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = suppliers.find((s) => s.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  // ── Row-level actions ───────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this supplier?")) {
      const result = await deleteSupplier(id);
      alert(
        result.success
          ? "Supplier deleted successfully"
          : "Failed: " + result.message,
      );
    }
  };

  const handleArchive = async (id) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (supplier?.status === "archived") {
      if (window.confirm("Restore this supplier?")) {
        const result = await restoreSupplier(id);
        alert(
          result.success ? "Supplier restored" : "Failed: " + result.message,
        );
      }
    } else {
      if (window.confirm("Archive this supplier?")) {
        const result = await archiveSupplier(id);
        alert(
          result.success ? "Supplier archived" : "Failed: " + result.message,
        );
      }
    }
  };

  return (
    <div className="pb-4">
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage Suppliers</h2>
            <p className="text-xs text-gray-600">
              Monitor and manage your suppliers here.
            </p>
          </div>
          <Link
            to={`${basePath}/suppliers/new`}
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors self-end sm:self-auto"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Supplier</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by supplier name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <CustomDropdown
              value={statusFilter}
              onChange={handleStatusChange}
              options={statusOptions}
              placeholder="Active"
              icon={Filter}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="min-w-[50px] px-6 pt-5 pb-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll(currentItems)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[200px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="name"
                    label="Supplier"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Contact No.
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="created_at"
                    label="Created On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="updated_at"
                    label="Updated On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[120px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-end" />
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((supplier, index) => (
                  <tr
                    key={supplier.id}
                    className={`${index !== currentItems.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(supplier.id)}
                        onChange={() => handleSelectOne(supplier.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span className="text-sm text-gray-900 font-medium">
                        {supplier.name}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {supplier.contact_no || "—"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {supplier.created_at
                          ? new Date(supplier.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {supplier.updated_at
                          ? new Date(supplier.updated_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${supplier.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {supplier.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
                      <SupplierDropdown
                        supplierId={supplier.id}
                        supplierSlug={supplier.slug}
                        status={supplier.status}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 sm:px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">No suppliers found.</p>
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
          totalItems={sortedSuppliers.length}
          itemLabel="suppliers"
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
        />
      )}
    </div>
  );
};

export default SuppliersTable;
