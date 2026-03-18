import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../modules/auth/context/AuthContext";
import { getImageUrl } from "../../services/api";
import {
  Menu,
  ChevronDown,
  ChevronUp,
  CircleUser,
  Settings,
  LogOut,
} from "lucide-react";

const AdminHeader = ({ onToggleSidebar }) => {
  const { admin, adminLogout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [dateTime, setDateTime] = useState(new Date());

  const formattedDate = dateTime.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  const formattedTime = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = admin
    ? `${admin.first_name ?? ""} ${admin.last_name ?? ""}`.trim() ||
      admin.username
    : "Admin";

  return (
    <header className="h-18 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* LEFT: Menu + DateTime */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {formattedDate} - {formattedTime}
        </div>
      </div>

      {/* User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 focus:outline-none cursor-pointer"
        >
          <img
            src={getImageUrl(admin?.image)}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border"
          />
          <span className="hidden md:flex text-sm font-medium text-gray-700">
            {displayName}
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {open && (
          <div className="absolute right-2 mt-5 w-60 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            {/* User info */}
            <div className="user_block p-4">
              <p className="text-black font-medium">{displayName}</p>
              <p className="text-xs">{admin?.email || ""}</p>{" "}
            </div>

            {/* Profile */}
            <button className="w-full text-black text-left px-6 py-3 hover:bg-gray-100">
              <Link to="/admin/profile">
                <div className="flex items-center gap-3">
                  <CircleUser className="w-5 h-5" />
                  <span>Profile</span>
                </div>
              </Link>
            </button>

            {/* Settings */}
            <button className="w-full text-black text-left px-6 py-3 hover:bg-gray-100">
              <Link to="/admin/settings">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </div>
              </Link>
            </button>

            <div className="border-t border-gray-200" />

            <button
              onClick={adminLogout}
              className="w-full text-left px-6 py-4 text-red-500 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-black" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
