import { createContext, useContext, useState, useEffect } from "react";
import api from "../../../../../services/api";

const AnnouncementContext = createContext(null);

export const AnnouncementProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/announcements");
      setAnnouncements(res.data.data || []);
    } catch (err) {
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const addAnnouncement = async (data) => {
    try {
      const res = await api.post("/announcements", data);
      if (res.data.success) {
        await fetchAnnouncements();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateAnnouncement = async (id, data) => {
    try {
      const res = await api.put(`/announcements/${id}`, data);
      if (res.data.success) {
        await fetchAnnouncements();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const archiveAnnouncement = async (id) => {
    try {
      const res = await api.patch(`/announcements/${id}/archive`);
      if (res.data.success) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "archived" } : a)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const restoreAnnouncement = async (id) => {
    try {
      const res = await api.patch(`/announcements/${id}/restore`);
      if (res.data.success) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "active" } : a)),
        );
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        loading,
        error,
        fetchAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        archiveAnnouncement,
        restoreAnnouncement,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncements = () => {
  const ctx = useContext(AnnouncementContext);
  if (!ctx)
    throw new Error(
      "useAnnouncements must be used within AnnouncementProvider",
    );
  return ctx;
};
