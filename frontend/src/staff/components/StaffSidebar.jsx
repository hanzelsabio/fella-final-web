import { NavLink } from "react-router-dom";
import { useState } from "react";
import Logo from "../../admin/components/common/Logo";
import { useAuth } from "../../modules/auth/context/AuthContext";
import {
  ChevronUp,
  ChevronDown,
  X,
  LayoutDashboard,
  Inbox,
  FileText,
  Table,
  LayoutTemplate,
  Settings,
  LogOut,
} from "lucide-react";

function StaffSidebar({ isOpen, setIsOpen }) {
  const { staffLogout } = useAuth();
  const [pagesOpen, setPagesOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed top-4 right-4 z-50 bg-transparent text-gray-300 p-2"
        >
          <X className="w-8 h-8" />
        </button>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 lg:w-100
        bg-black shadow-lg text-white flex flex-col overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-center p-8">
          <Logo />
        </div>

        <nav className="flex-1">
          <div className="mb-1">
            <span className="text-xs ps-5">MAIN</span>
          </div>

          {/* DASHBOARD */}
          <NavLink
            to="/staff/dashboard"
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          {/* INQUIRIES */}
          <NavLink
            to="/staff/inquiries"
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <Inbox className="w-5 h-5 flex-shrink-0" />
            <span>Inquiries</span>
          </NavLink>

          {/* INVOICES */}
          <NavLink
            to="/staff/invoices"
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <span>Invoices</span>
          </NavLink>

          <div className="my-1">
            <span className="text-xs ps-5">MANAGEMENT</span>
          </div>

          {/* PRODUCT MANAGEMENT DROPDOWN */}
          <div>
            <button
              type="button"
              onClick={() => setPagesOpen(!pagesOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Table className="w-5 h-5 flex-shrink-0" />
                <span>Product Management</span>
              </div>
              {pagesOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {pagesOpen && (
              <div>
                {["products"].map((item) => (
                  <NavLink
                    key={item}
                    to={`/staff/${item}`}
                    onClick={closeSidebarOnMobile}
                    className={({ isActive }) =>
                      `block px-13 py-4 text-sm transition-colors ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* OTHERS DROPDOWN — customers only */}
          <div>
            <button
              type="button"
              onClick={() => setOthersOpen(!othersOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-5 h-5 flex-shrink-0" />
                <span>Others</span>
              </div>
              {othersOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {othersOpen && (
              <div>
                {["Inventory", "Customers"].map((item) => (
                  <NavLink
                    key={item}
                    to={`/staff/${item}`}
                    onClick={closeSidebarOnMobile}
                    className={({ isActive }) =>
                      `block px-13 py-4 text-sm transition-colors ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <div className="my-1">
            <span className="text-xs ps-5">SYSTEM</span>
          </div>

          {/* Settings */}
          <div className="">
            <NavLink
              to="/staff/settings"
              onClick={closeSidebarOnMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Logout */}
        <button
          onClick={() => {
            staffLogout();
            closeSidebarOnMobile();
          }}
          className="flex items-center gap-3 px-5 py-4 mb-8 text-sm text-red-400 hover:bg-gray-700 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

export default StaffSidebar;
