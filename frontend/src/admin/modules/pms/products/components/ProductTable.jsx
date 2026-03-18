import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { getImageUrl } from "../../../../../services/api";
import { SquarePen, Plus, Search, Filter } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import ActionsDropdown from "../../../../components/common/ActionsDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const ProductTable = () => {
  const { products, deleteProduct, archiveProduct, restoreProduct } =
    useProducts();
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
  } = usePaginatedTable({ data: products });

  // ── Category filter (extra — not in hook) ───────────────────────
  const [categoryFilter, setCategoryFilter] = useState("all");
  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
  };

  const uniqueCategoryNames = [
    ...new Set(products.map((p) => p.categoryName).filter(Boolean)),
  ];
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...uniqueCategoryNames.map((name) => ({ value: name, label: name })),
  ];
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.categoryName === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "title":
        valA = a.title?.toLowerCase() ?? "";
        valB = b.title?.toLowerCase() ?? "";
        break;
      case "category":
        valA = a.category?.toLowerCase() ?? "";
        valB = b.category?.toLowerCase() ?? "";
        break;
      case "price":
        valA = parseFloat(a.price ?? 0);
        valB = parseFloat(b.price ?? 0);
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

  const {
    totalPages,
    startIndex,
    currentItems: currentProducts,
  } = paginate(sortedProducts);
  const isAllSelected =
    currentProducts.length > 0 &&
    selectedItems.length === currentProducts.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} product(s)?`)) return;
    for (const id of selectedItems) await deleteProduct(id);
    setSelectedItems([]);
    alert("Selected products deleted.");
  };

  const handleBulkArchive = async () => {
    const first = products.find((p) => p.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedItems.length} product(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreProduct(id);
      else await archiveProduct(id);
    }
    setSelectedItems([]);
    alert(`Selected products ${action}d.`);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = products.find((p) => p.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  // ── Row-level actions ───────────────────────────────────────────
  const handleDelete = async (productId) => {
    if (window.confirm("Delete this product?")) {
      const result = await deleteProduct(productId);
      alert(
        result.success
          ? "Product deleted successfully"
          : "Failed: " + result.message,
      );
    }
  };

  const handleArchive = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product.status === "archived") {
      if (window.confirm("Restore this product?")) {
        const result = await restoreProduct(productId);
        alert(
          result.success
            ? "Product restored successfully"
            : "Failed: " + result.message,
        );
      }
    } else {
      if (window.confirm("Archive this product?")) {
        const result = await archiveProduct(productId);
        alert(
          result.success
            ? "Product archived successfully"
            : "Failed: " + result.message,
        );
      }
    }
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-md font-semibold">Manage Product</h2>
            <p className="text-xs text-gray-600">
              Manage and track all your products from here.
            </p>
          </div>
          <div className="flex text-xs gap-3 flex-shrink-0 self-end sm:self-auto">
            <Link
              to={`${basePath}/products/drafts`}
              className="bg-white border border-gray-300 text-black rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SquarePen className="w-4 h-4" />
                <span>All Drafts</span>
              </div>
            </Link>
            <Link
              to={`${basePath}/products/new`}
              className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <CustomDropdown
                value={categoryFilter}
                onChange={handleCategoryChange}
                options={categoryOptions}
                placeholder="All Categories"
                icon={Filter}
              />
              <CustomDropdown
                value={statusFilter}
                onChange={handleStatusChange}
                options={statusOptions}
                placeholder="Active"
                icon={Filter}
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
                    onChange={handleSelectAll(currentProducts)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[200px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="title"
                    label="Product Name"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="category"
                    label="Category"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="price"
                    label="Price"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[170px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="created_at"
                    label="Created On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[170px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="updated_at"
                    label="Updated On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-end" />
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className={`${index !== currentProducts.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0">
                          {product.productImages?.length > 0 ? (
                            <img
                              src={getImageUrl(product.productImages[0].url)}
                              alt={product.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {product.categoryName || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {product.price
                          ? `PHP ${parseFloat(product.price).toFixed(2)}`
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {product.updated_at
                          ? new Date(product.updated_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {product.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
                      <ActionsDropdown
                        productId={product.id}
                        productSlug={product.slug}
                        status={product.status}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 sm:px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      No products found matching your search criteria.
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
          totalItems={sortedProducts.length}
          itemLabel="products"
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

export default ProductTable;
