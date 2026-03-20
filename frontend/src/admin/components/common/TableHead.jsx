import SortableHeader from "./SortableHeader";

/**
 * TableHead
 * Config-driven <thead> — eliminates the repeated <th> markup in every table.
 *
 * Props:
 *   columns       — array of column definitions (see below)
 *   isAllSelected — checkbox state
 *   onSelectAll   — checkbox onChange handler
 *
 * Column definition:
 *   { label, column, minWidth, sortable?, align? }
 *
 *   label     — display text, e.g. "Created On"
 *   column    — sort key passed to SortableHeader, e.g. "created_at"
 *   minWidth  — Tailwind min-w class string, e.g. "min-w-[150px]"
 *   sortable  — boolean (default true). false = plain <th> with just label
 *   align     — "end" for the actions column (default left)
 *
 * Usage:
 *   <TableHead
 *     columns={COLUMNS}
 *     isAllSelected={isAllSelected}
 *     onSelectAll={handleSelectAll(currentItems)}
 *     sortColumn={sortColumn}
 *     sortOrder={sortOrder}
 *     onSort={handleSort}
 *   />
 */
const TableHead = ({
  columns,
  isAllSelected,
  onSelectAll,
  sortColumn,
  sortOrder,
  onSort,
}) => (
  <thead>
    <tr className="bg-gray-50 text-left">
      {/* Checkbox column */}
      <th className="min-w-[50px] px-6 pt-5 pb-4">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
        />
      </th>

      {/* Data columns */}
      {columns.map(({ label, column, minWidth, sortable = true, align }) => (
        <th
          key={column}
          className={`${minWidth} px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase${align === "end" ? " text-end" : ""}`}
        >
          {sortable ? (
            <SortableHeader
              column={column}
              label={label}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSort={onSort}
            />
          ) : (
            label
          )}
        </th>
      ))}

      {/* Actions column */}
      <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-end" />
    </tr>
  </thead>
);

export default TableHead;
