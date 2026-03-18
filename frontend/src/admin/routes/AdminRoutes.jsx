import { Routes, Route } from "react-router-dom";

// Public
import AdminLogin from "../../modules/auth/pages/AdminLogin";
import NotFound from "../layouts/NotFound";

// Main Dashboard
import AdminDashboardRoutes from "../modules/md/dashboard/routes/AdminDashboardRoutes";
import InquiryRoutes from "../modules/md/inquiries/routes/InquiryRoutes";
import InvoiceRoutes from "../modules/md/invoices/routes/InvoiceRoutes";

// Product Management
import ProductRoutes from "../modules/pms/products/routes/ProductRoutes";
import ServiceRoutes from "../modules/pms/services/routes/ServiceRoutes";
import CategoryRoutes from "../modules/pms/categories/routes/CategoryRoute";
import ColorwayRoutes from "../modules/pms/colorway/routes/ColorwayRoutes";

// Other Management
import InventoryRoutes from "../modules/oms/inventory/routes/InventoryRoutes";
import SupplierRoutes from "../modules/oms/suppliers/routes/SupplierRoutes";
import CustomerRoutes from "../modules/oms/customer/routes/CustomerRoutes";

// CMS/Content Management
import AnnouncementPage from "../modules/cms/announcement/pages/AnnouncementPage";
import HeroPage from "../modules/cms/hero/pages/HeroPage";
import AboutPage from "../modules/cms/about/pages/AboutPage";
import FaqsPage from "../modules/cms/faqs/pages/FaqsPage";
import WorksPage from "../modules/cms/works/pages/WorksPage";
import ClientReviewPage from "../modules/cms/reviews/pages/ClientReviewPage";
import ContactPage from "../modules/cms/contact/pages/ContactPage";

// System
import UserRoutes from "../modules/su/users/routes/UserRoutes";
import AdminProfilePage from "../pages/AdminProfilePage";
import AdminSettingsPage from "../pages/AdminSettingsPage";

// Guard
import AdminGuard from "../../guards/AdminGuard";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Public route — no guard */}
      <Route path="login" element={<AdminLogin />} />

      {/* All protected routes nested inside the guard */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          {/* Main Dashboard */}
          <Route path="dashboard" element={<AdminDashboardRoutes />} />
          <Route path="inquiries/*" element={<InquiryRoutes />} />
          <Route path="invoices/*" element={<InvoiceRoutes />} />

          {/* Product Management */}
          <Route path="products/*" element={<ProductRoutes />} />
          <Route path="services/*" element={<ServiceRoutes />} />
          <Route path="categories/*" element={<CategoryRoutes />} />
          <Route path="colorways/*" element={<ColorwayRoutes />} />

          {/* Other Management */}
          <Route path="inventory/*" element={<InventoryRoutes />} />
          <Route path="suppliers/*" element={<SupplierRoutes />} />
          <Route path="customers/*" element={<CustomerRoutes />} />

          {/* CMS */}
          <Route path="announcement" element={<AnnouncementPage />} />
          <Route path="hero" element={<HeroPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="faqs" element={<FaqsPage />} />
          <Route path="our-works" element={<WorksPage />} />
          <Route path="reviews" element={<ClientReviewPage />} />
          <Route path="contact" element={<ContactPage />} />

          {/* System */}
          <Route path="system-users/*" element={<UserRoutes />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* 404 — always last */}
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
}
