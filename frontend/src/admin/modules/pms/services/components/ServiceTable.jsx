import { Download, Plus, Archive } from "lucide-react";
import { useServices } from "../context/ServiceContext";

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
import Td from "../../../../components/common/Table/Td";
import StatusBadge from "../../../../components/common/StatusBadge";
import TableEmptyState from "../../../../components/common/Table/TableEmptyState";
import DateCell from "../../../../components/common/Cell/DateCell";
import ServerImage from "../../../../components/common/ServerImage";
import { ServiceDropdown } from "../../../../components/common/Dropdown/Dropdowns";

const COLUMNS = [
  { label: "Service", column: "name", minWidth: "min-w-[250px]" },
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

const ServiceTable = () => {
  const { services, deleteService, archiveService, restoreService } =
    useServices();
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
  } = usePaginatedTable({ data: services });

  const filtered = useTableFilter(services, searchTerm, statusFilter, [
    "name",
    "slug",
    "description",
  ]);
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const {
    totalPages,
    startIndex,
    currentItems: currentServices,
  } = paginate(sorted);
  const isAllSelected =
    currentServices.length > 0 &&
    selectedItems.length === currentServices.length;

  const { handleDelete, handleArchive } = useRowActions({
    items: services,
    actions: {
      delete: deleteService,
      archive: archiveService,
      restore: restoreService,
    },
    labels: { singular: "service" },
  });

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: services,
      selectedItems,
      setSelectedItems,
      actions: {
        delete: deleteService,
        archive: archiveService,
        restore: restoreService,
      },
      labels: { singular: "service", plural: "services" },
    });

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage Services"
        subtitle="Manage all your product services and offerings."
        actions={[
          { label: "Export", to: "", icon: Download, variant: "secondary" },
          {
            label: "New Service",
            to: `${basePath}/services/new`,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by service name, slug, or description..."
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
        itemLabel="services"
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
            onSelectAll={handleSelectAll(currentServices)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentServices.length > 0 ? (
              currentServices.map((service, index) => (
                <TableRow
                  key={service.id}
                  id={service.id}
                  isLast={index === currentServices.length - 1}
                  isSelected={selectedItems.includes(service.id)}
                  onSelect={() => handleSelectOne(service.id)}
                  actions={
                    <ServiceDropdown
                      serviceId={service.id}
                      serviceSlug={service.slug}
                      status={service.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  }
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      {service.image && (
                        <ServerImage
                          src={service.image}
                          alt={service.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <span className="text-sm text-gray-900 font-medium">
                        {service.name}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <DateCell value={service.created_at} />
                  </Td>
                  <Td>
                    <DateCell value={service.updated_at} />
                  </Td>
                  <Td>
                    <StatusBadge status={service.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                icon={Archive}
                title="No services found"
                subtitle={
                  searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by adding your first service"
                }
                colSpan={6}
                {...(!searchTerm &&
                  statusFilter === "all" && {
                    createLink: `${basePath}/services/new`,
                    createLabel: "New Service",
                  })}
              />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default ServiceTable;
