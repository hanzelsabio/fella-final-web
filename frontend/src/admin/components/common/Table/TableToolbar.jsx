import { Search, Filter } from "lucide-react";
import CustomDropdown from "../Dropdown/CustomDropdown";

/**
 * TableToolbar
 * Search input + filter dropdowns rendered INSIDE the table card,
 * directly above the <table>. Keeps the search/filter visually
 * attached to the table it controls.
 *
 * Props:
 *   searchValue        — controlled search string
 *   onSearchChange     — (value: string) => void
 *   searchPlaceholder  — input placeholder text
 *   filters            — array of { value, onChange, options, placeholder }
 */
const TableToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
}) => (
  <div className="p-4 sm:p-6">
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
      <div className="relative flex-1 w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
        />
      </div>
      {filters.length > 0 && (
        <div
          className={
            filters.length > 1
              ? "grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto"
              : ""
          }
        >
          {filters.map((f, i) => (
            <CustomDropdown
              key={i}
              value={f.value}
              onChange={f.onChange}
              options={f.options}
              placeholder={f.placeholder}
              icon={Filter}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default TableToolbar;
