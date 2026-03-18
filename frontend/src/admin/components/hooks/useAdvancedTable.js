import { useState, useMemo } from "react";

const useAdvancedTable = ({
  data = [],
  searchFields = [],
  filterConfig = {}, // { category: { field: "categoryName" }, status: { field: "status" } }
  sortConfig = {}, // { title: (row) => row.title.toLowerCase() }
  itemsPerPage = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  /* ───────────────────────── SEARCH + FILTER ───────────────────────── */

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search
      const matchesSearch =
        searchFields.length === 0 ||
        searchFields.some((field) =>
          row[field]
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        );

      // Filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || value === "all") return true;
        const field = filterConfig[key]?.field;
        return row[field] === value;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, filters, searchFields, filterConfig]);

  /* ───────────────────────── SORTING ───────────────────────── */

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortConfig[sortColumn]) return filteredData;

    const getter = sortConfig[sortColumn];

    return [...filteredData].sort((a, b) => {
      const valA = getter(a);
      const valB = getter(b);

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortOrder, sortConfig]);

  /* ───────────────────────── PAGINATION ───────────────────────── */

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  /* ───────────────────────── HELPERS ───────────────────────── */

  const toggleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const clearSelection = () => setSelectedRows([]);

  return {
    // data
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,

    // search
    searchTerm,
    setSearchTerm,

    // filters
    filters,
    setFilters,

    // sorting
    sortColumn,
    sortOrder,
    toggleSort,

    // selection
    selectedRows,
    toggleRowSelection,
    clearSelection,
  };
};

export default useAdvancedTable;
