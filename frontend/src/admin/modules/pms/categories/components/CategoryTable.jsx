import { Link, useLocation } from "react-router-dom";
import { useCategories } from "../context/CategoryContext";
import { Plus, Search, Filter } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import ServerImage from "../../../../components/common/ServerImage";
import CategoryDropdown from "../../../../components/common/Dropdown/ActionsDropdown/CategoryDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const CategoryTable = () => {
  const { categories, deleteCategory, archiveCategory, restoreCategory } =
    useCategories();
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
  } = usePaginatedTable({ data: categories });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  const getActiveCount = (category) =>
    category.active_product_count ??
    (Array.isArray(category.products)
      ? category.products.filter((p) => p.status === "active").length
      : (category.product_count ?? 0));

  // ── Filter ──────────────────────────────────────────────────────
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || c.status === statusFilter)
    );
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "name":
        valA = a.name?.toLowerCase() ?? "";
        valB = b.name?.toLowerCase() ?? "";
        break;
      case "product_count":
        valA = getActiveCount(a);
        valB = getActiveCount(b);
        break;
      case "created_at":
        valA = new Date(a.created_at ?? 0);
        valB = new Date(b.created_at ?? 0);
        break;
      case "updated_at":
        valA = new Date(a.updated_at ?? 0);
        valB = new Date(b.updated_at ?? 0);
        break;
      default:
        return 0;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // ── Paginate ────────────────────────────────────────────────────
  const {
    totalPages,
    startIndex,
    currentItems: currentCategories,
  } = paginate(sortedCategories);
  const isAllSelected =
    currentCategories.length > 0 &&
    selectedItems.length === currentCategories.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} category(s)?`)) return;
    for (const id of selectedItems) await deleteCategory(id);
    setSelectedItems([]);
    alert("Selected categories deleted.");
  };

  const handleBulkArchive = async () => {
    const first = categories.find((c) => c.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedItems.length} category(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreCategory(id);
      else await archiveCategory(id);
    }
    setSelectedItems([]);
    alert(`Selected categories ${action}d.`);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = categories.find((c) => c.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  // ── Row-level actions ───────────────────────────────────────────
  const handleDelete = async (categoryId) => {
    if (window.confirm("Delete this category?")) {
      const result = await deleteCategory(categoryId);
      alert(
        result.success
          ? "Category deleted successfully"
          : "Failed: " + result.message,
      );
    }
  };

  const handleArchive = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category.status === "archived") {
      if (window.confirm("Restore this category?")) {
        const result = await restoreCategory(categoryId);
        alert(
          result.success
            ? "Category restored successfully"
            : "Failed: " + result.message,
        );
      }
    } else {
      if (window.confirm("Archive this category?")) {
        const result = await archiveCategory(categoryId);
        alert(
          result.success
            ? "Category archived successfully"
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
            <h2 className="text-md md:text-lg font-semibold">
              Manage Categories
            </h2>
            <p className="text-xs text-gray-600">
              Review and organize your product categories here.
            </p>
          </div>
          <Link
            to={`${basePath}/categories/new`}
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors self-end sm:self-auto"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by category name or slug..."
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

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="min-w-[50px] px-6 pt-5 pb-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll(currentCategories)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[200px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="name"
                    label="Category"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[130px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="product_count"
                    label="Active Products"
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
              {currentCategories.length > 0 ? (
                currentCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={`${index !== currentCategories.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(category.id)}
                        onChange={() => handleSelectOne(category.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-center gap-3">
                        {category.image && (
                          <ServerImage
                            src={category.image}
                            alt={category.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <span className="text-sm text-gray-900 font-medium">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {getActiveCount(category)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {category.created_at
                          ? new Date(category.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {category.updated_at
                          ? new Date(category.updated_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${category.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {category.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
                      <CategoryDropdown
                        productId={category.id}
                        productSlug={category.slug}
                        status={category.status}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 sm:px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">No categories found</p>
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
          totalItems={sortedCategories.length}
          itemLabel="categories"
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

export default CategoryTable;
