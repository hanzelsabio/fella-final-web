import { createContext, useContext, useState, useEffect } from "react";
import api from "../../../../../services/api";

const ReviewsContext = createContext(null);

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({ heading: "", subheading: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews");
      setReviews(res.data.data || []);
    } catch (err) {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    api
      .get("/reviews/settings")
      .then((res) => setSettings(res.data.data || {}))
      .catch(console.error);
  }, []);

  const addReview = async (data) => {
    try {
      const res = await api.post("/reviews", data);
      if (res.data.success) {
        await fetchReviews();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateReview = async (id, data) => {
    try {
      const res = await api.put(`/reviews/${id}`, data);
      if (res.data.success) {
        await fetchReviews();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteReview = async (id) => {
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveReview = async (id) => {
    try {
      const res = await api.patch(`/reviews/${id}/archive`);
      if (res.data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "archived" } : r)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreReview = async (id) => {
    try {
      const res = await api.patch(`/reviews/${id}/restore`);
      if (res.data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "active" } : r)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateSettings = async (data) => {
    try {
      const res = await api.put("/reviews/settings", data);
      if (res.data.success) {
        setSettings(data);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        settings,
        loading,
        error,
        fetchReviews,
        addReview,
        updateReview,
        deleteReview,
        archiveReview,
        restoreReview,
        updateSettings,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
};
