import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Archive,
  Pencil,
  X,
  Check,
  Filter,
  Search,
  ImagePlus,
} from "lucide-react";
import { useHero } from "../context/HeroContext";
import { uploadAPI, getImageUrl } from "../../../../../services";
import BulkActionBar from "../../../../components/common/BulkActionBar";
import CustomDropdown from "../../../../components/common/CustomDropdown";

const EMPTY_FORM = {
  image: null,
  imagePreview: null,
  heading: "",
  subheading: "",
  cta_text: "",
  cta_link: "",
  sort_order: 0,
};

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

  const [selectedSlides, setSelectedSlides] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const newImageRef = useRef(null);
  const editImageRef = useRef(null);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = slides.filter((s) => {
    const matchesSearch =
      s.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subheading?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      matchesSearch && (statusFilter === "all" || s.status === statusFilter)
    );
  });

  // ── Checkbox ────────────────────────────────────────────────────
  const handleSelectAll = (e) =>
    setSelectedSlides(e.target.checked ? filtered.map((s) => s.id) : []);
  const handleSelectOne = (id) =>
    setSelectedSlides((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const isAllSelected =
    filtered.length > 0 && selectedSlides.length === filtered.length;
  const hasSelection = selectedSlides.length > 0;

  // ── Image handlers ──────────────────────────────────────────────
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

  // ── Add ─────────────────────────────────────────────────────────
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

  // ── Edit ────────────────────────────────────────────────────────
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

  // ── Delete / Archive ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Delete this slide?")) {
      const result = await deleteSlide(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const slide = slides.find((s) => s.id === id);
    if (slide?.status === "archived") {
      const result = await restoreSlide(id);
      if (!result.success) alert("Failed: " + result.message);
    } else {
      if (window.confirm("Archive this slide?")) {
        const result = await archiveSlide(id);
        if (!result.success) alert("Failed: " + result.message);
      }
    }
  };

  // ── Bulk ────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedSlides.length} slide(s)?`)) return;
    for (const id of selectedSlides) await deleteSlide(id);
    setSelectedSlides([]);
  };

  const handleBulkArchive = async () => {
    const first = slides.find((s) => s.id === selectedSlides[0]);
    const isArchived = first?.status === "archived";
    const action = isArchived ? "restore" : "archive";
    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedSlides.length} slide(s)?`,
      )
    )
      return;
    for (const id of selectedSlides) {
      if (isArchived) await restoreSlide(id);
      else await archiveSlide(id);
    }
    setSelectedSlides([]);
  };

  const bulkArchiveLabel = (() => {
    if (!hasSelection) return "Archive";
    const first = slides.find((s) => s.id === selectedSlides[0]);
    return first?.status === "archived" ? "Unarchive" : "Archive";
  })();

  // ── Form fields helper ──────────────────────────────────────────
  const FormFields = ({ form, onChange, imageRef, onImageChange, isNew }) => (
    <div className="space-y-3">
      {/* Image */}
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

      {/* Heading */}
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

      {/* Subheading */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Subheading{" "}
          <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <textarea
          value={form.subheading}
          onChange={(e) => onChange("subheading", e.target.value)}
          placeholder="e.g. High-quality printing for apparel and brands..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
        />
      </div>

      {/* CTA */}
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

      {/* Sort order */}
      <div className="w-32">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Sort Order
        </label>
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) =>
            onChange("sort_order", parseInt(e.target.value) || 0)
          }
          min={0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage Hero Slides</h2>
            <p className="text-xs text-gray-600">
              Hero slides shown here will appear as a background carousel on
              your website.
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setNewForm(EMPTY_FORM);
            }}
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors flex items-center gap-2 self-end sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Slide</span>
          </button>
        </div>
      </div>

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
          <FormFields
            form={newForm}
            onChange={(key, val) =>
              setNewForm((prev) => ({ ...prev, [key]: val }))
            }
            imageRef={newImageRef}
            onImageChange={handleNewImage}
            isNew
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

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by heading or subheading..."
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
                    colSpan="9"
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
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${slide.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                        >
                          {slide.status === "archived" ? "Archived" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(slide)}
                            className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleArchive(slide.id)}
                            className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                            title={
                              slide.status === "archived"
                                ? "Restore"
                                : "Archive"
                            }
                          >
                            <Archive className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(slide.id)}
                            className="p-1.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline edit row */}
                    {editingId === slide.id && (
                      <tr
                        key={`edit-${slide.id}`}
                        className="border-b border-blue-100 bg-blue-50"
                      >
                        <td colSpan="9" className="px-4 sm:px-6 py-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">
                              Edit Slide
                            </h3>
                          </div>
                          <FormFields
                            form={editForm}
                            onChange={(key, val) =>
                              setEditForm((prev) => ({ ...prev, [key]: val }))
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
                    colSpan="9"
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

      {hasSelection && (
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
