import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ellipsis } from "lucide-react";

const CategoryDropdown = ({ productId, status, onDelete, onArchive }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.right - 160,
      });
    }
    setOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="hover:text-gray-400"
        style={{ cursor: "pointer" }}
      >
        <Ellipsis className="w-5 h-5" />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            zIndex: 9999,
          }}
          className="w-40 bg-white border border-gray-200 rounded-md shadow-md"
        >
          <Link
            to={`/admin/categories/edit/${productId}`}
            className="block px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Edit Category
          </Link>

          <button
            onClick={() => {
              onArchive(productId);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
          >
            {status === "archived" ? "Unarchive" : "Archive"}
          </button>

          <div className="border-t border-gray-200 mx-4"></div>

          <button
            onClick={() => {
              onDelete(productId);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
};

export default CategoryDropdown;
