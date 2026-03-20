import { useState } from "react";
import { SquarePen, Plus } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { getImageUrl } from "../../../../../services/imageUrl";

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
import ThumbnailCell from "../../../../components/common/ThumbnailCell";
import ActionsDropdown from "../../../../components/common/ActionsDropdown";

const COLUMNS = [
  { label: "Product Name", column: "title", minWidth: "min-w-[200px]" },
  { label: "Category", column: "category", minWidth: "min-w-[150px]" },
  { label: "Price", column: "price", minWidth: "min-w-[150px]" },
  { label: "Created On", column: "created_at", minWidth: "min-w-[170px]" },
  { label: "Updated On", column: "updated_at", minWidth: "min-w-[170px]" },
  {
    label: "Status",
    column: "status",
    minWidth: "min-w-[150px]",
    sortable: false,
  },
];

const SORT_CONFIG = [
  { key: "title", type: "string" },
  { key: "category", type: "string" },
  { key: "price", type: "number" },
  { key: "created_at", type: "date" },
  { key: "updated_at", type: "date" },
];

const ProductTable = () => {
  const { products, deleteProduct, archiveProduct, restoreProduct } =
    useProducts();
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
  } = usePaginatedTable({ data: products });

  const [categoryFilter, setCategoryFilter] = useState("all");

  const uniqueCategoryNames = [
    ...new Set(products.map((p) => p.categoryName).filter(Boolean)),
  ];
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...uniqueCategoryNames.map((name) => ({ value: name, label: name })),
  ];

  const filtered = useTableFilter(products, searchTerm, statusFilter, [
    "title",
    "slug",
  ]).filter(
    (p) => categoryFilter === "all" || p.categoryName === categoryFilter,
  );
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const {
    totalPages,
    startIndex,
    currentItems: currentProducts,
  } = paginate(sorted);
  const isAllSelected =
    currentProducts.length > 0 &&
    selectedItems.length === currentProducts.length;

  const { handleDelete, handleArchive } = useRowActions({
    items: products,
    actions: {
      delete: deleteProduct,
      archive: archiveProduct,
      restore: restoreProduct,
    },
    labels: { singular: "product" },
  });

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: products,
      selectedItems,
      setSelectedItems,
      actions: {
        delete: deleteProduct,
        archive: archiveProduct,
        restore: restoreProduct,
      },
      labels: { singular: "product", plural: "products" },
    });

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage Product"
        subtitle="Manage and track all your products from here."
        actions={[
          {
            label: "All Drafts",
            to: `${basePath}/products/drafts`,
            icon: SquarePen,
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
        searchPlaceholder="Search by product name..."
        filters={[
          {
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categoryOptions,
            placeholder: "All Categories",
          },
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
        itemLabel="products"
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
            onSelectAll={handleSelectAll(currentProducts)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product, index) => (
                <TableRow
                  key={product.id}
                  id={product.id}
                  isLast={index === currentProducts.length - 1}
                  isSelected={selectedItems.includes(product.id)}
                  onSelect={() => handleSelectOne(product.id)}
                  actions={
                    <ActionsDropdown
                      productId={product.id}
                      productSlug={product.slug}
                      status={product.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  }
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <ThumbnailCell
                        src={getImageUrl(product.productImages?.[0]?.url)}
                        alt={product.title}
                      />
                      <span className="text-sm text-gray-900 font-medium">
                        {product.title}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {product.categoryName || "N/A"}
                    </p>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {product.price
                        ? `PHP ${parseFloat(product.price).toFixed(2)}`
                        : "N/A"}
                    </p>
                  </Td>
                  <Td>
                    <DateCell value={product.created_at} />
                  </Td>
                  <Td>
                    <DateCell value={product.updated_at} />
                  </Td>
                  <Td>
                    <StatusBadge status={product.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                title="No products found matching your search criteria."
                colSpan={8}
              />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default ProductTable;
