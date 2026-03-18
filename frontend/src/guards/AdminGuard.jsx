import { Outlet } from "react-router-dom";
import { useAuth } from "../modules/auth/context/AuthContext";

import Forbidden from "../shared/pages/Forbidden";

const AdminGuard = () => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return admin ? <Outlet /> : <Forbidden />;
};

export default AdminGuard;
