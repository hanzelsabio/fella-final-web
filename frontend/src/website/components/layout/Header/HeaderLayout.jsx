import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import Logo from "../../common/Logo";
import NavLinks from "./NavLinks";
import Sidebar from "./Sidebar";

import "./header.css";

export default function HeaderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname, hash } = useLocation();

  const isActive = (path) => pathname + hash === path;

  const linkClass = (path) =>
    `transition ${isActive(path) ? "text-green-600" : "hover:text-green-500"}`;

  return (
    <header className="header_section shadow-md relative w-full z-50">
      {/* NAVBAR */}
      <nav className="header_navigation container mx-auto relative flex items-center justify-between py-10 lg:py-3 px-6">
        {/* Left Logo */}
        <div className="hidden lg:flex">
          <Logo />
        </div>

        {/* Left */}
        <div className="flex flex-1 items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700 hover:text-green-500 transition"
            style={{ cursor: "pointer" }}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Center Logo */}
        <div className="absolute lg:hidden left-1/2 -translate-x-1/2">
          <Logo />
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8 text-md text-black">
          <NavLinks linkClass={linkClass} />
        </div>
      </nav>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  );
}
