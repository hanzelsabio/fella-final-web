import { Routes, Route } from "react-router-dom";

import { ProductProvider } from "../../../pms/products/context/ProductContext";
import { ServiceProvider } from "../../../pms/services/context/ServiceContext";
import { CategoryProvider } from "../../../pms/categories/context/CategoryContext";
import { InventoryProvider } from "../../../oms/inventory/context/InventoryContext";
import { CustomerProvider } from "../../../oms/customer/context/CustomerContext";
import { InquiryProvider } from "../../../md/inquiries/context/InquiryContext";
import { InvoiceProvider } from "../../../md/invoices/context/InvoiceContext";

import StaffDashboardPage from "../pages/StaffDashboardPage";

const StaffDashboardRoutes = () => {
  return (
    <ProductProvider>
      <InquiryProvider>
        <InvoiceProvider>
          <ServiceProvider>
            <CategoryProvider>
              <InventoryProvider>
                <CustomerProvider>
                  <Routes>
                    <Route index element={<StaffDashboardPage />} />
                  </Routes>
                </CustomerProvider>
              </InventoryProvider>
            </CategoryProvider>
          </ServiceProvider>
        </InvoiceProvider>
      </InquiryProvider>
    </ProductProvider>
  );
};

export default StaffDashboardRoutes;
