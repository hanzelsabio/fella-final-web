/**
 * useTableFilter
 * Filters an array by search term (across multiple fields) and status.
 *
 * @param {Array}    items        - full data array
 * @param {string}   searchTerm   - text to search for
 * @param {string}   statusFilter - "all" | "active" | "archived" (or any status string)
 * @param {string[]} searchFields - item keys to search within, e.g. ["name", "slug"]
 *
 * Usage:
 *   const filtered = useTableFilter(categories, searchTerm, statusFilter, ["name", "slug"]);
 */
const useTableFilter = (items, searchTerm, statusFilter, searchFields) => {
  const term = searchTerm.toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      !term ||
      searchFields.some((field) => item[field]?.toLowerCase().includes(term));
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export default useTableFilter;
