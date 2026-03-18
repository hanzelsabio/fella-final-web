import { createContext, useContext, useState, useEffect } from "react";
import { customerAPI } from "../services/customerAPI";

const CustomerContext = createContext(null);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getAll();
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = async (data) => {
    try {
      const res = await customerAPI.create(data);
      if (res.data.success) {
        await fetchCustomers();
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateCustomer = async (id, data) => {
    try {
      const res = await customerAPI.update(id, data);
      if (res.data.success) {
        await fetchCustomers();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const res = await customerAPI.delete(id);
      if (res.data.success) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveCustomer = async (id) => {
    try {
      const res = await customerAPI.archive(id);
      if (res.data.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "archived" } : c)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreCustomer = async (id) => {
    try {
      const res = await customerAPI.restore(id);
      if (res.data.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "active" } : c)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        error,
        fetchCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        archiveCustomer,
        restoreCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
};
