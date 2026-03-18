import { useState, useMemo } from "react";

const ITEMS_PER_PAGE = 10;

export const useProductTable = (products) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");

  // ── Category Options ─────────────────────
  const categoryOptions = useMemo(() => {
    const unique = [
      ...new Set(products.map((p) => p.categoryName).filter(Boolean)),
    ];

    return [
      { value: "all", label: "All Categories" },
      ...unique.map((name) => ({ value: name, label: name })),
    ];
  }, [products]);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filtering ────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.slug?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.categoryName === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // ── Sorting ──────────────────────────────
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [filteredProducts, sortOrder]);

  // ── Pagination ───────────────────────────
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    sortOrder,
    toggleSortOrder,
    categoryOptions,
    statusOptions,
    filteredProducts,
    sortedProducts,
    currentProducts,
    totalPages,
    startIndex,
    endIndex,
  };
};
