// frontend/src/staff/layouts/StaffLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/StaffSidebar";
import StaffHeader from "../components/StaffHeader";
import StaffFooter from "../components/StaffFooter";

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <StaffSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="w-full flex flex-col bg-gray-100 overflow-x-hidden">
        <StaffHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="px-6 flex-1">
          <Outlet />
        </div>
        <StaffFooter />
      </main>
    </div>
  );
};

export default StaffLayout;
