import { Trash2, Archive } from "lucide-react";

const BulkActionBar = ({
  count,
  onDelete,
  onArchive,
  archiveLabel = "Archive",
  extraActions = [],
}) => (
  <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-lg px-4 py-5">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
      <p className="text-xs text-gray-500">
        {count} item{count !== 1 ? "s" : ""} selected
      </p>
      <div className="flex text-xs gap-3 flex-shrink-0">
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-500 text-white rounded-md px-4 py-3 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:flex">Delete</span>
          </div>
        </button>
        <button
          onClick={onArchive}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-3 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Archive className="w-4 h-4" />
            <span className="hidden sm:flex">{archiveLabel}</span>
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
                <span className="hidden md:flex">{label}</span>
              </div>
            </button>
          ),
        )}
      </div>
    </div>
  </div>
);

export default BulkActionBar;
