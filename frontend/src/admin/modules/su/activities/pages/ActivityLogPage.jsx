import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import Breadcrumb from "../../../../components/common/Breadcrumb";
import Footer from "../../../../components/Footer";
import ActivityLogTable from "../components/ActivityLogTable";

const ActivityLogPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Page content */}
      <main className="w-full flex flex-col bg-gray-100 overflow-x-hidden">
        <Outlet />
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="px-6">
          <Breadcrumb title="Activity Log" />
          <ActivityLogTable />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ActivityLogPage;
