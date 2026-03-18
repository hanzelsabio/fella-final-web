import { createContext, useContext, useState, useEffect } from "react";
import { inquiryAPI } from "../services/InquiryAPI";

const InquiryContext = createContext();

export const InquiryProvider = ({ children }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");
      try {
        const res = await inquiryAPI.getAll();
        if (res.data.success) setInquiries(res.data.data || []);
      } catch (err) {
        console.error("Error fetching inquiries:", err);
        setInquiries([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchAllData:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  // Optimistic status updater — avoids full refetch for simple status changes
  const optimisticStatusUpdate = (inquiryId, newStatus) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i)),
    );
  };

  const deleteInquiry = async (inquiryId) => {
    try {
      const response = await inquiryAPI.delete(inquiryId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete inquiry",
      };
    }
  };

  const archiveInquiry = async (inquiryId) => {
    try {
      const response = await inquiryAPI.archive(inquiryId);
      if (response.data.success) {
        optimisticStatusUpdate(inquiryId, "archived");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to archive inquiry",
      };
    }
  };

  const restoreInquiry = async (inquiryId) => {
    try {
      const response = await inquiryAPI.restore(inquiryId);
      if (response.data.success) {
        optimisticStatusUpdate(inquiryId, "pending");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to restore inquiry",
      };
    }
  };

  const markAsResponded = async (inquiryId) => {
    try {
      const response = await inquiryAPI.markAsResponded(inquiryId);
      if (response.data.success) {
        optimisticStatusUpdate(inquiryId, "responded");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to mark as responded",
      };
    }
  };

  const markAsCancelled = async (inquiryId) => {
    try {
      const response = await inquiryAPI.markAsCancelled(inquiryId);
      if (response.data.success) {
        optimisticStatusUpdate(inquiryId, "cancelled");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to cancel inquiry",
      };
    }
  };

  const markAsPending = async (inquiryId) => {
    try {
      const response = await inquiryAPI.markAsPending(inquiryId);
      if (response.data.success) {
        optimisticStatusUpdate(inquiryId, "pending");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to mark as pending",
      };
    }
  };

  const changePriority = async (inquiryId, newPriority) => {
    try {
      const response = await inquiryAPI.changePriority(inquiryId, newPriority);
      if (response.data.success) {
        // Optimistic update for priority field
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === inquiryId ? { ...i, priority: newPriority } : i,
          ),
        );
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update priority",
      };
    }
  };

  return (
    <InquiryContext.Provider
      value={{
        inquiries,
        loading,
        error,
        deleteInquiry,
        archiveInquiry,
        restoreInquiry,
        markAsResponded,
        markAsCancelled,
        markAsPending,
        changePriority,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </InquiryContext.Provider>
  );
};

export const useInquiries = () => useContext(InquiryContext);
