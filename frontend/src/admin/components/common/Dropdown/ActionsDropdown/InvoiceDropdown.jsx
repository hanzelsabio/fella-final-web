import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Ellipsis } from "lucide-react";

const InvoiceDropdown = ({
  invoiceId,
  invoiceNumber,
  status,
  onDelete,
  onArchive,
  onMarkAsPaid,
  onMarkAsUnpaid,
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

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
          className="w-44 bg-white border border-gray-200 rounded-md shadow-md"
        >
          {/* View More — navigates by invoice_number */}
          <Link
            to={`${basePath}/invoices/view/${invoiceNumber}`}
            className="block px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={close}
          >
            View More
          </Link>

          <div className="border-t border-gray-200 mx-4" />

          <Link
            to={`${basePath}/invoices/edit/${invoiceNumber}`}
            className="block px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={close}
          >
            Edit
          </Link>

          <div className="border-t border-gray-200 mx-4" />

          {/* Status actions */}
          {status === "archived" ? (
            <button
              onClick={() => {
                onArchive(invoiceId);
                close();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Restore
            </button>
          ) : (
            <>
              {status !== "paid" && (
                <button
                  onClick={() => {
                    onMarkAsPaid(invoiceId);
                    close();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50"
                >
                  Mark as Paid
                </button>
              )}
              {status !== "unpaid" && (
                <button
                  onClick={() => {
                    onMarkAsUnpaid(invoiceId);
                    close();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-gray-50"
                >
                  Mark as Unpaid
                </button>
              )}
              <button
                onClick={() => {
                  onArchive(invoiceId);
                  close();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Archive
              </button>
            </>
          )}

          <div className="border-t border-gray-200 mx-4" />

          {/* Delete */}
          <button
            onClick={() => {
              onDelete(invoiceId);
              close();
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

export default InvoiceDropdown;
