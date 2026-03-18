import { Routes, Route } from "react-router-dom";
import { InquiryProvider } from "../context/InquiryContext";

import InquiriesPage from "../pages/InquiriesPage";
import ViewInquiriesPage from "../pages/ViewInquiriesPage";

const InquiryRoutes = () => {
  return (
    <InquiryProvider>
      <Routes>
        <Route index element={<InquiriesPage />} />
        <Route path="view/:inquiry_number" element={<ViewInquiriesPage />} />
      </Routes>
    </InquiryProvider>
  );
};

export default InquiryRoutes;
