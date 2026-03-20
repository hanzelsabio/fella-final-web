import { useState, useRef } from "react";
import { Plus, Trash2, Archive, X, ImagePlus } from "lucide-react";
import { useWorks } from "../context/WorksContext";
import { uploadAPI, getImageUrl } from "../../../../../services";

import useBulkActions from "../../../../components/hooks/useBulkActions";
import useCmsFilter from "../../../../components/hooks/useCmsFilter";
import { STATUS_OPTIONS } from "../../../../components/common/tableConstants";

import TableHeader from "../../../../components/common/TableHeader";
import CmsTableToolbar from "../../../../components/common/CmsTableToolbar";
import StatusBadge from "../../../../components/common/StatusBadge";
import BulkActionBar from "../../../../components/common/BulkActionBar";

const WorksDetails = () => {
  const { works, loading, addWork, deleteWork, archiveWork, restoreWork } =
    useWorks();

  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } =
    useCmsFilter();

  const [selectedWorks, setSelectedWorks] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [saving, setSaving] = useState(false);

  const uploadInputRef = useRef(null);

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = works.filter(
    (w) => statusFilter === "all" || w.status === statusFilter,
  );

  const isAllSelected =
    filtered.length > 0 && selectedWorks.length === filtered.length;
  const handleSelectAll = (e) =>
    setSelectedWorks(e.target.checked ? filtered.map((w) => w.id) : []);
  const handleSelectOne = (id) =>
    setSelectedWorks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const { handleBulkDelete, handleBulkArchive, bulkArchiveLabel } =
    useBulkActions({
      items: works,
      selectedItems: selectedWorks,
      setSelectedItems: setSelectedWorks,
      actions: {
        delete: deleteWork,
        archive: archiveWork,
        restore: restoreWork,
      },
      labels: { singular: "work", plural: "works" },
    });

  // ── Upload queue ────────────────────────────────────────────────
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadQueue((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const removeFromQueue = (id) =>
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));

  const handleSaveAll = async () => {
    if (!uploadQueue.length) return;
    setSaving(true);
    try {
      for (const item of uploadQueue) {
        const res = await uploadAPI.uploadImage(item.file, "works");
        const imageUrl = res.data?.data?.url || null;
        if (!imageUrl) {
          alert(`Failed to upload ${item.file.name}`);
          continue;
        }
        await addWork({ image: imageUrl, sort_order: 0 });
      }
      setUploadQueue([]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this work?")) {
      const result = await deleteWork(id);
      if (!result.success) alert("Failed: " + result.message);
    }
  };

  const handleArchive = async (id) => {
    const work = works.find((w) => w.id === id);
    if (work?.status !== "archived" && !window.confirm("Archive this work?"))
      return;
    const result = await (work?.status === "archived"
      ? restoreWork(id)
      : archiveWork(id));
    if (!result.success) alert("Failed: " + result.message);
  };

  return (
    <div className="pb-6">
      <TableHeader
        title="Manage Gallery"
        subtitle="Gallery images shown here will appear in the Our Works section on your website."
        actions={[
          {
            label: "New Images",
            onClick: () => uploadInputRef.current?.click(),
            icon: Plus,
            variant: "primary",
          },
        ]}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              {uploadQueue.length} image{uploadQueue.length !== 1 ? "s" : ""}{" "}
              ready to upload
            </h3>
            <button
              onClick={() => setUploadQueue([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
            {uploadQueue.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.preview}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded border border-gray-200"
                />
                <button
                  onClick={() => removeFromQueue(item.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => uploadInputRef.current?.click()}
              className="h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center gap-1 hover:border-gray-400 hover:bg-white transition-colors"
            >
              <ImagePlus className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Add more</span>
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setUploadQueue([])}
              className="px-4 py-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-3 text-xs bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Uploading..."
                : `Upload ${uploadQueue.length} image${uploadQueue.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <CmsTableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by work ID..."
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={STATUS_OPTIONS}
        />

        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            Loading...
          </div>
        ) : filtered.length > 0 ? (
          <div className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((work) => (
                <div
                  key={work.id}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${selectedWorks.includes(work.id) ? "border-blue-500" : "border-transparent"}`}
                >
                  <img
                    src={getImageUrl(work.image)}
                    alt={work.work_id}
                    className={`w-full h-32 object-cover ${work.status === "archived" ? "opacity-40 grayscale" : ""}`}
                  />

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-between items-start">
                      <input
                        type="checkbox"
                        checked={selectedWorks.includes(work.id)}
                        onChange={() => handleSelectOne(work.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                      <StatusBadge status={work.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white font-mono">
                        {work.work_id}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleArchive(work.id)}
                          className="p-1 rounded bg-white/20 hover:bg-white/40 transition-colors"
                          title={
                            work.status === "archived" ? "Restore" : "Archive"
                          }
                        >
                          <Archive className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => handleDelete(work.id)}
                          className="p-1 rounded bg-red-500/80 hover:bg-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedWorks.includes(work.id) && (
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked
                        onChange={() => handleSelectOne(work.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  {filtered.length} image{filtered.length !== 1 ? "s" : ""}
                  {selectedWorks.length > 0 &&
                    ` — ${selectedWorks.length} selected`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            No gallery images found.
          </div>
        )}
      </div>

      {selectedWorks.length > 0 && (
        <BulkActionBar
          count={selectedWorks.length}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          archiveLabel={bulkArchiveLabel}
        />
      )}
    </div>
  );
};

export default WorksDetails;
