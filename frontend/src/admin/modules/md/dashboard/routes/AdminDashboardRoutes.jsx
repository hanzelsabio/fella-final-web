import { Routes, Route } from "react-router-dom";

import { ProductProvider } from "../../../pms/products/context/ProductContext";
import { ServiceProvider } from "../../../pms/services/context/ServiceContext";
import { CategoryProvider } from "../../../pms/categories/context/CategoryContext";
import { SystemUserProvider } from "../../../su/users/context/SystemUserContext";
import { InventoryProvider } from "../../../oms/inventory/context/InventoryContext";
import { SupplierProvider } from "../../../oms/suppliers/context/SupplierContext";
import { CustomerProvider } from "../../../oms/customer/context/CustomerContext";
import { InquiryProvider } from "../../inquiries/context/InquiryContext";
import { InvoiceProvider } from "../../invoices/context/InvoiceContext";

import AdminDashboardPage from "../pages/AdminDashboardPage";

const AdminDashboardRoutes = () => {
  return (
    <ProductProvider>
      <InquiryProvider>
        <InvoiceProvider>
          <ServiceProvider>
            <CategoryProvider>
              <SystemUserProvider>
                <InventoryProvider>
                  <SupplierProvider>
                    <CustomerProvider>
                      <Routes>
                        <Route index element={<AdminDashboardPage />} />
                      </Routes>
                    </CustomerProvider>
                  </SupplierProvider>
                </InventoryProvider>
              </SystemUserProvider>
            </CategoryProvider>
          </ServiceProvider>
        </InvoiceProvider>
      </InquiryProvider>
    </ProductProvider>
  );
};

export default AdminDashboardRoutes;
