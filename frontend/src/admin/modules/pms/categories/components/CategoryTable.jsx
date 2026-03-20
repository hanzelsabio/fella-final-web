import { Plus, Archive } from "lucide-react";
import { useCategories } from "../context/CategoryContext";

import useBasePath from "../../../../components/hooks/useBasePath";
import useRowActions from "../../../../components/hooks/useRowActions";
import useBulkActions from "../../../../components/hooks/useBulkActions";
import useTableFilter from "../../../../components/hooks/useTableFilter";
import useTableSort from "../../../../components/hooks/useTableSort";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";
import { STATUS_OPTIONS } from "../../../../components/common/tableConstants";

import TableHeader from "../../../../components/common/TableHeader";
import TableLayout from "../../../../components/common/TableLayout";
import TableHead from "../../../../components/common/TableHead";
import TableRow from "../../../../components/common/TableRow";
import Td from "../../../../components/common/Td";
import StatusBadge from "../../../../components/common/StatusBadge";
import TableEmptyState from "../../../../components/common/TableEmptyState";
import DateCell from "../../../../components/common/DateCell";
import ServerImage from "../../../../components/common/ServerImage";
import CategoryDropdown from "../../../../components/common/Dropdown/ActionsDropdown/CategoryDropdown";

const getActiveCount = (category) =>
  category.active_product_count ??
  (Array.isArray(category.products)
    ? category.products.filter((p) => p.status === "active").length
    : (category.product_count ?? 0));

const COLUMNS = [
  { label: "Category", column: "name", minWidth: "min-w-[200px]" },
  {
    label: "Active Products",
    column: "product_count",
    minWidth: "min-w-[130px]",
  },
  { label: "Created On", column: "created_at", minWidth: "min-w-[150px]" },
  { label: "Updated On", column: "updated_at", minWidth: "min-w-[150px]" },
  {
    label: "Status",
    column: "status",
    minWidth: "min-w-[120px]",
    sortable: false,
  },
];

const SORT_CONFIG = [
  { key: "name", type: "string" },
  { key: "created_at", type: "date" },
  { key: "updated_at", type: "date" },
  { key: "product_count", type: "custom", getValue: getActiveCount },
];

const CategoryTable = () => {
  const { categories, deleteCategory, archiveCategory, restoreCategory } =
    useCategories();
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
  } = usePaginatedTable({ data: categories });

  const filtered = useTableFilter(categories, searchTerm, statusFilter, [
    "name",
    "slug",
  ]);
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const {
    totalPages,
    startIndex,
    currentItems: currentCategories,
  } = paginate(sorted);
  const isAllSelected =
    currentCategories.length > 0 &&
    selectedItems.length === currentCategories.length;

  const { handleDelete, handleArchive } = useRowActions({
    items: categories,
    actions: {
      delete: deleteCategory,
      archive: archiveCategory,
      restore: restoreCategory,
    },
    labels: { singular: "category" },
  });

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: categories,
      selectedItems,
      setSelectedItems,
      actions: {
        delete: deleteCategory,
        archive: archiveCategory,
        restore: restoreCategory,
      },
      labels: { singular: "category", plural: "categories" },
    });

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage Categories"
        subtitle="Review and organize your product categories here."
        actions={[
          {
            label: "New Category",
            to: `${basePath}/categories/new`,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by category name or slug..."
        filters={[
          {
            value: statusFilter,
            onChange: handleStatusChange,
            options: STATUS_OPTIONS,
            placeholder: "Active",
          },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        totalItems={sorted.length}
        itemLabel="categories"
        onPrevious={goToPrevious}
        onNext={() => goToNext(totalPages)}
        onGoToPage={goToPage}
        getPageNumbers={getPageNumbers}
        bulkCount={selectedItems.length}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
        bulkArchiveLabel={bulkArchiveLabel}
        thead={
          <TableHead
            columns={COLUMNS}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll(currentCategories)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentCategories.length > 0 ? (
              currentCategories.map((category, index) => (
                <TableRow
                  key={category.id}
                  id={category.id}
                  isLast={index === currentCategories.length - 1}
                  isSelected={selectedItems.includes(category.id)}
                  onSelect={() => handleSelectOne(category.id)}
                  actions={
                    <CategoryDropdown
                      productId={category.id}
                      productSlug={category.slug}
                      status={category.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  }
                >
                  <Td>
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
                  </Td>
                  <Td>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {getActiveCount(category)}
                    </span>
                  </Td>
                  <Td>
                    <DateCell value={category.created_at} />
                  </Td>
                  <Td>
                    <DateCell value={category.updated_at} />
                  </Td>
                  <Td>
                    <StatusBadge status={category.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                icon={Archive}
                title="No categories found"
                colSpan={7}
                createLink={`${basePath}/categories/new`}
                createLabel="New Category"
              />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default CategoryTable;
