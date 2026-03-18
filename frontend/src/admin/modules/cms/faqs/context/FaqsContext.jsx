import { createContext, useContext, useState, useEffect } from "react";
import api from "../../../../../services/api";

const FaqsContext = createContext(null);

export const FaqsProvider = ({ children }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/faqs");
      setFaqs(res.data.data || []);
    } catch (err) {
      setError("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const addFaq = async (data) => {
    try {
      const res = await api.post("/faqs", data);
      if (res.data.success) {
        await fetchFaqs();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateFaq = async (id, data) => {
    try {
      const res = await api.put(`/faqs/${id}`, data);
      if (res.data.success) {
        await fetchFaqs();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteFaq = async (id) => {
    try {
      const res = await api.delete(`/faqs/${id}`);
      if (res.data.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveFaq = async (id) => {
    try {
      const res = await api.patch(`/faqs/${id}/archive`);
      if (res.data.success) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "archived" } : f)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreFaq = async (id) => {
    try {
      const res = await api.patch(`/faqs/${id}/restore`);
      if (res.data.success) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "active" } : f)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <FaqsContext.Provider
      value={{
        faqs,
        loading,
        error,
        fetchFaqs,
        addFaq,
        updateFaq,
        deleteFaq,
        archiveFaq,
        restoreFaq,
      }}
    >
      {children}
    </FaqsContext.Provider>
  );
};

export const useFaqs = () => {
  const ctx = useContext(FaqsContext);
  if (!ctx) throw new Error("useFaqs must be used within FaqsProvider");
  return ctx;
};
