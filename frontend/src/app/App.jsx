import { Routes, Route } from "react-router-dom";
import WebsiteRoutes from "../website/routes/WebsiteRoutes";
import AdminRoutes from "../admin/routes/AdminRoutes";
import StaffRoutes from "../admin/routes/StaffRoutes";

export default function App() {
  return (
    <Routes>
      {/* Remove the stray "s" here too */}
      {/* Public Website */}
      <Route path="/*" element={<WebsiteRoutes />} />
      {/* Admin Dashboard */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      {/* Staff Dashboard */}
      <Route path="/staff/*" element={<StaffRoutes />} />
    </Routes>
  );
}
