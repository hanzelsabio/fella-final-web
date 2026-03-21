import TableToolbar from "./TableToolbar";
import TablePagination from "./TablePagination";
import BulkActionBar from "../Action/BulkActionBar";

/**
 * TableLayout
 * The repeated white card shell present in every table:
 * TableToolbar → overflow-x-auto → <table> → TablePagination → BulkActionBar
 *
 * Props:
 *   // Toolbar
 *   searchValue        — controlled search string
 *   onSearchChange     — (value) => void
 *   searchPlaceholder  — input placeholder
 *   filters            — array of { value, onChange, options, placeholder }
 *
 *   // Table content (passed as children)
 *   thead              — <thead> element
 *   tbody              — <tbody> element
 *
 *   // Pagination
 *   currentPage
 *   totalPages
 *   startIndex
 *   totalItems
 *   itemLabel
 *   onPrevious
 *   onNext
 *   onGoToPage
 *   getPageNumbers
 *
 *   // Bulk action bar (only renders when count > 0)
 *   bulkCount          — selectedItems.length
 *   onBulkDelete
 *   onBulkArchive
 *   bulkArchiveLabel
 *   bulkExtraActions   — (optional) extra action buttons
 */
const TableLayout = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  thead,
  tbody,
  currentPage,
  totalPages,
  startIndex,
  totalItems,
  itemLabel,
  onPrevious,
  onNext,
  onGoToPage,
  getPageNumbers,
  bulkCount = 0,
  onBulkDelete,
  onBulkArchive,
  bulkArchiveLabel,
  bulkExtraActions,
}) => (
  <>
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <TableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
      />

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          {thead}
          {tbody}
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        totalItems={totalItems}
        itemLabel={itemLabel}
        onPrevious={onPrevious}
        onNext={onNext}
        onGoToPage={onGoToPage}
        getPageNumbers={getPageNumbers}
      />
    </div>

    {bulkCount > 0 && (
      <BulkActionBar
        count={bulkCount}
        onDelete={onBulkDelete}
        onArchive={onBulkArchive}
        archiveLabel={bulkArchiveLabel}
        extraActions={bulkExtraActions}
      />
    )}
  </>
);

export default TableLayout;
