import { useState, useEffect } from "react";
import { Plus, Save, Star } from "lucide-react";
import { useReviews } from "../context/ReviewsContext";

import useBulkActions from "../../../../components/hooks/useBulkActions";
import useCmsInlineEdit from "../../../../components/hooks/useCmsInlineEdit";
import useCmsFilter from "../../../../components/hooks/useCmsFilter";
import { STATUS_OPTIONS } from "../../../../components/common/tableConstants";

import TableHeader from "../../../../components/common/TableHeader";
import CmsTableToolbar from "../../../../components/common/CmsTableToolbar";
import StatusBadge from "../../../../components/common/StatusBadge";
import InlineActionButtons from "../../../../components/common/InlineActionButtons";
import BulkActionBar from "../../../../components/common/BulkActionBar";

// ── Star Rating (review-specific) ────────────────────────────────────────────
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
  } = useCmsInlineEdit({ emptyForm: { name: "", text: "", rating: 5 } });

  const [selectedReviews, setSelectedReviews] = useState([]);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);

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

  const isAllSelected =
    filtered.length > 0 && selectedReviews.length === filtered.length;
  const handleSelectAll = (e) =>
    setSelectedReviews(e.target.checked ? filtered.map((r) => r.id) : []);
  const handleSelectOne = (id) =>
    setSelectedReviews((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: reviews,
      selectedItems: selectedReviews,
      setSelectedItems: setSelectedReviews,
      actions: {
        delete: deleteReview,
        archive: archiveReview,
        restore: restoreReview,
      },
      labels: { singular: "review", plural: "reviews" },
    });

  // ── Row actions ──────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newForm.name.trim() || !newForm.text.trim())
      return alert("Name and review text are required.");
    const result = await addReview({
      name: newForm.name.trim(),
      text: newForm.text.trim(),
      rating: newForm.rating,
    });
    if (result.success) closeAddRow();
    else alert("Failed: " + result.message);
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.text.trim())
      return alert("Name and text are required.");
    const result = await updateReview(id, {
      name: editForm.name.trim(),
      text: editForm.text.trim(),
      rating: editForm.rating,
    });
    if (result.success) cancelEdit();
    else alert("Failed: " + result.message);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this review?")) {
      const result = await deleteReview(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const review = reviews.find((r) => r.id === id);
    if (
      review?.status !== "archived" &&
      !window.confirm("Archive this review?")
    )
      return;
    const result = await (review?.status === "archived"
      ? restoreReview(id)
      : archiveReview(id));
    if (!result.success) alert("Failed: " + result.message);
  };

  return (
    <div className="pb-6">
      {/* Section Settings Card */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
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
              className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors flex gap-2"
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

      <TableHeader
        title="Manage Reviews"
        subtitle="Reviews shown here will appear on your website."
        actions={[
          {
            label: "New Review",
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
          searchPlaceholder="Search by name or review text..."
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
              {showAddRow && (
                <tr className="border-b border-blue-100 bg-blue-50">
                  <td className="px-6 py-4" />
                  <td className="px-4 py-4">
                    <span className="text-xs text-gray-400 font-mono">New</span>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={newForm.name}
                      onChange={(e) => setNewField("name", e.target.value)}
                      placeholder="Customer name"
                      autoFocus
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <textarea
                      value={newForm.text}
                      onChange={(e) => setNewField("text", e.target.value)}
                      placeholder="Review text..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <StarRating
                      rating={newForm.rating}
                      onRate={(v) => setNewField("rating", v)}
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
                          value={editForm.name}
                          onChange={(e) => setEditField("name", e.target.value)}
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
                          value={editForm.text}
                          onChange={(e) => setEditField("text", e.target.value)}
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
                          rating={editForm.rating}
                          onRate={(v) => setEditField("rating", v)}
                        />
                      ) : (
                        <StarRating rating={review.rating} readonly />
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="px-4 py-5">
                      <InlineActionButtons
                        isEditing={editingId === review.id}
                        onEdit={() =>
                          startEdit(review, (r) => ({
                            name: r.name,
                            text: r.text,
                            rating: r.rating,
                          }))
                        }
                        onSave={() => handleSaveEdit(review.id)}
                        onCancel={cancelEdit}
                        onArchive={() => handleArchive(review.id)}
                        onDelete={() => handleDelete(review.id)}
                        status={review.status}
                      />
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

      {selectedReviews.length > 0 && (
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
