import { Plus } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";

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
import { CustomerDropdown } from "../../../../components/common/Dropdown/Dropdowns";

const COLUMNS = [
  { label: "Customer", column: "name", minWidth: "min-w-[200px]" },
  {
    label: "Contact No.",
    column: "contact_no",
    minWidth: "min-w-[170px]",
    sortable: false,
  },
  { label: "Email", column: "email", minWidth: "min-w-[200px]" },
  { label: "Created On", column: "created_at", minWidth: "min-w-[170px]" },
  { label: "Updated On", column: "updated_at", minWidth: "min-w-[170px]" },
  {
    label: "Status",
    column: "status",
    minWidth: "min-w-[120px]",
    sortable: false,
  },
];

const SORT_CONFIG = [
  { key: "name", type: "string" },
  { key: "email", type: "string" },
  { key: "created_at", type: "date" },
  { key: "updated_at", type: "date" },
];

const CustomersTable = () => {
  const { customers, deleteCustomer, archiveCustomer, restoreCustomer } =
    useCustomer();
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
  } = usePaginatedTable({ data: customers });

  const filtered = useTableFilter(customers, searchTerm, statusFilter, [
    "name",
    "email",
  ]);
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const { totalPages, startIndex, currentItems } = paginate(sorted);
  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;

  const { handleDelete, handleArchive } = useRowActions({
    items: customers,
    actions: {
      delete: deleteCustomer,
      archive: archiveCustomer,
      restore: restoreCustomer,
    },
    labels: { singular: "customer" },
  });

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: customers,
      selectedItems,
      setSelectedItems,
      actions: {
        delete: deleteCustomer,
        archive: archiveCustomer,
        restore: restoreCustomer,
      },
      labels: { singular: "customer", plural: "customers" },
    });

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage Customers"
        subtitle="Monitor and manage your customers here."
        actions={[
          {
            label: "New Customer",
            to: `${basePath}/customers/new`,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name or email..."
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
        itemLabel="customers"
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
              currentItems.map((customer, index) => (
                <TableRow
                  key={customer.id}
                  id={customer.id}
                  isLast={index === currentItems.length - 1}
                  isSelected={selectedItems.includes(customer.id)}
                  onSelect={() => handleSelectOne(customer.id)}
                  actions={
                    <CustomerDropdown
                      customerId={customer.id}
                      customerSlug={customer.slug}
                      status={customer.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  }
                >
                  <Td>
                    <span className="text-sm text-gray-900 font-medium">
                      {customer.name}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {customer.contact_no || "—"}
                    </p>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500">
                      {customer.email || "—"}
                    </p>
                  </Td>
                  <Td>
                    <DateCell value={customer.created_at} fallback="—" />
                  </Td>
                  <Td>
                    <DateCell value={customer.updated_at} fallback="—" />
                  </Td>
                  <Td>
                    <StatusBadge status={customer.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState title="No customers found." colSpan={8} />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default CustomersTable;
