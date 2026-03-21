import { useState } from "react";
import { PackageSearch, Plus, Edit, Send } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { getImageUrl } from "../../../../../services/imageUrl";

import useBasePath from "../../../../components/hooks/useBasePath";
import useTableSort from "../../../../components/hooks/useTableSort";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

import TableHeader from "../../../../components/common/Table/TableHeader";
import TableLayout from "../../../../components/common/Table/TableLayout";
import TableHead from "../../../../components/common/Table/TableHead";
import TableRow from "../../../../components/common/Table/TableRow";
import Td from "../../../../components/common/Table/Td";
import TableEmptyState from "../../../../components/common/Table/TableEmptyState";
import DateCell from "../../../../components/common/Cell/DateCell";
import ThumbnailCell from "../../../../components/common/Cell/ThumbnailCell";
import { DraftDropdown } from "../../../../components/common/Dropdown/Dropdowns";

// ── Draft-specific helpers ───────────────────────────────────────────────────
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
    first?.url || first?.preview || (typeof first === "string" ? first : null);
  if (!raw) return null;
  if (raw.startsWith("data:")) return raw;
  return getImageUrl(raw);
};

const COLUMNS = [
  { label: "Product", column: "productName", minWidth: "min-w-[200px]" },
  { label: "Category", column: "category", minWidth: "min-w-[150px]" },
  { label: "Price", column: "price", minWidth: "min-w-[150px]" },
  { label: "Created On", column: "createdAt", minWidth: "min-w-[150px]" },
  { label: "Last Saved", column: "lastSaved", minWidth: "min-w-[150px]" },
  {
    label: "Status",
    column: "status",
    minWidth: "min-w-[120px]",
    sortable: false,
  },
];

// ── Component ────────────────────────────────────────────────────────────────
const DraftProductTable = () => {
  const { drafts, deleteDraft, publishDraft, categories } = useProducts();
  const basePath = useBasePath();

  const {
    searchTerm,
    currentPage,
    sortColumn,
    sortOrder,
    selectedItems,
    setSelectedItems,
    handleSort,
    handleSearchChange,
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
    defaultStatusFilter: "all",
  });

  const [categoryFilter, setCategoryFilter] = useState("all");

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "N/A";
    const cat = categories.find((c) => c.id === parseInt(categoryId));
    return cat ? cat.name : "N/A";
  };

  const draftCategoryIds = [
    ...new Set(drafts.map((d) => d.category).filter(Boolean)),
  ];
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...draftCategoryIds.map((catId) => {
      const cat = categories.find((c) => c.id === parseInt(catId));
      return { value: catId, label: cat ? cat.name : `Category ${catId}` };
    }),
  ];

  const filtered = drafts.filter((draft) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      draft.productName?.toLowerCase().includes(term) ||
      draft.heading?.toLowerCase().includes(term);
    return (
      matchesSearch &&
      (categoryFilter === "all" || draft.category === categoryFilter)
    );
  });

  const SORT_CONFIG = [
    { key: "productName", type: "string" },
    { key: "price", type: "number" },
    { key: "lastSaved", type: "date" },
    { key: "createdAt", type: "date" },
    {
      key: "category",
      type: "custom",
      getValue: (d) => getCategoryName(d.category).toLowerCase(),
    },
  ];
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const {
    totalPages,
    startIndex,
    currentItems: currentDrafts,
  } = paginate(sorted);
  const isAllSelected =
    currentDrafts.length > 0 && selectedItems.length === currentDrafts.length;

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

  const handleDelete = (id) => {
    if (window.confirm("Delete this draft?")) deleteDraft(id);
  };
  const handlePublish = (id) => {
    if (window.confirm("Publish this draft?")) publishDraft(id);
  };

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage Drafts"
        subtitle="Edit and review all your product drafts from here."
        actions={[
          {
            label: "All Products",
            to: `${basePath}/products`,
            icon: PackageSearch,
            variant: "secondary",
          },
          {
            label: "New Product",
            to: `${basePath}/products/new`,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by product name or heading..."
        filters={[
          {
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categoryOptions,
            placeholder: "All Categories",
          },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        totalItems={sorted.length}
        itemLabel="drafts"
        onPrevious={goToPrevious}
        onNext={() => goToNext(totalPages)}
        onGoToPage={goToPage}
        getPageNumbers={getPageNumbers}
        bulkCount={selectedItems.length}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkPublish}
        bulkArchiveLabel="Publish"
        bulkExtraActions={[
          {
            label: "Publish Selected",
            icon: Send,
            onClick: handleBulkPublish,
            className: "bg-green-500 hover:bg-green-600",
          },
        ]}
        thead={
          <TableHead
            columns={COLUMNS}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll(currentDrafts)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentDrafts.length > 0 ? (
              currentDrafts.map((draft, index) => (
                <TableRow
                  key={draft.id}
                  id={draft.id}
                  isLast={index === currentDrafts.length - 1}
                  isSelected={selectedItems.includes(draft.id)}
                  onSelect={() => handleSelectOne(draft.id)}
                  actions={
                    <DraftDropdown
                      draftId={draft.id}
                      onDelete={handleDelete}
                      onPublish={handlePublish}
                    />
                  }
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <ThumbnailCell
                        src={getDraftThumbnail(draft)}
                        alt={draft.productName || "Draft"}
                        fallbackLabel="–"
                      />
                      <span className="text-sm text-gray-900 font-medium">
                        {draft.productName || "Untitled Draft"}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {getCategoryName(draft.category)}
                    </p>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {draft.price && parseFloat(draft.price) > 0
                        ? `PHP ${parseFloat(draft.price).toFixed(2)}`
                        : "N/A"}
                    </p>
                  </Td>
                  <Td>
                    <DateCell value={draft.createdAt} />
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {formatTimeAgo(draft.lastSaved)}
                    </p>
                  </Td>
                  <Td>
                    <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                      Draft
                    </span>
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                icon={Edit}
                title="No drafts found"
                subtitle="Start creating a product to save drafts"
                colSpan={8}
                createLink={`${basePath}/products/new`}
                createLabel="Create Product"
              />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default DraftProductTable;
