import { Routes, Route } from "react-router-dom";

import HomePage from "../modules/home/pages/HomePage";
import NotFound from "../layouts/NotFound";

import ContactPage from "../modules/contact/pages/ContactPage";

import ProductRoutes from "../modules/product/routes/ProductRoutes";
import InquiryRoutes from "../modules/inquiry/routes/InquiryRoutes";

export default function WebsiteRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/*" element={<NotFound />} />

      {/* Product Route */}
      <Route path="product/*" element={<ProductRoutes />} />
      <Route path="package/*" element={<ProductRoutes />} />

      {/* Contact Route */}
      <Route path="/contact" element={<ContactPage />} />

      {/* Inquiry Form Route */}
      <Route path="inquiry-form" element={<InquiryRoutes />} />
    </Routes>
  );
}
