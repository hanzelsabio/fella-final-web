import { Download, Plus, Archive } from "lucide-react";
import { useColorways } from "../context/ColorwayContext";

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
import ColorwayDropdown from "../../../../components/common/Dropdown/ActionsDropdown/ColorwayDropdown";

const COLUMNS = [
  { label: "Color", column: "name", minWidth: "min-w-[200px]" },
  {
    label: "Hex Code",
    column: "hex_code",
    minWidth: "min-w-[120px]",
    sortable: false,
  },
  { label: "Created On", column: "created_at", minWidth: "min-w-[120px]" },
  { label: "Updated On", column: "updated_at", minWidth: "min-w-[120px]" },
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

const ColorwayTable = () => {
  const { colors, deleteColor, archiveColor, restoreColor } = useColorways();
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
  } = usePaginatedTable({ data: colors });

  const filtered = useTableFilter(colors, searchTerm, statusFilter, [
    "name",
    "slug",
    "hex_code",
    "description",
  ]);
  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const {
    totalPages,
    startIndex,
    currentItems: currentColors,
  } = paginate(sorted);
  const isAllSelected =
    currentColors.length > 0 && selectedItems.length === currentColors.length;

  const { handleDelete, handleArchive } = useRowActions({
    items: colors,
    actions: {
      delete: deleteColor,
      archive: archiveColor,
      restore: restoreColor,
    },
    labels: { singular: "colorway" },
  });

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: colors,
      selectedItems,
      setSelectedItems,
      actions: {
        delete: deleteColor,
        archive: archiveColor,
        restore: restoreColor,
      },
      labels: { singular: "colorway", plural: "colorways" },
    });

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage Colorways"
        subtitle="Review all your available colorways for your future products here."
        actions={[
          { label: "Export", to: "", icon: Download, variant: "secondary" },
          {
            label: "New Colorway",
            to: `${basePath}/colorways/new`,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by color name, slug, or hex code"
        filters={[
          {
            value: statusFilter,
            onChange: handleStatusChange,
            options: STATUS_OPTIONS,
            placeholder: "All Status",
          },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        totalItems={sorted.length}
        itemLabel="colorways"
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
            onSelectAll={handleSelectAll(currentColors)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentColors.length > 0 ? (
              currentColors.map((colorway, index) => (
                <TableRow
                  key={colorway.id}
                  id={colorway.id}
                  isLast={index === currentColors.length - 1}
                  isSelected={selectedItems.includes(colorway.id)}
                  onSelect={() => handleSelectOne(colorway.id)}
                  actions={
                    <ColorwayDropdown
                      colorId={colorway.id}
                      status={colorway.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  }
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      {colorway.hex_code && (
                        <span
                          className="w-5 h-5 border border-gray-300 rounded"
                          style={{ backgroundColor: colorway.hex_code }}
                        />
                      )}
                      <span className="text-sm text-gray-900 font-medium">
                        {colorway.name}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-sm text-gray-500 font-mono">
                      {colorway.hex_code || "N/A"}
                    </p>
                  </Td>
                  <Td>
                    <DateCell value={colorway.created_at} />
                  </Td>
                  <Td>
                    <DateCell value={colorway.updated_at} />
                  </Td>
                  <Td>
                    <StatusBadge status={colorway.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                icon={Archive}
                title="No colorway found"
                subtitle={
                  searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by adding your first colorway"
                }
                colSpan={7}
                {...(!searchTerm &&
                  statusFilter === "all" && {
                    createLink: `${basePath}/colorways/new`,
                    createLabel: "New Colorway",
                  })}
              />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default ColorwayTable;
