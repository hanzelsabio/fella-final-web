import { useState } from "react";

export const usePaginatedTable = ({
  data,
  itemsPerPage = 10,
  defaultSortColumn = "created_at",
  defaultSortOrder = "desc",
  defaultStatusFilter = "active",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(defaultSortColumn);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder(column === "name" ? "asc" : "desc");
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = (totalPages) =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleSelectAll = (currentItems) => (e) =>
    setSelectedItems(e.target.checked ? currentItems.map((i) => i.id) : []);
  const handleSelectOne = (id) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const paginate = (sortedData) => {
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = sortedData.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
    return { totalPages, startIndex, currentItems };
  };

  const getPageNumbers = (totalPages) => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return {
    searchTerm,
    statusFilter,
    currentPage,
    sortColumn,
    sortOrder,
    selectedItems,
    setSelectedItems,
    handleSort,
    handleSearchChange,
    handleStatusChange,
    goToPage,
    goToPrevious,
    goToNext,
    paginate,
    getPageNumbers,
    handleSelectAll,
    handleSelectOne,
  };
};
