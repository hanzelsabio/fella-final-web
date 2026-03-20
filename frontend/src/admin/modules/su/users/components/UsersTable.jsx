import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { useSystemUser } from "../context/SystemUserContext";

import useBasePath from "../../../../components/hooks/useBasePath";
import useRowActions from "../../../../components/hooks/useRowActions";
import useBulkActions from "../../../../components/hooks/useBulkActions";
import useTableSort from "../../../../components/hooks/useTableSort";
import { usePaginatedTable } from "../../../../components/hooks/usePaginatedTable";
import { STATUS_OPTIONS } from "../../../../components/common/tableConstants";

import TableHeader from "../../../../components/common/TableHeader";
import TableLayout from "../../../../components/common/TableLayout";
import TableHead from "../../../../components/common/TableHead";
import TableRow from "../../../../components/common/TableRow";
import TableEmptyState from "../../../../components/common/TableEmptyState";
import StatusBadge from "../../../../components/common/StatusBadge";
import DateCell from "../../../../components/common/DateCell";
import Td from "../../../../components/common/Td";
import SystemUserDropdown from "../../../../components/common/Dropdown/ActionsDropdown/SystemUserDropdown";

// ── Role badge (users-specific) ──────────────────────────────────────────────
const ROLE_BADGE_CLASSES = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  staff: "bg-gray-100 text-gray-600",
};

const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE_CLASSES[role] || "bg-gray-100 text-gray-600"}`}
  >
    {role}
  </span>
);

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
];

const COLUMNS = [
  { label: "User ID", column: "user_id", minWidth: "min-w-[130px]" },
  { label: "Name", column: "name", minWidth: "min-w-[200px]" },
  { label: "Role", column: "role", minWidth: "min-w-[120px]", sortable: false },
  { label: "Added On", column: "created_at", minWidth: "min-w-[150px]" },
  { label: "Updated On", column: "updated_at", minWidth: "min-w-[150px]" },
  { label: "Last Login", column: "last_login", minWidth: "min-w-[150px]" },
  {
    label: "Status",
    column: "status",
    minWidth: "min-w-[120px]",
    sortable: false,
  },
];

const SORT_CONFIG = [
  { key: "user_id", type: "string" },
  { key: "created_at", type: "date" },
  { key: "updated_at", type: "date" },
  { key: "last_login", type: "date" },
  {
    key: "name",
    type: "custom",
    getValue: (u) => `${u.first_name} ${u.last_name}`.toLowerCase(),
  },
];

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

  const [roleFilter, setRoleFilter] = useState("all");

  // Users has a compound search (first+last name) + role filter — manual filter
  const filtered = systemUsers.filter((u) => {
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      fullName.includes(term) ||
      u.username?.toLowerCase().includes(term) ||
      u.user_id?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const sorted = useTableSort(filtered, sortColumn, sortOrder, SORT_CONFIG);

  const { totalPages, startIndex, currentItems } = paginate(sorted);
  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;

  const { handleDelete, handleArchive } = useRowActions({
    items: systemUsers,
    actions: { delete: deleteUser, archive: archiveUser, restore: restoreUser },
    labels: { singular: "user" },
  });

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: systemUsers,
      selectedItems,
      setSelectedItems,
      actions: {
        delete: deleteUser,
        archive: archiveUser,
        restore: restoreUser,
      },
      labels: { singular: "user", plural: "users" },
    });

  return (
    <div className="pb-4">
      <TableHeader
        title="Manage System Users"
        subtitle="Monitor and manage system users here."
        actions={[
          {
            label: "New User",
            to: "/admin/system-users/new",
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name, username, or user ID..."
        filters={[
          {
            value: roleFilter,
            onChange: setRoleFilter,
            options: ROLE_OPTIONS,
            placeholder: "All Roles",
            icon: Filter,
          },
          {
            value: statusFilter,
            onChange: handleStatusChange,
            options: STATUS_OPTIONS,
            placeholder: "Active",
          },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        totalItems={sorted.length}
        itemLabel="users"
        onPrevious={goToPrevious}
        onNext={() => goToNext(totalPages)}
        onGoToPage={goToPage}
        getPageNumbers={getPageNumbers}
        bulkCount={selectedItems.length}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
        bulkArchiveLabel={bulkArchiveLabel}
        thead={
          <TableHead
            columns={COLUMNS}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll(currentItems)}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        }
        tbody={
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((user, index) => (
                <TableRow
                  key={user.id}
                  id={user.id}
                  isLast={index === currentItems.length - 1}
                  isSelected={selectedItems.includes(user.id)}
                  onSelect={() => handleSelectOne(user.id)}
                  actions={
                    <SystemUserDropdown
                      userId={user.id}
                      status={user.status}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  }
                >
                  <Td>
                    <span className="text-sm font-mono text-gray-700">
                      {user.user_id}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </Td>
                  <Td>
                    <RoleBadge role={user.role} />
                  </Td>
                  <Td>
                    <DateCell value={user.created_at} fallback="—" />
                  </Td>
                  <Td>
                    <DateCell value={user.updated_at} fallback="—" />
                  </Td>
                  <Td>
                    <DateCell value={user.last_login} fallback="Never" />
                  </Td>
                  <Td>
                    <StatusBadge status={user.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState title="No system users found." colSpan={9} />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default UsersTable;
