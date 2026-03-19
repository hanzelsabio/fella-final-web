import { Link, useLocation } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { getImageUrl } from "../../../../../services";
import { Plus, Search, Filter, Package } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import InventoryDropdown from "../../../../components/common/Dropdown/ActionsDropdown/InventoryDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const InventoryTable = () => {
  const { inventory, deleteItem, archiveItem, restoreItem } = useInventory();
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
  } = usePaginatedTable({ data: inventory });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || item.status === statusFilter)
    );
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "name":
        valA = a.name?.toLowerCase() ?? "";
        valB = b.name?.toLowerCase() ?? "";
        break;
      case "quantity":
        valA = a.quantity ?? 0;
        valB = b.quantity ?? 0;
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

  const { totalPages, startIndex, currentItems } = paginate(sortedInventory);
  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} item(s)?`)) return;
    for (const id of selectedItems) await deleteItem(id);
    setSelectedItems([]);
    alert("Selected items deleted.");
  };

  const handleBulkArchive = async () => {
    const first = inventory.find((i) => i.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedItems.length} item(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreItem(id);
      else await archiveItem(id);
    }
    setSelectedItems([]);
    alert(`Selected items ${action}d.`);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = inventory.find((i) => i.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  // ── Row-level actions ───────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      const result = await deleteItem(id);
      alert(
        result.success
          ? "Item deleted successfully"
          : "Failed: " + result.message,
      );
    }
  };

  const handleArchive = async (id) => {
    const item = inventory.find((i) => i.id === id);
    if (item?.status === "archived") {
      if (window.confirm("Restore this item?")) {
        const result = await restoreItem(id);
        alert(result.success ? "Item restored" : "Failed: " + result.message);
      }
    } else {
      if (window.confirm("Archive this item?")) {
        const result = await archiveItem(id);
        alert(result.success ? "Item archived" : "Failed: " + result.message);
      }
    }
  };

  const getStockBadge = (quantity) => {
    if (quantity === 0)
      return (
        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
          Out of Stock
        </span>
      );
    if (quantity <= 10)
      return (
        <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
          Low Stock
        </span>
      );
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        {quantity}
      </span>
    );
  };

  return (
    <div className="pb-4">
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage Inventory</h2>
            <p className="text-xs text-gray-600">
              Monitor and manage your stored items.
            </p>
          </div>
          <Link
            to={`${basePath}/inventory/new`}
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors self-end sm:self-auto"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Item</span>
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
                placeholder="Search by item name..."
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
                    label="Item"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="quantity"
                    label="Quantity"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
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
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${index !== currentItems.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0">
                          {item.image ? (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full bg-gray-100 rounded flex items-center justify-center"
                            style={{ display: item.image ? "none" : "flex" }}
                          >
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      {getStockBadge(item.quantity)}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {item.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
                      <InventoryDropdown
                        itemId={item.id}
                        itemSlug={item.slug}
                        status={item.status}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 sm:px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      No inventory items found.
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
          totalItems={sortedInventory.length}
          itemLabel="items"
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

export default InventoryTable;
