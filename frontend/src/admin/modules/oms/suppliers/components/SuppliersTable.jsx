import { Plus } from "lucide-react";
import { useSupplier } from "../context/SupplierContext";

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
import { SupplierDropdown } from "../../../../components/common/Dropdown/Dropdowns";

const COLUMNS = [
  { label: "Supplier", column: "name", minWidth: "min-w-[200px]" },
  {
    label: "Contact No.",
    column: "contact_no",
    minWidth: "min-w-[150px]",
    sortable: false,
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
];

const SuppliersTable = () => {
  const { suppliers, deleteSupplier, archiveSupplier, restoreSupplier } =
    useSupplier();
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
  } = usePaginatedTable({ data: suppliers });

  const filtered = useTableFilter(suppliers, searchTerm, statusFilter, [
    "name",
  ]);
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const { totalPages, startIndex, currentItems } = paginate(sorted);
  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;

  const { handleDelete, handleArchive } = useRowActions({
    items: suppliers,
    actions: {
      delete: deleteSupplier,
      archive: archiveSupplier,
      restore: restoreSupplier,
    },
    labels: { singular: "supplier" },
  });

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: suppliers,
      selectedItems,
      setSelectedItems,
      actions: {
        delete: deleteSupplier,
        archive: archiveSupplier,
        restore: restoreSupplier,
      },
      labels: { singular: "supplier", plural: "suppliers" },
    });

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage Suppliers"
        subtitle="Monitor and manage your suppliers here."
        actions={[
          {
            label: "New Supplier",
            to: `${basePath}/suppliers/new`,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by supplier name..."
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
        itemLabel="suppliers"
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
              currentItems.map((supplier, index) => (
                <TableRow
                  key={supplier.id}
                  id={supplier.id}
                  isLast={index === currentItems.length - 1}
                  isSelected={selectedItems.includes(supplier.id)}
                  onSelect={() => handleSelectOne(supplier.id)}
                  actions={
                    <SupplierDropdown
                      supplierId={supplier.id}
                      supplierSlug={supplier.slug}
                      status={supplier.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  }
                >
                  <Td>
                    <span className="text-sm text-gray-900 font-medium">
                      {supplier.name}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {supplier.contact_no || "—"}
                    </p>
                  </Td>
                  <Td>
                    <DateCell value={supplier.created_at} fallback="—" />
                  </Td>
                  <Td>
                    <DateCell value={supplier.updated_at} fallback="—" />
                  </Td>
                  <Td>
                    <StatusBadge status={supplier.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState title="No suppliers found." colSpan={7} />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default SuppliersTable;
