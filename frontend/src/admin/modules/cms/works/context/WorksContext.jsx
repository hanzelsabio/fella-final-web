import { createContext, useContext, useState, useEffect } from "react";
import api from "../../../../../services/api";

const WorksContext = createContext(null);

export const WorksProvider = ({ children }) => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/works");
      setWorks(res.data.data || []);
    } catch (err) {
      setError("Failed to load works");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const addWork = async (data) => {
    try {
      const res = await api.post("/works", data);
      if (res.data.success) {
        await fetchWorks();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateWork = async (id, data) => {
    try {
      const res = await api.put(`/works/${id}`, data);
      if (res.data.success) {
        await fetchWorks();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteWork = async (id) => {
    try {
      const res = await api.delete(`/works/${id}`);
      if (res.data.success) {
        setWorks((prev) => prev.filter((w) => w.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveWork = async (id) => {
    try {
      const res = await api.patch(`/works/${id}/archive`);
      if (res.data.success) {
        setWorks((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "archived" } : w)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreWork = async (id) => {
    try {
      const res = await api.patch(`/works/${id}/restore`);
      if (res.data.success) {
        setWorks((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "active" } : w)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <WorksContext.Provider
      value={{
        works,
        loading,
        error,
        fetchWorks,
        addWork,
        updateWork,
        deleteWork,
        archiveWork,
        restoreWork,
      }}
    >
      {children}
    </WorksContext.Provider>
  );
};

export const useWorks = () => {
  const ctx = useContext(WorksContext);
  if (!ctx) throw new Error("useWorks must be used within WorksProvider");
  return ctx;
};
