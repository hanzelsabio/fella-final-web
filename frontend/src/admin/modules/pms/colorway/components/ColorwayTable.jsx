import { Link, useLocation } from "react-router-dom";
import { useColorways } from "../context/ColorwayContext";
import { Download, Plus, Search, Filter, Archive } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import ColorwayDropdown from "../../../../components/common/Dropdown/ActionsDropdown/ColorwayDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const ColorwayTable = () => {
  const { colors, deleteColor, archiveColor, restoreColor } = useColorways();
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
  } = usePaginatedTable({ data: colors });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredColors = colors.filter((color) => {
    const matchesSearch =
      color.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.hex_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || color.status === statusFilter)
    );
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedColors = [...filteredColors].sort((a, b) => {
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

  // ── Paginate ────────────────────────────────────────────────────
  const {
    totalPages,
    startIndex,
    currentItems: currentColors,
  } = paginate(sortedColors);
  const isAllSelected =
    currentColors.length > 0 && selectedItems.length === currentColors.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} colorway(s)?`)) return;
    for (const id of selectedItems) await deleteColor(id);
    setSelectedItems([]);
    alert("Selected colorways deleted.");
  };

  const handleBulkArchive = async () => {
    const first = colors.find((c) => c.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedItems.length} colorway(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreColor(id);
      else await archiveColor(id);
    }
    setSelectedItems([]);
    alert(`Selected colorways ${action}d.`);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = colors.find((c) => c.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  // ── Row-level actions ───────────────────────────────────────────
  const handleDelete = async (colorId) => {
    if (window.confirm("Delete this colorway?")) {
      const result = await deleteColor(colorId);
      alert(
        result.success
          ? "Colorway deleted successfully"
          : "Failed: " + result.message,
      );
    }
  };

  const handleArchive = async (colorId) => {
    const color = colors.find((c) => c.id === colorId);
    if (color.status === "archived") {
      if (window.confirm("Restore this colorway?")) {
        const result = await restoreColor(colorId);
        alert(
          result.success
            ? "Colorway restored successfully"
            : "Failed: " + result.message,
        );
      }
    } else {
      if (window.confirm("Archive this colorway?")) {
        const result = await archiveColor(colorId);
        alert(
          result.success
            ? "Colorway archived successfully"
            : "Failed: " + result.message,
        );
      }
    }
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-lg font-bold">Manage Colorways</h2>
            <p className="text-xs text-gray-600">
              Review all your available colorways for your future products here.
            </p>
          </div>
          <div className="flex text-xs gap-3 flex-shrink-0 self-end sm:self-auto">
            <Link
              to=""
              className="bg-white border border-gray-300 text-black rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center justify-center">
                <span className="pe-2">Export</span>
                <Download className="w-4 h-4" />
              </div>
            </Link>
            <Link
              to={`${basePath}/colorways/new`}
              className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center justify-center">
                <Plus className="w-4 h-4" />
                <span className="ps-2">Add New</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by color name, slug, or hex code"
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

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="min-w-[50px] px-6 pt-5 pb-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll(currentColors)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[200px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="name"
                    label="Color"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[120px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Hex Code
                </th>
                <th className="min-w-[120px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="created_at"
                    label="Created On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[120px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
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
              {currentColors.length > 0 ? (
                currentColors.map((colorway, index) => (
                  <tr
                    key={colorway.id}
                    className={`${index !== currentColors.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(colorway.id)}
                        onChange={() => handleSelectOne(colorway.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-center gap-3">
                        {colorway.hex_code && (
                          <span
                            className="w-5 h-5 border border-gray-300 rounded"
                            style={{ backgroundColor: colorway.hex_code }}
                          />
                        )}
                        <span className="text-sm text-gray-900 font-medium">
                          {colorway.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500 font-mono">
                        {colorway.hex_code || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {colorway.created_at
                          ? new Date(colorway.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {colorway.updated_at
                          ? new Date(colorway.updated_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorway.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {colorway.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
                      <ColorwayDropdown
                        colorId={colorway.id}
                        status={colorway.status}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 sm:px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Archive className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">
                        No colorway found
                      </p>
                      <p className="text-gray-400 text-xs">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Start by adding your first colorway"}
                      </p>
                      {!searchTerm && statusFilter === "all" && (
                        <Link
                          to={`${basePath}/colorways/new`}
                          className="mt-2 bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="w-3 h-3" />
                            <span>Add Colorway</span>
                          </div>
                        </Link>
                      )}
                    </div>
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
          totalItems={sortedColors.length}
          itemLabel="colorways"
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

export default ColorwayTable;
