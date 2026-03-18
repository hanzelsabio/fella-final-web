import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    const adminUser = localStorage.getItem("admin_user");
    if (adminToken && adminUser) {
      setAdmin(JSON.parse(adminUser));
    }

    const staffToken = localStorage.getItem("staff_token");
    const staffUser = localStorage.getItem("staff_user");
    if (staffToken && staffUser) {
      setStaff(JSON.parse(staffUser));
    }

    setLoading(false);
  }, []);

  // Admin auth
  const adminLogin = async (email, password) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");

    const data = await res.json();
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_user", JSON.stringify(data.user));
    setAdmin(data.user);
    navigate("/admin/dashboard");
  };

  const adminLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdmin(null);
    navigate("/admin/login");
  };

  // Staff auth
  const staffLogin = async (email, password) => {
    const res = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");

    const data = await res.json();
    localStorage.setItem("staff_token", data.token);
    localStorage.setItem("staff_user", JSON.stringify(data.user));
    setStaff(data.user);
    navigate("/staff/dashboard");
  };

  const staffLogout = () => {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_user");
    setStaff(null);
    navigate("/staff/login");
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        staff,
        loading,
        setAdmin,
        setStaff,
        adminLogin,
        adminLogout,
        staffLogin,
        staffLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
