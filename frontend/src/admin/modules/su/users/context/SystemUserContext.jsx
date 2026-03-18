import { createContext, useContext, useState, useEffect } from "react";
import { systemUserAPI } from "../services/systemUserAPI";

const SystemUserContext = createContext(null);

export const SystemUserProvider = ({ children }) => {
  const [systemUsers, setSystemUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSystemUsers = async () => {
    try {
      setLoading(true);
      const res = await systemUserAPI.getAll();
      setSystemUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch system users:", err);
      setError("Failed to load system users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemUsers();
  }, []);

  const addUser = async (data) => {
    try {
      const res = await systemUserAPI.create(data);
      if (res.data.success) {
        await fetchSystemUsers();
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateUser = async (id, data) => {
    try {
      const res = await systemUserAPI.update(id, data);
      if (res.data.success) {
        await fetchSystemUsers();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await systemUserAPI.delete(id);
      if (res.data.success) {
        setSystemUsers((prev) => prev.filter((u) => u.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveUser = async (id) => {
    try {
      const res = await systemUserAPI.archive(id);
      if (res.data.success) {
        setSystemUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: "archived" } : u)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreUser = async (id) => {
    try {
      const res = await systemUserAPI.restore(id);
      if (res.data.success) {
        setSystemUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <SystemUserContext.Provider
      value={{
        systemUsers,
        loading,
        error,
        fetchSystemUsers,
        addUser,
        updateUser,
        deleteUser,
        archiveUser,
        restoreUser,
      }}
    >
      {children}
    </SystemUserContext.Provider>
  );
};

export const useSystemUser = () => {
  const ctx = useContext(SystemUserContext);
  if (!ctx)
    throw new Error("useSystemUser must be used within SystemUserProvider");
  return ctx;
};
