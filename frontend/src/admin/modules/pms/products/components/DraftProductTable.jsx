import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useProducts } from "../context/ProductContext";
import { getImageUrl } from "../../../../../services";
import { PackageSearch, Plus, Search, Filter, Edit, Send } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import DraftDropdown from "../../../../components/common/Dropdown/ActionsDropdown/DraftDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const DraftProductTable = () => {
  const { drafts, deleteDraft, publishDraft, categories } = useProducts();
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
    data: drafts,
    defaultSortColumn: "createdAt",
    defaultSortOrder: "desc",
    defaultStatusFilter: "all", // ✅ drafts default to all
  });

  // ── Category filter (extra — not in hook) ───────────────────────
  const [categoryFilter, setCategoryFilter] = useState("all");
  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "N/A";
    const category = categories.find((cat) => cat.id === parseInt(categoryId));
    return category ? category.name : "N/A";
  };

  const draftCategoryIds = [
    ...new Set(drafts.map((d) => d.category).filter(Boolean)),
  ];
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...draftCategoryIds.map((catId) => {
      const category = categories.find((c) => c.id === parseInt(catId));
      return {
        value: catId,
        label: category ? category.name : `Category ${catId}`,
      };
    }),
  ];

  const statusOptions = [
    { value: "all", label: "All Drafts" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch =
      draft.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.heading?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || draft.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "productName":
        valA = a.productName?.toLowerCase() ?? "";
        valB = b.productName?.toLowerCase() ?? "";
        break;
      case "category":
        valA = getCategoryName(a.category)?.toLowerCase() ?? "";
        valB = getCategoryName(b.category)?.toLowerCase() ?? "";
        break;
      case "price":
        valA = parseFloat(a.price ?? 0);
        valB = parseFloat(b.price ?? 0);
        break;
      case "lastSaved":
        valA = new Date(a.lastSaved ?? 0);
        valB = new Date(b.lastSaved ?? 0);
        break;
      case "createdAt":
      default:
        valA = new Date(a.createdAt ?? 0);
        valB = new Date(b.createdAt ?? 0);
        break;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const {
    totalPages,
    startIndex,
    currentItems: currentDrafts,
  } = paginate(sortedDrafts);
  const isAllSelected =
    currentDrafts.length > 0 && selectedItems.length === currentDrafts.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} draft(s)?`)) return;
    for (const id of selectedItems) await deleteDraft(id);
    setSelectedItems([]);
    alert("Selected drafts deleted.");
  };

  const handleBulkPublish = async () => {
    if (!window.confirm(`Publish ${selectedItems.length} draft(s)?`)) return;
    for (const id of selectedItems) await publishDraft(id);
    setSelectedItems([]);
    alert("Selected drafts published.");
  };

  // ── Row-level actions ───────────────────────────────────────────
  const handleDelete = (draftId) => {
    if (window.confirm("Delete this draft?")) deleteDraft(draftId);
  };

  const handlePublish = (draftId) => {
    if (window.confirm("Publish this draft?")) publishDraft(draftId);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Never";
    const diffMins = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getDraftThumbnail = (draft) => {
    const first = draft.productImages?.[0];
    if (!first) return null;
    const raw =
      first?.url ||
      first?.preview ||
      (typeof first === "string" ? first : null);
    if (!raw) return null;
    if (raw.startsWith("data:")) return raw;
    return getImageUrl(raw);
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-md font-semibold">Manage Drafts</h2>
            <p className="text-xs text-gray-600">
              Edit and review all your product drafts from here.
            </p>
          </div>
          <div className="flex text-xs gap-3 flex-shrink-0 self-end sm:self-auto">
            <Link
              to={`${basePath}/products`}
              className="bg-white border border-gray-300 text-black rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <PackageSearch className="w-4 h-4" />
                <span>All Products</span>
              </div>
            </Link>
            <Link
              to={`${basePath}/products/new`}
              className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span>New Product</span>
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
                placeholder="Search by product name or heading..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full md:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 w-full md:w-auto">
              <CustomDropdown
                value={categoryFilter}
                onChange={handleCategoryChange}
                options={categoryOptions}
                placeholder="All Categories"
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
                    onChange={handleSelectAll(currentDrafts)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[200px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="productName"
                    label="Product"
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
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="createdAt"
                    label="Created On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="lastSaved"
                    label="Last Saved"
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
              {currentDrafts.length > 0 ? (
                currentDrafts.map((draft, index) => {
                  const thumbnail = getDraftThumbnail(draft);
                  return (
                    <tr
                      key={draft.id}
                      className={`${index !== currentDrafts.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                    >
                      <td className="px-6 pt-5 pb-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(draft.id)}
                          onChange={() => handleSelectOne(draft.id)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={draft.productName || "Draft"}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full bg-gray-100 rounded flex items-center justify-center"
                              style={{ display: thumbnail ? "none" : "flex" }}
                            >
                              <span className="text-gray-400 text-xs">–</span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-900 font-medium">
                            {draft.productName || "Untitled Draft"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <p className="text-sm text-gray-500">
                          {getCategoryName(draft.category)}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <p className="text-sm text-gray-500">
                          {draft.price && parseFloat(draft.price) > 0
                            ? `PHP ${parseFloat(draft.price).toFixed(2)}`
                            : "N/A"}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <p className="text-sm text-gray-500">
                          {draft.createdAt
                            ? new Date(draft.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <p className="text-sm text-gray-500">
                          {formatTimeAgo(draft.lastSaved)}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                          Draft
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <div className="flex items-center justify-end">
                          <DraftDropdown
                            draftId={draft.id}
                            onDelete={handleDelete}
                            onPublish={handlePublish}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 sm:px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Edit className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">
                        No drafts found
                      </p>
                      <p className="text-gray-400 text-xs">
                        Start creating a product to save drafts
                      </p>
                      <Link
                        to={`${basePath}/products/new`}
                        className="mt-2 bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="w-3 h-3" />
                          <span>Create Product</span>
                        </div>
                      </Link>
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
          totalItems={sortedDrafts.length}
          itemLabel="drafts"
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
          onArchive={handleBulkPublish}
          archiveLabel="Publish"
          extraActions={[
            {
              label: "Publish Selected",
              icon: Send,
              onClick: handleBulkPublish,
              className: "bg-green-500 hover:bg-green-600",
            },
          ]}
        />
      )}
    </div>
  );
};

export default DraftProductTable;
