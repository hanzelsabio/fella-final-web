import { Routes, Route } from "react-router-dom";
import { CustomerProvider } from "../context/CustomerContext";

import CustomersPage from "../pages/CustomersPage";
import AddCustomerPage from "../pages/AddCustomerPage";
import EditCustomerPage from "../pages/EditCustomerPage";
import ViewCustomerPage from "../pages/ViewCustomerPage";

const CustomerRoutes = () => {
  return (
    <CustomerProvider>
      <Routes>
        <Route index element={<CustomersPage />} />
        <Route path="new" element={<AddCustomerPage />} />
        <Route path="edit/:slug" element={<EditCustomerPage />} />
        <Route path="view/:slug" element={<ViewCustomerPage />} />
      </Routes>
    </CustomerProvider>
  );
};

export default CustomerRoutes;
