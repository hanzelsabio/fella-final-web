import { Outlet } from "react-router-dom";
import { useAuth } from "../modules/auth/context/AuthContext";
import Forbidden from "../shared/pages/Forbidden";

const StaffGuard = () => {
  const { staff, loading } = useAuth();
  if (loading) return null;
  return staff ? <Outlet /> : <Forbidden />;
};

export default StaffGuard;
