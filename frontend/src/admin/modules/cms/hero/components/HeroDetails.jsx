import { useState, useRef } from "react";
import { Plus, X, Check, ImagePlus } from "lucide-react";
import { useHero } from "../context/HeroContext";
import { uploadAPI, getImageUrl } from "../../../../../services";

import useBulkActions from "../../../../components/hooks/useBulkActions";
import useCmsFilter from "../../../../components/hooks/useCmsFilter";
import { STATUS_OPTIONS } from "../../../../components/common/Table/tableConstants";

import TableHeader from "../../../../components/common/Table/TableHeader";
import CmsTableToolbar from "../../../../components/common/Table/CmsTableToolbar";
import StatusBadge from "../../../../components/common/StatusBadge";
import InlineActionButtons from "../../../../components/common/Action/InlineActionButtons";
import BulkActionBar from "../../../../components/common/Action/BulkActionBar";

const EMPTY_FORM = {
  image: null,
  imagePreview: null,
  heading: "",
  subheading: "",
  cta_text: "",
  cta_link: "",
  sort_order: 0,
};

// ── Slide form fields (hero-specific, image upload required) ─────────────────
const SlideFormFields = ({ form, onChange, imageRef, onImageChange }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Background Image <span className="text-red-500">*</span>
      </label>
      {form.imagePreview ? (
        <div className="flex items-center gap-3">
          <img
            src={form.imagePreview}
            alt="Preview"
            className="w-24 h-14 object-cover rounded border border-gray-200"
          />
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            Change image
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => imageRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:border-gray-400 hover:bg-gray-50"
        >
          <ImagePlus className="w-4 h-4" />
          <span>Upload background image</span>
        </button>
      )}
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageChange}
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Heading <span className="text-gray-400 font-normal">(Optional)</span>
      </label>
      <input
        type="text"
        value={form.heading}
        onChange={(e) => onChange("heading", e.target.value)}
        placeholder="e.g. Print Your Vision, Wear Your Style"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Subheading <span className="text-gray-400 font-normal">(Optional)</span>
      </label>
      <textarea
        value={form.subheading}
        onChange={(e) => onChange("subheading", e.target.value)}
        placeholder="e.g. High-quality printing for apparel and brands..."
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Button Text{" "}
          <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={form.cta_text}
          onChange={(e) => onChange("cta_text", e.target.value)}
          placeholder="e.g. Shop Now"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Button Link{" "}
          <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={form.cta_link}
          onChange={(e) => onChange("cta_link", e.target.value)}
          placeholder="e.g. /products"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
        />
      </div>
    </div>
    <div className="w-32">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Sort Order
      </label>
      <input
        type="number"
        value={form.sort_order}
        onChange={(e) => onChange("sort_order", parseInt(e.target.value) || 0)}
        min={0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
      />
    </div>
  </div>
);

