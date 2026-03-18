import { createContext, useContext, useState, useEffect } from "react";
import { colorAPI } from "../services/colorwayAPI";

const ColorwayContext = createContext();

export const ColorwayProvider = ({ children }) => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      let colorsMap = {};
      try {
        const colorsRes = await colorAPI.getAll();
        if (colorsRes.data.success) {
          const colorsData = colorsRes.data.data || [];
          setColors(colorsData);
          colorsData.forEach((c) => {
            colorsMap[c.id] = c;
          });
        }
      } catch (err) {
        console.error("Error fetching colors:", err);
        setColors([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error in fetchAllData:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  // ==================== COLOR METHODS ====================

  const deleteColor = async (colorId) => {
    try {
      const response = await colorAPI.delete(colorId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to delete colorway",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete colorway",
      };
    }
  };

  const archiveColor = async (colorId) => {
    try {
      const response = await colorAPI.archive(colorId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to archive colorway",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to archive colorway",
      };
    }
  };

  const restoreColor = async (colorId) => {
    try {
      const response = await colorAPI.restore(colorId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to restore colorway",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to restore colorway",
      };
    }
  };

  return (
    <ColorwayContext.Provider
      value={{
        colors,
        loading,
        error,
        deleteColor,
        archiveColor,
        restoreColor,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </ColorwayContext.Provider>
  );
};

export const useColorways = () => useContext(ColorwayContext);
