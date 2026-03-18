import { ChevronLeft, ChevronRight } from "lucide-react";

const TablePagination = ({
  currentPage,
  totalPages,
  startIndex,
  totalItems,
  itemLabel = "items",
  onPrevious,
  onNext,
  onGoToPage,
  getPageNumbers,
}) => {
  if (totalPages <= 1)
    return (
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {totalItems} of{" "}
          {totalItems} {itemLabel}
        </p>
      </div>
    );

  const pages = getPageNumbers(totalPages);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 sm:px-6 py-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
        {Math.min(startIndex + 10, totalItems)} of {totalItems} {itemLabel}
      </div>

      {/* Mobile */}
      <div className="flex items-center justify-between w-full md:hidden">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`p-2 rounded-md border ${currentPage === 1 ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50"}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-600">
          Page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md border ${currentPage === totalPages ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50"}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`p-2 rounded-md border ${currentPage === 1 ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50"}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1">
          {pages.map((page, i) => (
            <button
              key={i}
              onClick={() => typeof page === "number" && onGoToPage(page)}
              disabled={page === "..."}
              className={`min-w-[36px] px-3 py-2 text-sm rounded-md ${
                page === currentPage
                  ? "bg-blue-500 text-white font-medium"
                  : page === "..."
                    ? "text-gray-400 cursor-default"
                    : "text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md border ${currentPage === totalPages ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50"}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
