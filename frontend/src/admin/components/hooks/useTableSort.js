/**
 * useTableSort
 * Sorts an array by a given column + direction.
 *
 * @param {Array}  items       - filtered array to sort
 * @param {string} sortColumn  - active sort key
 * @param {string} sortOrder   - "asc" | "desc"
 * @param {Array}  sortConfig  - [{ key, type: "string"|"number"|"date"|"custom", getValue? }]
 *
 * Each config entry maps a sortColumn value to how that column should be compared.
 * For "custom", supply a getValue(item) function that returns a comparable primitive.
 *
 * Usage:
 *   const sortedItems = useTableSort(filteredItems, sortColumn, sortOrder, [
 *     { key: "name",       type: "string" },
 *     { key: "price",      type: "number" },
 *     { key: "created_at", type: "date"   },
 *     { key: "count",      type: "custom", getValue: (item) => getCount(item) },
 *   ]);
 */
const useTableSort = (items, sortColumn, sortOrder, sortConfig) => {
  const config = sortConfig.find((c) => c.key === sortColumn);
  if (!config) return items;

  return [...items].sort((a, b) => {
    let valA, valB;

    switch (config.type) {
      case "string":
        valA = (a[config.key] ?? "").toLowerCase();
        valB = (b[config.key] ?? "").toLowerCase();
        break;
      case "number":
        valA = parseFloat(a[config.key] ?? 0);
        valB = parseFloat(b[config.key] ?? 0);
        break;
      case "date":
        valA = new Date(a[config.key] ?? 0);
        valB = new Date(b[config.key] ?? 0);
        break;
      case "custom":
        valA = config.getValue(a);
        valB = config.getValue(b);
        break;
      default:
        return 0;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};

export default useTableSort;
