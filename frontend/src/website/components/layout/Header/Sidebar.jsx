import { X } from "lucide-react";

import NavLinks from "./NavLinks";
import SocialsHeader from "./SocialsHeader";

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar_body fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50
        transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-end p-8">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-green-500 transition"
            aria-label="Close menu"
            style={{ cursor: "pointer" }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 text-2xl text-gray-700 px-8 gap-2">
          <NavLinks onClick={onClose} />
        </nav>

        {/* Social links */}
        <div className="absolute bottom-6 w-full flex gap-6 px-8 text-gray-600">
          <SocialsHeader />
        </div>
      </aside>
    </>
  );
}
