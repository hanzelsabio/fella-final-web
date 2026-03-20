import { useState } from "react";

/**
 * useCmsFilter
 * Lightweight search + status filter state for CMS tables that don't use
 * usePaginatedTable (no pagination, inline-edit style).
 *
 * Usage:
 *   const { searchTerm, statusFilter, setSearchTerm, setStatusFilter } =
 *     useCmsFilter({ defaultStatus: "active" });
 *
 *   const filtered = items.filter((item) => {
 *     const matchesSearch = searchFields.some(f => item[f]?.toLowerCase().includes(searchTerm.toLowerCase()));
 *     return matchesSearch && (statusFilter === "all" || item.status === statusFilter);
 *   });
 */
const useCmsFilter = ({ defaultStatus = "active" } = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(defaultStatus);

  return { searchTerm, setSearchTerm, statusFilter, setStatusFilter };
};

export default useCmsFilter;
