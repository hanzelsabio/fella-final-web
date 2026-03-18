import { useState } from "react";
import {
  Plus,
  Trash2,
  Archive,
  Pencil,
  X,
  Check,
  Filter,
  Search,
} from "lucide-react";
import { useAnnouncements } from "../context/AnnouncementContext";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import CustomDropdown from "../../../../components/common/CustomDropdown";

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

  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddRow, setShowAddRow] = useState(false);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = announcements.filter((a) => {
    const matchesSearch = a.text
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e) =>
    setSelectedAnnouncements(e.target.checked ? filtered.map((a) => a.id) : []);
  const handleSelectOne = (id) =>
    setSelectedAnnouncements((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const isAllSelected =
    filtered.length > 0 && selectedAnnouncements.length === filtered.length;
  const hasSelection = selectedAnnouncements.length > 0;

  const handleAdd = async () => {
    if (!newText.trim()) return alert("Please enter announcement text.");
    const result = await addAnnouncement({ text: newText.trim() });
    if (result.success) {
      setNewText("");
      setShowAddRow(false);
    } else {
      alert("Failed: " + result.message);
    }
  };

  const startEdit = (announcement) => {
    setEditingId(announcement.id);
    setEditText(announcement.text);
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return alert("Text cannot be empty.");
    const result = await updateAnnouncement(id, { text: editText.trim() });
    if (result.success) {
      setEditingId(null);
    } else {
      alert("Failed: " + result.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this announcement?")) {
      const result = await deleteAnnouncement(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const ann = announcements.find((a) => a.id === id);
    if (ann?.status === "archived") {
      const result = await restoreAnnouncement(id);
      if (!result.success) alert("Failed: " + result.message);
    } else {
      if (window.confirm("Archive this announcement?")) {
        const result = await archiveAnnouncement(id);
        if (!result.success) alert("Failed: " + result.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(`Delete ${selectedAnnouncements.length} announcement(s)?`)
    )
      return;
    for (const id of selectedAnnouncements) await deleteAnnouncement(id);
    setSelectedAnnouncements([]);
  };

  const handleBulkArchive = async () => {
    const first = announcements.find((a) => a.id === selectedAnnouncements[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedAnnouncements.length} announcement(s)?`,
      )
    )
      return;
    for (const id of selectedAnnouncements) {
      if (isArchived) await restoreAnnouncement(id);
      else await archiveAnnouncement(id);
    }
    setSelectedAnnouncements([]);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = announcements.find((a) => a.id === selectedAnnouncements[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage Announcements</h2>
            <p className="text-xs text-gray-600">
              Announcements shown here will appear on your website.
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddRow(true);
              setNewText("");
            }}
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors flex items-center gap-2 self-end sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 items-start justify-between">
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by announcement text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 w-full md:w-auto">
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
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
              {/* Inline add row */}
              {showAddRow && (
                <tr className="border-b border-blue-100 bg-blue-50">
                  <td className="px-6 py-4" />
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleAdd}
                        className="p-1.5 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowAddRow(false)}
                        className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
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
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
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
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${announcement.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {announcement.status === "archived"
                          ? "Archived"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === announcement.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(announcement.id)}
                              className="p-1.5 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(announcement)}
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleArchive(announcement.id)}
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                              title={
                                announcement.status === "archived"
                                  ? "Restore"
                                  : "Archive"
                              }
                            >
                              <Archive className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(announcement.id)}
                              className="p-1.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
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

      {hasSelection && (
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
