import { Pencil, Archive, Trash2 } from "lucide-react";

/**
 * InlineActionButtons
 * The repeated edit / archive / delete button group in every CMS inline-edit table.
 * When in edit mode, renders save (Check) and cancel (X) buttons instead.
 *
 * Props:
 *   isEditing  — boolean, shows save/cancel when true
 *   onEdit     — open edit mode
 *   onSave     — save edit
 *   onCancel   — cancel edit
 *   onArchive  — archive/restore toggle
 *   onDelete   — delete
 *   status     — item status ("active" | "archived"), used for Archive/Restore title
 */
import { Check, X } from "lucide-react";

const InlineActionButtons = ({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onArchive,
  onDelete,
  status,
}) => {
  if (isEditing) {
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onSave}
          className="p-1.5 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4 text-gray-600" />
        </button>
      )}
      {onArchive && (
        <button
          onClick={onArchive}
          className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
          title={status === "archived" ? "Restore" : "Archive"}
        >
          <Archive className="w-4 h-4 text-gray-600" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      )}
    </div>
  );
};

export default InlineActionButtons;
