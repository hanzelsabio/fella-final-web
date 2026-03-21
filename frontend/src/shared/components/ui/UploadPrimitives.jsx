import { X, Upload, AlertCircle } from "lucide-react";

/**
 * Upload UI primitives
 * Shared building blocks for ImageUploadSection and SingleImageUpload.
 *
 * Components:
 *   <DropZone>         — drag-and-drop upload area
 *   <UploadError>      — red error banner
 *   <ImageThumb>       — image preview tile with hover-remove button
 *   <UploadGuidelines> — blue guidelines info box
 *   <UploadingSpinner> — loading state shown during server upload
 */

// ── DropZone ──────────────────────────────────────────────────────────────────
/**
 * Props:
 *   inputId    — id for the hidden file input (must be unique per page)
 *   active     — boolean, true while dragging over
 *   multiple   — allow multiple file selection
 *   onDragEnter/Leave/Over/Drop — forwarded drag handlers
 *   onChange   — file input onChange
 *   icon       — Lucide icon component (default: Upload)
 *   hint       — small text below the format line (e.g. "3 slots remaining")
 *   hintColor  — Tailwind text color class for hint (default: "text-gray-600")
 */
export const DropZone = ({
  inputId,
  active,
  multiple = false,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onChange,
  icon: Icon = Upload,
  hint,
  hintColor = "text-gray-600",
}) => (
  <label
    htmlFor={inputId}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
    className={`shadow-sm group block cursor-pointer rounded-lg border-2 border-dashed transition-all ${
      active
        ? "border-blue-500 bg-blue-50"
        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
    }`}
  >
    <div className="flex justify-center py-10">
      <div className="flex max-w-[280px] flex-col items-center gap-3">
        <div
          className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-2 transition ${
            active
              ? "border-blue-500 text-blue-500 bg-blue-100"
              : "border-gray-300 text-gray-600 group-hover:border-blue-500 group-hover:text-blue-500"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800 mb-1">
            {active ? "Drop image here" : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-500">
            SVG, PNG, JPG or GIF (max. 5MB)
          </p>
          {hint && (
            <p className={`text-xs font-medium mt-1 ${hintColor}`}>{hint}</p>
          )}
        </div>
      </div>
    </div>
    <input
      type="file"
      id={inputId}
      className="hidden"
      accept="image/*"
      multiple={multiple}
      onChange={onChange}
    />
  </label>
);

// ── UploadError ───────────────────────────────────────────────────────────────
/** Props: message — string */
export const UploadError = ({ message }) =>
  message ? (
    <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-red-600">{message}</p>
    </div>
  ) : null;

// ── ImageThumb ────────────────────────────────────────────────────────────────
/**
 * Props:
 *   src        — image src
 *   alt        — alt text
 *   onRemove   — click handler for the × button
 *   size       — Tailwind size classes for the container (default: "w-full aspect-square")
 *   fileName   — optional filename shown below
 *   fileSize   — optional size string shown below (e.g. "42.3 KB")
 *   iconSize   — "sm" (w-3) | "md" (w-4, default)
 */
export const ImageThumb = ({
  src,
  alt = "Preview",
  onRemove,
  size = "w-full aspect-square",
  fileName,
  fileSize,
  iconSize = "md",
  onError,
}) => (
  <div className="relative group">
    <div
      className={`${size} rounded-lg border-2 border-gray-200 overflow-hidden bg-white`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={onError}
      />
    </div>
    <button
      type="button"
      onClick={onRemove}
      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100"
    >
      <X className={iconSize === "sm" ? "w-3 h-3" : "w-4 h-4"} />
    </button>
    {fileName && (
      <p className="mt-1 text-xs text-gray-600 truncate max-w-full">
        {fileName}
      </p>
    )}
    {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
  </div>
);

// ── UploadGuidelines ──────────────────────────────────────────────────────────
/** Props: items — string[] of bullet lines */
export const UploadGuidelines = ({ items }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
    <h4 className="text-xs font-semibold text-blue-900 mb-2">
      Image Upload Guidelines
    </h4>
    <ul className="text-xs text-blue-800 space-y-1">
      {items.map((item, i) => (
        <li key={i}>• {item}</li>
      ))}
    </ul>
  </div>
);

// ── UploadingSpinner ──────────────────────────────────────────────────────────
export const UploadingSpinner = () => (
  <div className="flex justify-center items-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
      <p className="text-sm text-gray-600">Uploading image...</p>
    </div>
  </div>
);

// ── SectionSubheader ─────────────────────────────────────────────────────────
/** The "Title  •  0/10 uploaded" row above each upload zone */
export const UploadSectionHeader = ({ title, badge }) => (
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    <span className="text-xs text-gray-500">{badge}</span>
  </div>
);
