import { createContext, useContext, useState, useEffect } from "react";
import { inventoryAPI } from "../services/inventoryAPI";

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryAPI.getAll();
      setInventory(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const addItem = async (itemData) => {
    try {
      const res = await inventoryAPI.create(itemData);
      if (res.data.success) {
        await fetchInventory();
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const res = await inventoryAPI.update(id, itemData);
      if (res.data.success) {
        await fetchInventory();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await inventoryAPI.delete(id);
      if (res.data.success) {
        setInventory((prev) => prev.filter((item) => item.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveItem = async (id) => {
    try {
      const res = await inventoryAPI.archive(id);
      if (res.data.success) {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "archived" } : item,
          ),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreItem = async (id) => {
    try {
      const res = await inventoryAPI.restore(id);
      if (res.data.success) {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "active" } : item,
          ),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        loading,
        error,
        fetchInventory,
        addItem,
        updateItem,
        deleteItem,
        archiveItem,
        restoreItem,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx)
    throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
};
