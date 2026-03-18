import { createContext, useContext, useState, useEffect } from "react";
import { supplierAPI } from "../services/supplierAPI";

const SupplierContext = createContext(null);

export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await supplierAPI.getAll();
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const addSupplier = async (data) => {
    try {
      const res = await supplierAPI.create(data);
      if (res.data.success) {
        await fetchSuppliers();
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateSupplier = async (id, data) => {
    try {
      const res = await supplierAPI.update(id, data);
      if (res.data.success) {
        await fetchSuppliers();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteSupplier = async (id) => {
    try {
      const res = await supplierAPI.delete(id);
      if (res.data.success) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveSupplier = async (id) => {
    try {
      const res = await supplierAPI.archive(id);
      if (res.data.success) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "archived" } : s)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreSupplier = async (id) => {
    try {
      const res = await supplierAPI.restore(id);
      if (res.data.success) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "active" } : s)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        loading,
        error,
        fetchSuppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        archiveSupplier,
        restoreSupplier,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplier = () => {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error("useSupplier must be used within SupplierProvider");
  return ctx;
};
