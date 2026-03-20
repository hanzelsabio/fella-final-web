/**
 * TableRow
 * Wraps the repeated <tr> border logic, checkbox <td>, and actions <td>.
 * Each table only provides the unique data cells in between.
 *
 * Props:
 *   id          — item id (for checkbox checked state)
 *   isLast      — if true, omits the bottom border
 *   isSelected  — checkbox checked state
 *   onSelect    — checkbox onChange handler
 *   actions     — the dropdown/action component for the last cell
 *   children    — the unique data <td> cells in between
 *
 * Usage:
 *   <TableRow
 *     id={item.id}
 *     isLast={index === currentItems.length - 1}
 *     isSelected={selectedItems.includes(item.id)}
 *     onSelect={() => handleSelectOne(item.id)}
 *     actions={<ActionsDropdown ... />}
 *   >
 *     <td className="px-4 sm:px-6 py-5">...</td>
 *     <td className="px-4 sm:px-6 py-5">...</td>
 *   </TableRow>
 */
const TableRow = ({ id, isLast, isSelected, onSelect, actions, children }) => (
  <tr
    className={`${!isLast ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
  >
    <td className="px-6 pt-5 pb-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
      />
    </td>

    {children}

    <td className="text-end px-4 sm:px-6 py-5">{actions}</td>
  </tr>
);

export default TableRow;
