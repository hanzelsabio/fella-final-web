import { Routes, Route } from "react-router-dom";
import { ServiceProvider } from "../context/ServiceContext";

import ServicePage from "../pages/ServicePage";
import AddServicePage from "../pages/AddServicePage";
import ViewServicePage from "../pages/ViewServicePage";
import EditServicePage from "../pages/EditServicePage";

const ServiceRoutes = () => {
  return (
    <ServiceProvider>
      <Routes>
        <Route index element={<ServicePage />} />
        <Route path="new" element={<AddServicePage />} />
        <Route path="view/:slug" element={<ViewServicePage />} />
        <Route path="edit/:id" element={<EditServicePage />} />
      </Routes>
    </ServiceProvider>
  );
};

export default ServiceRoutes;
