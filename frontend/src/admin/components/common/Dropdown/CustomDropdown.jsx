import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * CustomDropdown
 * Inline select-style dropdown for search/filter toolbars.
 * Not related to the fixed-position action dropdowns (DropdownMenu).
 *
 * Props:
 *   value       — currently selected value
 *   onChange    — (value) => void
 *   options     — array of { value, label }
 *   placeholder — shown when no option is selected
 *   icon        — optional Lucide icon shown on the left
 */
const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div
      ref={dropdownRef}
      className="relative flex-1 md:flex-initial min-w-[150px]"
    >
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2 border border-gray-300 rounded-md focus:outline-none text-sm bg-white cursor-pointer text-left`}
      >
        {selectedLabel || placeholder}
      </button>

      <ChevronDown
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${isOpen ? "rotate-180" : ""}`}
      />

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                option.value === value
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
