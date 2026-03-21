import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ellipsis } from "lucide-react";

/**
 * DropdownMenu
 * Shared base for all action dropdowns. Handles open/close state,
 * fixed positioning, and outside-click dismissal.
 *
 * Props:
 *   width    — Tailwind width class, e.g. "w-40" (default) or "w-48"
 *   children — menu items, built with <DropdownLink> and <DropdownItem>
 */
export const DropdownMenu = ({ width = "w-40", children }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.right - 160 });
    }
    setOpen((prev) => !prev);
  };

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="hover:text-gray-400 cursor-pointer"
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
          className={`${width} bg-white border border-gray-200 rounded-md shadow-md`}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </>
  );
};

/**
 * DropdownLink — a <Link> menu item
 * Props: to, onClick (optional extra handler), children
 */
export const DropdownLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-50"
  >
    {children}
  </Link>
);

/**
 * DropdownItem — a <button> menu item
 * Props: onClick, variant ("default" | "danger" | "success" | "warning"), children
 */
const ITEM_COLORS = {
  default: "text-gray-700",
  black: "text-black",
  danger: "text-red-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  info: "text-blue-600",
  orange: "text-orange-600",
};

export const DropdownItem = ({ onClick, variant = "default", children }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${ITEM_COLORS[variant] ?? ITEM_COLORS.default}`}
  >
    {children}
  </button>
);

/** DropdownDivider — horizontal separator */
export const DropdownDivider = () => (
  <div className="border-t border-gray-200 mx-4" />
);
