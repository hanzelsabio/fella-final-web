import { createContext, useContext, useState, useEffect } from "react";
import api from "../../../../../services/api";

const HeroContext = createContext(null);

export const HeroProvider = ({ children }) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hero");
      setSlides(res.data.data || []);
    } catch (err) {
      setError("Failed to load slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const addSlide = async (data) => {
    try {
      const res = await api.post("/hero", data);
      if (res.data.success) {
        await fetchSlides();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateSlide = async (id, data) => {
    try {
      const res = await api.put(`/hero/${id}`, data);
      if (res.data.success) {
        await fetchSlides();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteSlide = async (id) => {
    try {
      const res = await api.delete(`/hero/${id}`);
      if (res.data.success) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveSlide = async (id) => {
    try {
      const res = await api.patch(`/hero/${id}/archive`);
      if (res.data.success) {
        setSlides((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "archived" } : s)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreSlide = async (id) => {
    try {
      const res = await api.patch(`/hero/${id}/restore`);
      if (res.data.success) {
        setSlides((prev) =>
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
    <HeroContext.Provider
      value={{
        slides,
        loading,
        error,
        fetchSlides,
        addSlide,
        updateSlide,
        deleteSlide,
        archiveSlide,
        restoreSlide,
      }}
    >
      {children}
    </HeroContext.Provider>
  );
};

export const useHero = () => {
  const ctx = useContext(HeroContext);
  if (!ctx) throw new Error("useHero must be used within HeroProvider");
  return ctx;
};
