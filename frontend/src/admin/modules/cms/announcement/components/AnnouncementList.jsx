import { Plus, Check, X } from "lucide-react";
import { useAnnouncements } from "../context/AnnouncementContext";

import useBulkActions from "../../../../components/hooks/useBulkActions";
import useCmsInlineEdit from "../../../../components/hooks/useCmsInlineEdit";
import useCmsFilter from "../../../../components/hooks/useCmsFilter";
import { STATUS_OPTIONS } from "../../../../components/common/Table/tableConstants";

import TableHeader from "../../../../components/common/Table/TableHeader";
import CmsTableToolbar from "../../../../components/common/Table/CmsTableToolbar";
import StatusBadge from "../../../../components/common/StatusBadge";
import InlineActionButtons from "../../../../components/common/Action/InlineActionButtons";
import BulkActionBar from "../../../../components/common/Action/BulkActionBar";
import { useState } from "react";

const AnnouncementList = () => {
  const {
    announcements,
    loading,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    archiveAnnouncement,
    restoreAnnouncement,
  } = useAnnouncements();

  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } =
    useCmsFilter();
  const {
    editingId,
    editForm,
    showAddRow,
    newForm,
    startEdit,
    cancelEdit,
    setEditField,
    openAddRow,
    closeAddRow,
    setNewField,
  } = useCmsInlineEdit({ emptyForm: { text: "" } });

  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = announcements.filter((a) => {
    const matchesSearch = a.text
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || a.status === statusFilter)
    );
  });

  const isAllSelected =
    filtered.length > 0 && selectedAnnouncements.length === filtered.length;
  const handleSelectAll = (e) =>
    setSelectedAnnouncements(e.target.checked ? filtered.map((a) => a.id) : []);
  const handleSelectOne = (id) =>
    setSelectedAnnouncements((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: announcements,
      selectedItems: selectedAnnouncements,
      setSelectedItems: setSelectedAnnouncements,
      actions: {
        delete: deleteAnnouncement,
        archive: archiveAnnouncement,
        restore: restoreAnnouncement,
      },
      labels: { singular: "announcement", plural: "announcements" },
    });

  // ── Row actions ──────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newForm.text.trim()) return alert("Please enter announcement text.");
    const result = await addAnnouncement({ text: newForm.text.trim() });
    if (result.success) closeAddRow();
    else alert("Failed: " + result.message);
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.text.trim()) return alert("Text cannot be empty.");
    const result = await updateAnnouncement(id, { text: editForm.text.trim() });
    if (result.success) cancelEdit();
    else alert("Failed: " + result.message);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this announcement?")) {
      const result = await deleteAnnouncement(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const ann = announcements.find((a) => a.id === id);
    const fn =
      ann?.status === "archived" ? restoreAnnouncement : archiveAnnouncement;
    if (
      ann?.status !== "archived" &&
      !window.confirm("Archive this announcement?")
    )
      return;
    const result = await fn(id);
    if (!result.success) alert("Failed: " + result.message);
  };

  return (
    <div className="pb-6">
      <TableHeader
        title="Manage Announcements"
        subtitle="Announcements shown here will appear on your website."
        actions={[
          {
            label: "New Announcement",
            onClick: () => openAddRow(),
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <CmsTableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by announcement text..."
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={STATUS_OPTIONS}
        />

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
                <th className="min-w-[500px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Displayed Text
                </th>
                <th className="min-w-[100px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-gray-700 uppercase text-end" />
              </tr>
            </thead>
            <tbody>
              {showAddRow && (
                <tr className="border-b border-blue-100 bg-blue-50">
                  <td className="px-6 py-4" />
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={newForm.text}
                      onChange={(e) => setNewField("text", e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      placeholder="Type announcement text..."
                      autoFocus
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-600">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <InlineActionButtons
                      isEditing
                      onSave={handleAdd}
                      onCancel={closeAddRow}
                    />
                  </td>
                </tr>
              )}

              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((announcement, index) => (
                  <tr
                    key={announcement.id}
                    className={`${index !== filtered.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedAnnouncements.includes(
                          announcement.id,
                        )}
                        onChange={() => handleSelectOne(announcement.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-5">
                      {editingId === announcement.id ? (
                        <input
                          type="text"
                          value={editForm.text}
                          onChange={(e) => setEditField("text", e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveEdit(announcement.id)
                          }
                          autoFocus
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                        />
                      ) : (
                        <p
                          className={`text-sm font-medium ${announcement.status === "archived" ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {announcement.text}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <StatusBadge status={announcement.status} />
                    </td>
                    <td className="px-4 py-5">
                      <InlineActionButtons
                        isEditing={editingId === announcement.id}
                        onEdit={() =>
                          startEdit(announcement, (a) => ({ text: a.text }))
                        }
                        onSave={() => handleSaveEdit(announcement.id)}
                        onCancel={cancelEdit}
                        onArchive={() => handleArchive(announcement.id)}
                        onDelete={() => handleDelete(announcement.id)}
                        status={announcement.status}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No announcements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAnnouncements.length > 0 && (
        <BulkActionBar
          count={selectedAnnouncements.length}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          archiveLabel={bulkArchiveLabel}
        />
      )}
    </div>
  );
};

export default AnnouncementList;
