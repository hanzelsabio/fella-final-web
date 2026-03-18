import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

const SortIcon = ({ column, sortColumn, sortOrder }) => {
  if (sortColumn !== column)
    return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
  return sortOrder === "asc" ? (
    <ArrowUp className="w-3.5 h-3.5 text-blue-500" />
  ) : (
    <ArrowDown className="w-3.5 h-3.5 text-blue-500" />
  );
};

const SortableHeader = ({ column, label, sortColumn, sortOrder, onSort }) => (
  <button
    onClick={() => onSort(column)}
    className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
  >
    <span className="uppercase">{label}</span>
    <SortIcon column={column} sortColumn={sortColumn} sortOrder={sortOrder} />
  </button>
);

export default SortableHeader;
