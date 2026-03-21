import { Search, Filter } from "lucide-react";
import CustomDropdown from "../Dropdown/CustomDropdown";

/**
 * CmsTableToolbar
 * Search input + status filter dropdown for CMS inline-edit tables.
 * Similar to TableToolbar but accepts direct value/onChange props
 * instead of the array-of-filters pattern.
 *
 * Props:
 *   searchValue       — controlled search string
 *   onSearchChange    — (value) => void
 *   searchPlaceholder — input placeholder
 *   statusFilter      — current status value
 *   onStatusChange    — (value) => void
 *   statusOptions     — array of { value, label }
 *   extraFilters      — optional array of additional { value, onChange, options, placeholder }
 */
const CmsTableToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusFilter,
  onStatusChange,
  statusOptions,
  extraFilters = [],
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
      <div
        className={extraFilters.length > 0 ? "flex gap-3 w-full md:w-auto" : ""}
      >
        {extraFilters.map((f, i) => (
          <CustomDropdown
            key={i}
            value={f.value}
            onChange={f.onChange}
            options={f.options}
            placeholder={f.placeholder}
            icon={Filter}
          />
        ))}
        <CustomDropdown
          value={statusFilter}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="Active"
          icon={Filter}
        />
      </div>
    </div>
  </div>
);

export default CmsTableToolbar;
