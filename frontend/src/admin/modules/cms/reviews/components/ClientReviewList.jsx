import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Archive,
  Pencil,
  X,
  Check,
  Filter,
  Search,
  Star,
  Save,
} from "lucide-react";
import { useReviews } from "../context/ReviewsContext";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import CustomDropdown from "../../../../components/common/CustomDropdown";

const StarRating = ({ rating, onRate, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readonly && onRate?.(star)}
        className={
          readonly
            ? "cursor-default"
            : "cursor-pointer hover:scale-110 transition-transform"
        }
        disabled={readonly}
      >
        <Star
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      </button>
    ))}
  </div>
);

const ClientReviewList = () => {
  const {
    reviews,
    loading,
    settings,
    updateSettings,
    addReview,
    updateReview,
    deleteReview,
    archiveReview,
    restoreReview,
  } = useReviews();

  const [selectedReviews, setSelectedReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Settings state ──────────────────────────────────────────────
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);

  // ── Inline add state ────────────────────────────────────────────
  const [showAddRow, setShowAddRow] = useState(false);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [newRating, setNewRating] = useState(5);

  // ── Inline edit state ───────────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ✅ Sync settings into local state when loaded
  useEffect(() => {
    setHeading(settings?.heading || "");
    setSubheading(settings?.subheading || "");
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!heading.trim())
      return setSettingsMessage({ type: "error", text: "Heading is required" });
    setSavingSettings(true);
    setSettingsMessage(null);
    const result = await updateSettings({
      heading: heading.trim(),
      subheading: subheading.trim() || null,
    });
    setSavingSettings(false);
    setSettingsMessage(
      result.success
        ? { type: "success", text: "Section settings saved!" }
        : { type: "error", text: result.message },
    );
  };

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.text?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || r.status === statusFilter)
    );
  });

  // ── Checkbox ────────────────────────────────────────────────────
  const handleSelectAll = (e) =>
    setSelectedReviews(e.target.checked ? filtered.map((r) => r.id) : []);
  const handleSelectOne = (id) =>
    setSelectedReviews((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const isAllSelected =
    filtered.length > 0 && selectedReviews.length === filtered.length;
  const hasSelection = selectedReviews.length > 0;

  // ── Add ─────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newName.trim() || !newText.trim())
      return alert("Name and review text are required.");
    const result = await addReview({
      name: newName.trim(),
      text: newText.trim(),
      rating: newRating,
    });
    if (result.success) {
      setNewName("");
      setNewText("");
      setNewRating(5);
      setShowAddRow(false);
    } else alert("Failed: " + result.message);
  };

  // ── Edit ────────────────────────────────────────────────────────
  const startEdit = (review) => {
    setEditingId(review.id);
    setEditName(review.name);
    setEditText(review.text);
    setEditRating(review.rating);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim() || !editText.trim())
      return alert("Name and text are required.");
    const result = await updateReview(id, {
      name: editName.trim(),
      text: editText.trim(),
      rating: editRating,
    });
    if (result.success) setEditingId(null);
    else alert("Failed: " + result.message);
  };

  // ── Delete / Archive ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this review?")) {
      const result = await deleteReview(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const review = reviews.find((r) => r.id === id);
    if (review?.status === "archived") {
      const result = await restoreReview(id);
      if (!result.success) alert("Failed: " + result.message);
    } else {
      if (window.confirm("Archive this review?")) {
        const result = await archiveReview(id);
        if (!result.success) alert("Failed: " + result.message);
      }
    }
  };

  // ── Bulk ────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedReviews.length} review(s)?`)) return;
    for (const id of selectedReviews) await deleteReview(id);
    setSelectedReviews([]);
  };

  const handleBulkArchive = async () => {
    const first = reviews.find((r) => r.id === selectedReviews[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedReviews.length} review(s)?`,
      )
    )
      return;
    for (const id of selectedReviews) {
      if (isArchived) await restoreReview(id);
      else await archiveReview(id);
    }
    setSelectedReviews([]);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = reviews.find((r) => r.id === selectedReviews[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  return (
    <div className="pb-6">
      {/* Section Settings Card */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 justify-between gap-5 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Section Header
            </h3>
            <p className="text-xs text-gray-500">
              Customize the heading and subheading shown above the reviews.
            </p>
          </div>
          <div className="flex justify-end items-center">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors flex gap-2 self-end sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {settingsMessage && (
          <p
            className={`text-xs mb-3 font-medium ${settingsMessage.type === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {settingsMessage.text}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Trusted by Clients, Proven by Results."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Subheading{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. Real stories from people who've worked with us..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage Reviews</h2>
            <p className="text-xs text-gray-600">
              Reviews shown here will appear on your website.
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddRow(true);
              setNewName("");
              setNewText("");
              setNewRating(5);
            }}
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors flex items-center gap-2 self-end sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Review</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or review text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
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
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="min-w-[120px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  ID
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Name
                </th>
                <th className="min-w-[400px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Review Text
                </th>
                <th className="min-w-[150px] px-4 sm:px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Rating
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
                    <span className="text-xs text-gray-400 font-mono">New</span>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Customer name"
                      autoFocus
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Review text..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <StarRating rating={newRating} onRate={setNewRating} />
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
                    colSpan="7"
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((review, index) => (
                  <tr
                    key={review.id}
                    className={`${index !== filtered.length - 1 && editingId !== review.id ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-6 pt-5 pb-4">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => handleSelectOne(review.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-xs text-gray-500 font-mono">
                        {review.review_id}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      {editingId === review.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                        />
                      ) : (
                        <p
                          className={`text-sm font-medium ${review.status === "archived" ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {review.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {editingId === review.id ? (
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                        />
                      ) : (
                        <p
                          className={`text-sm ${review.status === "archived" ? "text-gray-400 line-through" : "text-gray-600"}`}
                        >
                          {review.text}
                        </p>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      {editingId === review.id ? (
                        <StarRating
                          rating={editRating}
                          onRate={setEditRating}
                        />
                      ) : (
                        <StarRating rating={review.rating} readonly />
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${review.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                      >
                        {review.status === "archived" ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === review.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(review.id)}
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
                              onClick={() => startEdit(review)}
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleArchive(review.id)}
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                              title={
                                review.status === "archived"
                                  ? "Restore"
                                  : "Archive"
                              }
                            >
                              <Archive className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
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
                    colSpan="7"
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasSelection && (
        <BulkActionBar
          count={selectedReviews.length}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          archiveLabel={bulkArchiveLabel}
        />
      )}
    </div>
  );
};

export default ClientReviewList;
