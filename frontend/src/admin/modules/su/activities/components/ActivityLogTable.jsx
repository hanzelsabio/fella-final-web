import { Link } from "react-router-dom";
import { useState } from "react";
import { useProducts } from "../../../../../context/ProductContext";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Archive,
  ArrowUpDown,
  Trash2,
} from "lucide-react";

import ServiceDropdown from "../../../../components/common/Dropdown/ActionsDropdown/ServiceDropdown";

const ActivityLogTable = () => {
  const { services, deleteService, archiveService, restoreService } =
    useProducts();
  const [selectedService, setSelectedService] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // default status
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 10;

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort by created_at
  const sortedServices = [...filteredServices].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = sortedServices.slice(startIndex, endIndex);

  // ── Checkbox logic ──────────────────────────────────────────────
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedService(currentServices.map((s) => s.id));
    } else {
      setSelectedService([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedService((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const isAllSelected =
    currentServices.length > 0 &&
    selectedService.length === currentServices.length;

  const hasSelection = selectedService.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedService.length} service(s)?`,
      )
    )
      return;

    for (const id of selectedService) {
      await deleteService(id);
    }
    setSelectedService([]);
    alert("Selected services deleted.");
  };

  const handleBulkArchive = async () => {
    // Determine if we're archiving or restoring based on first selected item
    const firstService = services.find((s) => s.id === selectedService[0]);
    const isArchived = firstService?.status === "archived";
    const action = isArchived ? "restore" : "archive";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${selectedService.length} service(s)?`,
      )
    )
      return;

    for (const id of selectedService) {
      if (isArchived) {
        await restoreService(id);
      } else {
        await archiveService(id);
      }
    }
    setSelectedService([]);
    alert(`Selected services ${action}d.`);
  };

  // ── Filter/sort/page handlers ────────────────────────────────────
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    setSelectedService([]);
  };
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };
  const goToPage = (page) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
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
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // ── Row-level actions ────────────────────────────────────────────
  const handleDelete = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      const result = await deleteService(serviceId);
      alert(
        result.success
          ? "Service deleted successfully"
          : "Failed to delete service: " + result.message,
      );
    }
  };

  const handleArchive = async (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (service.status === "archived") {
      if (window.confirm("Are you sure you want to restore this service?")) {
        const result = await restoreService(serviceId);
        alert(
          result.success
            ? "Service restored successfully"
            : "Failed to restore service: " + result.message,
        );
      }
    } else {
      if (window.confirm("Are you sure you want to archive this service?")) {
        const result = await archiveService(serviceId);
        alert(
          result.success
            ? "Service archived successfully"
            : "Failed to archive service: " + result.message,
        );
      }
    }
  };

  // Determine bulk archive button label based on selection
  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const firstService = services.find((s) => s.id === selectedService[0]);
    return firstService?.status === "archived" ? "Unarchive" : "Archive";
  })();

  return (
    <div className="pb-4">
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-lg font-bold">Recent Activities</h2>
            <p className="text-xs text-gray-600">
              Manage and track all your activities here
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service name, slug, or description..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="min-w-[50px] px-6 pt-5 pb-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[250px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  ID
                </th>
                <th className="min-w-[250px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Description
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <div className="flex items-center gap-2">
                    <span> Created On</span>
                    <button
                      onClick={toggleSortOrder}
                      className="hover:bg-gray-200 p-1 rounded transition-colors"
                      title={
                        sortOrder === "desc"
                          ? "Sort oldest first"
                          : "Sort latest first"
                      }
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-end"></th>
              </tr>
            </thead>
            <tbody>
              {currentServices.length > 0 ? (
                currentServices.map((service, index) => (
                  <tr
                    key={service.id}
                    className={`${
                      index !== currentServices.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    } hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedService.includes(service.id)}
                        onChange={() => handleSelectOne(service.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">{service.id}</td>
                    <td className="px-4 sm:px-6 py-5">
                      {service.description || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {service.created_at
                          ? new Date(service.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="text-end items-center justify-center px-4 sm:px-6 py-5">
                      <ServiceDropdown
                        serviceId={service.id}
                        serviceSlug={service.slug}
                        status={service.status}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 sm:px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Archive className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">
                        No services found
                      </p>
                      <p className="text-gray-400 text-xs">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Start by adding your first service"}
                      </p>
                      {!searchTerm && statusFilter === "all" && (
                        <Link
                          to="/admin/services/new"
                          className="mt-2 bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2 text-xs transition-colors"
                        >
                          <div className="flex items-center">
                            <Plus className="w-3 h-3" />
                            <span className="ps-2">Add Service</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 sm:px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, sortedServices.length)} of{" "}
              {sortedServices.length} services
            </div>
            <div className="flex items-center justify-between w-full md:hidden">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border ${
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border ${
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border ${
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    disabled={page === "..."}
                    className={`min-w-[36px] px-3 py-2 text-sm rounded-md ${
                      page === currentPage
                        ? "bg-blue-500 text-white font-medium"
                        : page === "..."
                          ? "text-gray-400 cursor-default"
                          : "text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border ${
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar — only visible when items are selected */}
      {hasSelection && (
        <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
            <div>
              <h2 className="text-sm font-medium">
                {selectedService.length} item
                {selectedService.length !== 1 ? "s" : ""} selected
              </h2>
            </div>
            <div className="flex text-xs gap-3 flex-shrink-0 self-center sm:self-auto">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-3 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </div>
              </button>
              <button
                type="button"
                onClick={handleBulkArchive}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-3 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <Archive className="w-4 h-4" />
                  <span>{bulkArchiveLabel}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogTable;
