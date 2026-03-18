import { Navigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/context/AuthContext";

const ProtectedAdmin = ({ children }) => {
  const { admin } = useAuth();

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdmin;
