import { useState, useEffect } from "react";
import { Plus, Save, Star } from "lucide-react";
import { useReviews } from "../context/ReviewsContext";

import useBulkActions from "../../../../components/hooks/useBulkActions";
import useCmsInlineEdit from "../../../../components/hooks/useCmsInlineEdit";
import useCmsFilter from "../../../../components/hooks/useCmsFilter";
import { STATUS_OPTIONS } from "../../../../components/common/Table/tableConstants";

import TableHeader from "../../../../components/common/Table/TableHeader";
import TableLayout from "../../../../components/common/Table/TableLayout";
import TableHead from "../../../../components/common/Table/TableHead";
import TableRow from "../../../../components/common/Table/TableRow";
import TableEmptyState from "../../../../components/common/Table/TableEmptyState";
import StatusBadge from "../../../../components/common/StatusBadge";
import InlineActionButtons from "../../../../components/common/Action/InlineActionButtons";
import Td from "../../../../components/common/Table/Td";
import Card from "../../../../../shared/components/ui/Card";
import { Input } from "../../../../../shared/components/ui/Inputs";
import { BtnPrimary } from "../../../../../shared/components/ui/Buttons";
import {
  SectionTitle,
  TextMuted,
  TextPrimary,
  Text,
  Label,
} from "../../../../../shared/components/ui/Typography";

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

// ── Column config ─────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    label: "ID",
    column: "review_id",
    minWidth: "min-w-[120px]",
    sortable: false,
  },
  { label: "Name", column: "name", minWidth: "min-w-[150px]", sortable: false },
  {
    label: "Review Text",
    column: "text",
    minWidth: "min-w-[400px]",
    sortable: false,
  },
  {
    label: "Rating",
    column: "rating",
    minWidth: "min-w-[150px]",
    sortable: false,
  },
  {
    label: "Status",
    column: "status",
    minWidth: "min-w-[100px]",
    sortable: false,
  },
];

const INPUT_CLS =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm";

// ── Component ─────────────────────────────────────────────────────────────────
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

  // ── Filter ──────────────────────────────────────────────────────────────────
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

  // ── Row actions ──────────────────────────────────────────────────────────────
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
      {/* Section Settings */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
          <div>
            <SectionTitle>Section Header</SectionTitle>
            <TextMuted className="mt-1">
              Customize the heading and subheading shown above the reviews.
            </TextMuted>
          </div>
          <div className="flex justify-end items-center">
            <BtnPrimary onClick={handleSaveSettings} disabled={savingSettings}>
              <Save className="w-4 h-4" />
              <span>{savingSettings ? "Saving..." : "Save Changes"}</span>
            </BtnPrimary>
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
            <Label>
              Heading <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Trusted by Clients, Proven by Results."
            />
          </div>
          <div>
            <Label>
              Subheading{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </Label>
            <textarea
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. Real stories from people who've worked with us..."
              rows={1}
              className={INPUT_CLS}
            />
          </div>
        </div>
      </Card>

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

      <TableLayout
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name or review text..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: STATUS_OPTIONS,
            placeholder: "Active",
          },
        ]}
        currentPage={1}
        totalPages={1}
        startIndex={0}
        totalItems={filtered.length}
        itemLabel="reviews"
        onPrevious={() => {}}
        onNext={() => {}}
        onGoToPage={() => {}}
        getPageNumbers={() => []}
        bulkCount={selectedReviews.length}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
        bulkArchiveLabel={bulkArchiveLabel}
        thead={
          <TableHead
            columns={COLUMNS}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            sortColumn={null}
            sortOrder={null}
            onSort={() => {}}
          />
        }
        tbody={
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
                    value={newForm.name}
                    onChange={(e) => setNewField("name", e.target.value)}
                    placeholder="Customer name"
                    autoFocus
                    className={INPUT_CLS}
                  />
                </td>
                <td className="px-4 py-4">
                  <textarea
                    value={newForm.text}
                    onChange={(e) => setNewField("text", e.target.value)}
                    placeholder="Review text..."
                    rows={2}
                    className={INPUT_CLS}
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
                <TableRow
                  key={review.id}
                  id={review.id}
                  isLast={index === filtered.length - 1}
                  isSelected={selectedReviews.includes(review.id)}
                  onSelect={() => handleSelectOne(review.id)}
                  actions={
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
                  }
                >
                  <Td>
                    <span className="text-xs text-gray-500 font-mono">
                      {review.review_id}
                    </span>
                  </Td>
                  <Td>
                    {editingId === review.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditField("name", e.target.value)}
                        autoFocus
                        className={INPUT_CLS}
                      />
                    ) : (
                      <TextPrimary
                        className={
                          review.status === "archived"
                            ? "line-through opacity-50"
                            : ""
                        }
                      >
                        {review.name}
                      </TextPrimary>
                    )}
                  </Td>
                  <Td>
                    {editingId === review.id ? (
                      <textarea
                        value={editForm.text}
                        onChange={(e) => setEditField("text", e.target.value)}
                        rows={2}
                        className={INPUT_CLS}
                      />
                    ) : (
                      <Text
                        className={
                          review.status === "archived"
                            ? "line-through opacity-50"
                            : ""
                        }
                      >
                        {review.text}
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {editingId === review.id ? (
                      <StarRating
                        rating={editForm.rating}
                        onRate={(v) => setEditField("rating", v)}
                      />
                    ) : (
                      <StarRating rating={review.rating} readonly />
                    )}
                  </Td>
                  <Td>
                    <StatusBadge status={review.status} />
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableEmptyState title="No reviews found" colSpan={7} />
            )}
          </tbody>
        }
      />
    </div>
  );
};

export default ClientReviewList;
