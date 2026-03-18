import { createContext, useContext, useState, useEffect } from "react";
import { serviceAPI } from "../services/serviceAPI";

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [services, setServices] = useState([]);
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
        const servicesRes = await serviceAPI.getAll();
        if (servicesRes.data.success) {
          setServices(servicesRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setServices([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error in fetchAllData:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  // ==================== SERVICE METHODS ====================

  const deleteService = async (serviceId) => {
    try {
      const response = await serviceAPI.delete(serviceId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to delete service",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete service",
      };
    }
  };

  const archiveService = async (serviceId) => {
    try {
      const response = await serviceAPI.archive(serviceId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to archive service",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to archive service",
      };
    }
  };

  const restoreService = async (serviceId) => {
    try {
      const response = await serviceAPI.restore(serviceId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to restore service",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to restore service",
      };
    }
  };

  return (
    <ServiceContext.Provider
      value={{
        services,
        loading,
        error,
        deleteService,
        archiveService,
        restoreService,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => useContext(ServiceContext);
