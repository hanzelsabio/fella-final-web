import { Link } from "react-router-dom";
import { useState } from "react";
import { useSystemUser } from "../context/SystemUserContext";
import { Plus, Search, Filter } from "lucide-react";

import CustomDropdown from "../../../../components/common/CustomDropdown";
import SystemUserDropdown from "../../../../components/common/Dropdown/ActionsDropdown/SystemUserDropdown";
import SortableHeader from "../../../../components/common/SortableHeader";
import TablePagination from "../../../../components/common/TablePagination";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";

const roleBadge = (role) => {
  const map = {
    admin: "bg-purple-100 text-purple-700",
    manager: "bg-blue-100 text-blue-700",
    staff: "bg-gray-100 text-gray-600",
  };
  return map[role] || "bg-gray-100 text-gray-600";
};

const UsersTable = () => {
  const { systemUsers, deleteUser, archiveUser, restoreUser } = useSystemUser();

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
  } = usePaginatedTable({ data: systemUsers });

  // ── Role filter (extra — not in hook) ───────────────────────────
  const [roleFilter, setRoleFilter] = useState("all");
  const handleRoleChange = (v) => {
    setRoleFilter(v);
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filteredUsers = systemUsers.filter((u) => {
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // ── Sort ────────────────────────────────────────────────────────
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case "name":
        valA = `${a.first_name} ${a.last_name}`.toLowerCase();
        valB = `${b.first_name} ${b.last_name}`.toLowerCase();
        break;
      case "user_id":
        valA = a.user_id?.toLowerCase() ?? "";
        valB = b.user_id?.toLowerCase() ?? "";
        break;
      case "updated_at":
        valA = new Date(a.updated_at ?? 0);
        valB = new Date(b.updated_at ?? 0);
        break;
      case "last_login":
        valA = new Date(a.last_login ?? 0);
        valB = new Date(b.last_login ?? 0);
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

  const { totalPages, startIndex, currentItems } = paginate(sortedUsers);
  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;
  const hasSelection = selectedItems.length > 0;

  // ── Bulk actions ────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} user(s)?`)) return;
    for (const id of selectedItems) await deleteUser(id);
    setSelectedItems([]);
  };

  const handleBulkArchive = async () => {
    const first = systemUsers.find((u) => u.id === selectedItems[0]);
    const isArchived = first?.status === "archived";
    if (
      !window.confirm(
        `${isArchived ? "Restore" : "Archive"} ${selectedItems.length} user(s)?`,
      )
    )
      return;
    for (const id of selectedItems) {
      if (isArchived) await restoreUser(id);
      else await archiveUser(id);
    }
    setSelectedItems([]);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    return systemUsers.find((u) => u.id === selectedItems[0])?.status ===
      "archived"
      ? "Unarchive"
      : "Archive";
  })();

  // ── Row-level actions ───────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      const result = await deleteUser(id);
      alert(result.success ? "User deleted." : "Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const user = systemUsers.find((u) => u.id === id);
    if (user?.status === "archived") {
      if (window.confirm("Restore this user?")) {
        const r = await restoreUser(id);
        alert(r.success ? "Restored." : "Failed: " + r.message);
      }
    } else {
      if (window.confirm("Archive this user?")) {
        const r = await archiveUser(id);
        alert(r.success ? "Archived." : "Failed: " + r.message);
      }
    }
  };

  return (
    <div className="pb-4">
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage System Users</h2>
            <p className="text-xs text-gray-600">
              Monitor and manage system users here.
            </p>
          </div>
          <Link
            to="/admin/system-users/new"
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors self-end sm:self-auto"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New User</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, username, or user ID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full lg:w-[320px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <CustomDropdown
                value={roleFilter}
                onChange={handleRoleChange}
                options={roleOptions}
                placeholder="All Roles"
                icon={Filter}
              />
              <CustomDropdown
                value={statusFilter}
                onChange={handleStatusChange}
                options={statusOptions}
                placeholder="Active"
                icon={Filter}
              />
            </div>
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
                    onChange={handleSelectAll(currentItems)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[130px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="user_id"
                    label="User ID"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[200px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="name"
                    label="Name"
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="min-w-[120px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Role
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="created_at"
                    label="Added On"
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
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  <SortableHeader
                    column="last_login"
                    label="Last Login"
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
              {currentItems.length > 0 ? (
                currentItems.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`${index !== currentItems.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user.id)}
                        onChange={() => handleSelectOne(user.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span className="text-sm font-mono text-gray-700">
                        {user.user_id}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {user.updated_at
                          ? new Date(user.updated_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <p className="text-sm text-gray-500">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : "Never"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {user.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="text-end px-4 sm:px-6 py-5">
                      <SystemUserDropdown
                        userId={user.id}
                        status={user.status}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 sm:px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      No system users found.
                    </p>
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
          totalItems={sortedUsers.length}
          itemLabel="users"
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

export default UsersTable;
