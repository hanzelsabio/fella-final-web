import { Plus } from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { getImageUrl } from "../../../../../services/imageUrl";

import useBasePath from "../../../../components/hooks/useBasePath";
import useRowActions from "../../../../components/hooks/useRowActions";
import useBulkActions from "../../../../components/hooks/useBulkActions";
import useTableFilter from "../../../../components/hooks/useTableFilter";
import useTableSort from "../../../../components/hooks/useTableSort";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";
import { STATUS_OPTIONS } from "../../../../components/common/Table/tableConstants";

import TableHeader from "../../../../components/common/Table/TableHeader";
import TableLayout from "../../../../components/common/Table/TableLayout";
import TableHead from "../../../../components/common/Table/TableHead";
import TableRow from "../../../../components/common/Table/TableRow";
import TableEmptyState from "../../../../components/common/Table/TableEmptyState";
import StatusBadge from "../../../../components/common/StatusBadge";
import DateCell from "../../../../components/common/Cell/DateCell";
import Td from "../../../../components/common/Table/Td";
import { InventoryDropdown } from "../../../../components/common/Dropdown/Dropdowns";

// ── Stock badge (inventory-specific) ────────────────────────────────────────
const StockBadge = ({ quantity }) => {
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

const COLUMNS = [
  { label: "Item", column: "name", minWidth: "min-w-[200px]" },
  { label: "Quantity", column: "quantity", minWidth: "min-w-[150px]" },
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
  { key: "quantity", type: "number" },
  { key: "created_at", type: "date" },
  { key: "updated_at", type: "date" },
];

const InventoryTable = () => {
  const { inventory, deleteItem, archiveItem, restoreItem } = useInventory();
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
  } = usePaginatedTable({ data: inventory });

  const filtered = useTableFilter(inventory, searchTerm, statusFilter, [
    "name",
  ]);
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const { totalPages, startIndex, currentItems } = paginate(sorted);
  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;

  const { handleDelete, handleArchive } = useRowActions({
    items: inventory,
    actions: { delete: deleteItem, archive: archiveItem, restore: restoreItem },
    labels: { singular: "item" },
  });

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: inventory,
      selectedItems,
      setSelectedItems,
      actions: {
        delete: deleteItem,
        archive: archiveItem,
        restore: restoreItem,
      },
      labels: { singular: "item", plural: "items" },
    });

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage Inventory"
        subtitle="Monitor and manage your stored items."
        actions={[
          {
            label: "New Item",
            to: `${basePath}/inventory/new`,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by item name..."
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
        itemLabel="items"
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
            onSelectAll={handleSelectAll(currentItems)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <TableRow
                  key={item.id}
                  id={item.id}
                  isLast={index === currentItems.length - 1}
                  isSelected={selectedItems.includes(item.id)}
                  onSelect={() => handleSelectOne(item.id)}
                  actions={
                    <InventoryDropdown
                      itemId={item.id}
                      itemSlug={item.slug}
                      status={item.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  }
                >
                  <Td>
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
                          <Plus className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-900 font-medium">
                        {item.name}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <StockBadge quantity={item.quantity} />
                  </Td>
                  <Td>
                    <DateCell value={item.created_at} fallback="—" />
                  </Td>
                  <Td>
                    <DateCell value={item.updated_at} fallback="—" />
                  </Td>
                  <Td>
                    <StatusBadge status={item.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState title="No inventory items found." colSpan={7} />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default InventoryTable;
