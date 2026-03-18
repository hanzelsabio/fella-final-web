import { Routes, Route } from "react-router-dom";
import { InquiryProvider } from "../../../../admin/modules/md/inquiries/context/InquiryContext";
import InquiryPage from "../pages/InquiryPage";

const InquiryRoutes = () => {
  return (
    <InquiryProvider>
      <Routes>
        <Route index element={<InquiryPage />} />
      </Routes>
    </InquiryProvider>
  );
};

export default InquiryRoutes;
