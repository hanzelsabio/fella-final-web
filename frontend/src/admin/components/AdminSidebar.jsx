import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./common/Logo";
import { useAuth } from "../../modules/auth/context/AuthContext";

import {
  ChevronUp,
  ChevronDown,
  X,
  LayoutDashboard,
  LayoutTemplate,
  Inbox,
  FileText,
  Palette,
  Table,
  History,
  Settings,
  LogOut,
  Users,
} from "lucide-react";

function AdminSidebar({ isOpen, setIsOpen }) {
  const { adminLogout } = useAuth();
  const [pagesOpen, setPagesOpen] = useState(false);
  const [componentsOpen, setComponentsOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);

  const closeSidebarOnMobile = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Close Button - Outside Sidebar (Top Right) */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed top-4 right-4 z-50 bg-transparent text-gray-300 p-2 transition-colors"
          style={{ cursor: "pointer" }}
        >
          <X className="w-8 h-8" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 lg:w-100
        bg-black shadow-lg text-white flex flex-col overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-center p-8">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className="mb-1">
            <span className="text-xs ps-5">MAIN</span>
          </div>

          {/* DASHBOARD */}
          <div className="">
            <NavLink
              to="/admin/dashboard"
              onClick={closeSidebarOnMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white border-gray-800"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* INQUIRIES */}
          <div className="">
            <NavLink
              to="/admin/inquiries"
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
          </div>

          {/* INVOICES */}
          <div className="">
            <NavLink
              to="/admin/invoices"
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
          </div>

          {/* SALES */}
          {/* <div className="">
            <NavLink
              to="/admin/sales"
              onClick={closeSidebarOnMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <ChartNoAxesColumn className="w-5 h-5 flex-shrink-0" />
              <span>Sales</span>
            </NavLink>
          </div> */}

          {/* TASKS */}
          {/* <div className="">
            <NavLink
              to="/admin/tasks"
              onClick={closeSidebarOnMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <CircleCheckBig className="w-5 h-5 flex-shrink-0" />
              <span>Tasks</span>
            </NavLink>
          </div> */}

          <div className="my-1">
            <span className="text-xs ps-5">MANAGEMENT</span>
          </div>

          {/* PAGES DROPDOWN */}
          <div className="">
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
                <ChevronUp className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              )}
            </button>

            {pagesOpen && (
              <div className="">
                <NavLink
                  to="/admin/products"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Products
                </NavLink>
                <NavLink
                  to="/admin/services"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Services
                </NavLink>
                <NavLink
                  to="/admin/categories"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Categories
                </NavLink>
                <NavLink
                  to="/admin/colorways"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Colorways
                </NavLink>
              </div>
            )}
          </div>

          {/* COMPONENTS DROPDOWN */}
          <div className="">
            <button
              type="button"
              onClick={() => setComponentsOpen(!componentsOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 flex-shrink-0" />
                <span>Page Customization</span>
              </div>
              {componentsOpen ? (
                <ChevronUp className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              )}
            </button>

            {componentsOpen && (
              <div className="">
                <NavLink
                  to="/admin/announcement"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Announcement
                </NavLink>
                <NavLink
                  to="/admin/hero"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Hero
                </NavLink>
                <NavLink
                  to="/admin/about"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/admin/faqs"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  FAQs
                </NavLink>
                <NavLink
                  to="/admin/our-works"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Our Works
                </NavLink>
                <NavLink
                  to="/admin/reviews"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Reviews
                </NavLink>
                <NavLink
                  to="/admin/contact"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Contact
                </NavLink>
              </div>
            )}
          </div>

          {/* OTHERS DROPDOWN */}
          <div className="">
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
                <ChevronUp className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              )}
            </button>

            {othersOpen && (
              <div className="">
                <NavLink
                  to="/admin/inventory"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Inventory
                </NavLink>
                <NavLink
                  to="/admin/suppliers"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Suppliers
                </NavLink>
                <NavLink
                  to="/admin/customers"
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `block px-13 py-4 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Customers
                </NavLink>
              </div>
            )}
          </div>

          <div className="my-1">
            <span className="text-xs ps-5">SYSTEM</span>
          </div>

          <div className="">
            <NavLink
              to="/admin/system-users"
              onClick={closeSidebarOnMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span>Manage Users</span>
            </NavLink>
          </div>

          {/* Settings */}
          <div className="">
            <NavLink
              to="/admin/activity-log"
              onClick={closeSidebarOnMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white border-l-4 border-gray-800"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <History className="w-5 h-5 flex-shrink-0" />
              <span>Recent Activities</span>
            </NavLink>
          </div>

          {/* Settings */}
          <div className="">
            <NavLink
              to="/admin/settings"
              onClick={closeSidebarOnMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white border-l-4 border-gray-800"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Logout Button */}
        <button
          onClick={() => {
            adminLogout();
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

export default AdminSidebar;