const HeroDetails = () => {
  const {
    slides,
    loading,
    addSlide,
    updateSlide,
    deleteSlide,
    archiveSlide,
    restoreSlide,
  } = useHero();

  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } =
    useCmsFilter();

  const [selectedSlides, setSelectedSlides] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const newImageRef = useRef(null);
  const editImageRef = useRef(null);

  const handleNewImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setNewForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    reader.readAsDataURL(file);
  };

  const handleEditImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setEditForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    const res = await uploadAPI.uploadImage(file, "hero");
    return res.data?.data?.url || null;
  };

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = slides.filter((s) => {
    const matchesSearch =
      s.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subheading?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || s.status === statusFilter)
    );
  });

  const isAllSelected =
    filtered.length > 0 && selectedSlides.length === filtered.length;
  const handleSelectAll = (e) =>
    setSelectedSlides(e.target.checked ? filtered.map((s) => s.id) : []);
  const handleSelectOne = (id) =>
    setSelectedSlides((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: slides,
      selectedItems: selectedSlides,
      setSelectedItems: setSelectedSlides,
      actions: {
        delete: deleteSlide,
        archive: archiveSlide,
        restore: restoreSlide,
      },
      labels: { singular: "slide", plural: "slides" },
    });

  // ── Add ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newForm.image) return alert("Please upload an image.");
    setSaving(true);
    try {
      const imageUrl = await uploadImage(newForm.image);
      if (!imageUrl) return alert("Image upload failed.");
      const result = await addSlide({
        image: imageUrl,
        heading: newForm.heading || null,
        subheading: newForm.subheading || null,
        cta_text: newForm.cta_text || null,
        cta_link: newForm.cta_link || null,
        sort_order: newForm.sort_order || 0,
      });
      if (result.success) {
        setNewForm(EMPTY_FORM);
        setShowAddForm(false);
      } else alert("Failed: " + result.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────
  const startEdit = (slide) => {
    setEditingId(slide.id);
    setEditForm({
      image: null,
      imagePreview: getImageUrl(slide.image),
      heading: slide.heading || "",
      subheading: slide.subheading || "",
      cta_text: slide.cta_text || "",
      cta_link: slide.cta_link || "",
      sort_order: slide.sort_order || 0,
      existingImage: slide.image,
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.imagePreview) return alert("Image is required.");
    setSaving(true);
    try {
      let imageUrl = editForm.existingImage;
      if (editForm.image) {
        imageUrl = await uploadImage(editForm.image);
        if (!imageUrl) return alert("Image upload failed.");
      }
      const result = await updateSlide(id, {
        image: imageUrl,
        heading: editForm.heading || null,
        subheading: editForm.subheading || null,
        cta_text: editForm.cta_text || null,
        cta_link: editForm.cta_link || null,
        sort_order: editForm.sort_order || 0,
      });
      if (result.success) setEditingId(null);
      else alert("Failed: " + result.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this slide?")) {
      const result = await deleteSlide(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const slide = slides.find((s) => s.id === id);
    if (slide?.status !== "archived" && !window.confirm("Archive this slide?"))
      return;
    const result = await (slide?.status === "archived"
      ? restoreSlide(id)
      : archiveSlide(id));
    if (!result.success) alert("Failed: " + result.message);
  };

  return (
    <div className="pb-6">
      <TableHeader
        title="Manage Hero Slides"
        subtitle="Hero slides shown here will appear as a background carousel on your website."
        actions={[
          {
            label: "New Slide",
            onClick: () => setShowAddForm(true),
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      {/* Add Form */}
      {showAddForm && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">New Slide</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded hover:bg-blue-100"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <SlideFormFields
            form={newForm}
            onChange={(k, v) => setNewForm((p) => ({ ...p, [k]: v }))}
            imageRef={newImageRef}
            onImageChange={handleNewImage}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-4 py-2 text-xs bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Slide"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <CmsTableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by heading or subheading..."
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
                <th className="min-w-[120px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Image
                </th>
                <th className="min-w-[200px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Heading
                </th>
                <th className="min-w-[200px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Subheading
                </th>
                <th className="min-w-[150px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  CTA
                </th>
                <th className="min-w-[80px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Order
                </th>
                <th className="min-w-[100px] px-4 py-4 text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-gray-700 uppercase text-end" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((slide, index) => (
                  <>
                    <tr
                      key={slide.id}
                      className={`${index !== filtered.length - 1 && editingId !== slide.id ? "border-b border-gray-200" : ""} hover:bg-gray-50`}
                    >
                      <td className="px-6 pt-5 pb-4">
                        <input
                          type="checkbox"
                          checked={selectedSlides.includes(slide.id)}
                          onChange={() => handleSelectOne(slide.id)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-5">
                        <img
                          src={getImageUrl(slide.image)}
                          alt="Slide"
                          className="w-20 h-12 object-cover rounded border border-gray-200"
                        />
                      </td>
                      <td className="px-4 py-5">
                        <p
                          className={`text-sm ${slide.status === "archived" ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {slide.heading || (
                            <span className="text-gray-400 italic">
                              No heading
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm text-gray-500 truncate max-w-[180px]">
                          {slide.subheading || (
                            <span className="italic">—</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        {slide.cta_text ? (
                          <div>
                            <p className="text-xs font-medium text-gray-800">
                              {slide.cta_text}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[120px]">
                              {slide.cta_link}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-sm text-gray-500">
                          {slide.sort_order}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <StatusBadge status={slide.status} />
                      </td>
                      <td className="px-4 py-5">
                        <InlineActionButtons
                          isEditing={false}
                          onEdit={() => startEdit(slide)}
                          onArchive={() => handleArchive(slide.id)}
                          onDelete={() => handleDelete(slide.id)}
                          status={slide.status}
                        />
                      </td>
                    </tr>

                    {editingId === slide.id && (
                      <tr
                        key={`edit-${slide.id}`}
                        className="border-b border-blue-100 bg-blue-50"
                      >
                        <td colSpan="8" className="px-4 sm:px-6 py-4">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">
                            Edit Slide
                          </h3>
                          <SlideFormFields
                            form={editForm}
                            onChange={(k, v) =>
                              setEditForm((p) => ({ ...p, [k]: v }))
                            }
                            imageRef={editImageRef}
                            onImageChange={handleEditImage}
                          />
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(slide.id)}
                              disabled={saving}
                              className="flex items-center gap-2 px-4 py-2 text-xs bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {saving ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No slides found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSlides.length > 0 && (
        <BulkActionBar
          count={selectedSlides.length}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          archiveLabel={bulkArchiveLabel}
        />
      )}
    </div>
  );
};

export default HeroDetails;
