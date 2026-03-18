import { Routes, Route } from "react-router-dom";
import { InvoiceProvider } from "../context/InvoiceContext";

import InvoicePage from "../pages/InvoicePage";
import CreateInvoicePage from "../pages/CreateInvoicePage";
import EditInvoicePage from "../pages/EditInvoicePage";
import ViewInvoicePage from "../pages/ViewInvoicePage";

const InvoiceRoutes = () => {
  return (
    <InvoiceProvider>
      <Routes>
        <Route index element={<InvoicePage />} />
        <Route path="new" element={<CreateInvoicePage />} />
        <Route path="edit/:invoice_number" element={<EditInvoicePage />} />
        <Route path="view/:invoice_number" element={<ViewInvoicePage />} />
      </Routes>
    </InvoiceProvider>
  );
};

export default InvoiceRoutes;
