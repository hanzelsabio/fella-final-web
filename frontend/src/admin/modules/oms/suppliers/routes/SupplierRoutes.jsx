import { Routes, Route } from "react-router-dom";
import { SupplierProvider } from "../context/SupplierContext";

import SuppliersPage from "../pages/SuppliersPage";
import AddSupplierPage from "../pages/AddSupplierPage";
import ViewSupplierPage from "../pages/ViewSupplierPage";
import EditSupplierPage from "../pages/EditSupplierPage";

const SupplierRoutes = () => {
  return (
    <SupplierProvider>
      <Routes>
        <Route index element={<SuppliersPage />} />
        <Route path="new" element={<AddSupplierPage />} />
        <Route path="view/:slug" element={<ViewSupplierPage />} />
        <Route path="edit/:slug" element={<EditSupplierPage />} />
      </Routes>
    </SupplierProvider>
  );
};

export default SupplierRoutes;
