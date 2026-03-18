import { Trash2, Archive } from "lucide-react";

const BulkActionBar = ({
  count,
  onDelete,
  onArchive,
  archiveLabel = "Archive",
  extraActions = [],
}) => (
  <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mt-4">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
      <h2 className="text-sm font-medium">
        {count} item{count !== 1 ? "s" : ""} selected
      </h2>
      <div className="flex text-xs gap-3 flex-shrink-0 self-center sm:self-auto">
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-500 text-white rounded-md px-4 py-3 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span className="hidden lg:flex">Delete</span>
          </div>
        </button>
        <button
          onClick={onArchive}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-3 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Archive className="w-4 h-4" />
            <span className="hidden lg:flex">{archiveLabel}</span>
          </div>
        </button>

        {extraActions.map(
          (
            {
              label,
              icon: Icon,
              onClick,
              className = "bg-green-500 hover:bg-green-600",
            },
            i,
          ) => (
            <button
              key={i}
              onClick={onClick}
              className={`${className} text-white rounded-md px-4 py-3 transition-colors`}
            >
              <div className="flex items-center justify-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                <span className="hidden sm:flex">{label}</span>
              </div>
            </button>
          ),
        )}
      </div>
    </div>
  </div>
);

export default BulkActionBar;
