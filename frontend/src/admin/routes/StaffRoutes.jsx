import { Routes, Route } from "react-router-dom";

// Public
import StaffLogin from "../../modules/auth/pages/StaffLogin";
import NotFound from "../layouts/NotFound";

// Allowed routes only
import StaffDashboardRoutes from "../modules/md/dashboard/routes/StaffDashboardRoutes";
import InquiryRoutes from "../modules/md/inquiries/routes/InquiryRoutes";
import InvoiceRoutes from "../modules/md/invoices/routes/InvoiceRoutes";
import ProductRoutes from "../modules/pms/products/routes/ProductRoutes";
import InventoryRoutes from "../modules/oms/inventory/routes/InventoryRoutes";
import CustomerRoutes from "../modules/oms/customer/routes/CustomerRoutes";

// System
import StaffProfilePage from "../../staff/pages/StaffProfilePage";
import StaffSettingsPage from "../../staff/pages/StaffSettingsPage";

// Guard
import StaffGuard from "../../guards/StaffGuard";
import StaffLayout from "../../staff/layouts/StaffLayout";

export default function StaffRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="login" element={<StaffLogin />} />

      {/* Protected — staff/manager only */}
      <Route element={<StaffGuard />}>
        <Route element={<StaffLayout />}>
          <Route path="dashboard" element={<StaffDashboardRoutes />} />
          <Route path="inquiries/*" element={<InquiryRoutes />} />
          <Route path="invoices/*" element={<InvoiceRoutes />} />
          <Route path="products/*" element={<ProductRoutes />} />
          <Route path="inventory/*" element={<InventoryRoutes />} />
          <Route path="customers/*" element={<CustomerRoutes />} />

          {/* System */}
          <Route path="profile" element={<StaffProfilePage />} />
          <Route path="settings" element={<StaffSettingsPage />} />
        </Route>
      </Route>

      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
}
