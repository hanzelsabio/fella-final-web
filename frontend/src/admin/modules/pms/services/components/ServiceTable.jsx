import { Link, useLocation } from "react-router-dom";
import { useServices } from "../context/ServiceContext";
import { Download, Plus, Search, Filter, Archive } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import ServerImage from "../../../../components/common/ServerImage";
import ServiceDropdown from "../../../../components/common/Dropdown/ActionsDropdown/ServiceDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const ServiceTable = () => {
  const { services, deleteService, archiveService, restoreService } =
    useServices();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  const {
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
  } = usePaginatedTable({ data: services });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch &&
      (statusFilter === "all" || service.status === statusFilter)
    );
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedServices = [...filteredServices].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "name":
        valA = a.name?.toLowerCase() ?? "";
        valB = b.name?.toLowerCase() ?? "";
        break;
      case "updated_at":
        valA = new Date(a.updated_at ?? 0);
        valB = new Date(b.updated_at ?? 0);
        break;
      case "created_at":
      default:
        valA = new Date(a.created_at ?? 0);
        valB = new Date(b.created_at ?? 0);
        break;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const {
    totalPages,
    startIndex,
    currentItems: currentServices,
  } = paginate(sortedServices);
  const isAllSelected =
    currentServices.length > 0 &&
    selectedItems.length === currentServices.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} service(s)?`)) return;
    for (const id of selectedItems) await deleteService(id);
    setSelectedItems([]);
    alert("Selected services deleted.");
  };

  const handleBulkArchive = async () => {
    const first = services.find((s) => s.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedItems.length} service(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreService(id);
      else await archiveService(id);
    }
    setSelectedItems([]);
    alert(`Selected services ${action}d.`);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = services.find((s) => s.id === selectedItems[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  // ── Row-level actions ───────────────────────────────────────────
  const handleDelete = async (serviceId) => {
    if (window.confirm("Delete this service?")) {
      const result = await deleteService(serviceId);
      alert(
        result.success
          ? "Service deleted successfully"
          : "Failed: " + result.message,
      );
    }
  };

  const handleArchive = async (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (service.status === "archived") {
      if (window.confirm("Restore this service?")) {
        const result = await restoreService(serviceId);
        alert(
          result.success
            ? "Service restored successfully"
            : "Failed: " + result.message,
        );
      }
    } else {
      if (window.confirm("Archive this service?")) {
        const result = await archiveService(serviceId);
        alert(
          result.success
            ? "Service archived successfully"
            : "Failed: " + result.message,
        );
      }
    }
  };

  return (
    <div className="pb-4">
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-lg font-bold">Manage Services</h2>
            <p className="text-xs text-gray-600">
              Manage all your product services and offerings
            </p>
          </div>
          <div className="flex text-xs gap-3 flex-shrink-0 self-end sm:self-auto">
            <Link
              to=""
              className="bg-white border border-gray-300 text-black rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Export</span>
                <Download className="w-4 h-4" />
              </div>
            </Link>
            <Link
              to={`${basePath}/services/new`}
              className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service name, slug, or description..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <CustomDropdown
              value={statusFilter}
              onChange={handleStatusChange}
              options={statusOptions}
              placeholder="Active"
              icon={Filter}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="min-w-[50px] px-6 pt-5 pb-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll(currentServices)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[250px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="name"
                    label="Service"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="created_at"
                    label="Created On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="updated_at"
                    label="Updated On"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[120px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-end" />
              </tr>
            </thead>
            <tbody>
              {currentServices.length > 0 ? (
                currentServices.map((service, index) => (
                  <tr
                    key={service.id}
                    className={`${index !== currentServices.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(service.id)}
                        onChange={() => handleSelectOne(service.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-center gap-3">
                        {service.image && (
                          <ServerImage
                            src={service.image}
                            alt={service.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <span className="text-sm text-gray-900 font-medium">
                          {service.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {service.created_at
                          ? new Date(service.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {service.updated_at
                          ? new Date(service.updated_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${service.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {service.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
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
                  <td colSpan="6" className="px-4 sm:px-6 py-12 text-center">
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
                          to={`${basePath}/services/new`}
                          className="mt-2 bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="w-3 h-3" />
                            <span>Add Service</span>
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

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          totalItems={sortedServices.length}
          itemLabel="services"
          onPrevious={goToPrevious}
          onNext={() => goToNext(totalPages)}
          onGoToPage={goToPage}
          getPageNumbers={getPageNumbers}
        />
      </div>

      {hasSelection && (
        <BulkActionBar
          count={selectedItems.length}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          archiveLabel={bulkArchiveLabel}
        />
      )}
    </div>
  );
};

export default ServiceTable;
