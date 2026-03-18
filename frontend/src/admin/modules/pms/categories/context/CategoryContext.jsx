import { createContext, useContext, useState, useEffect } from "react";
import { categoryAPI } from "../services/categoryAPI";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
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
        const categoriesRes = await categoryAPI.getAll();
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error in fetchAllData:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  // ==================== CATEGORY METHODS ====================

  const deleteCategory = async (categoryId) => {
    try {
      const response = await categoryAPI.delete(categoryId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to delete category",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete category",
      };
    }
  };

  const archiveCategory = async (categoryId) => {
    try {
      const response = await categoryAPI.archive(categoryId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to archive category",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to archive category",
      };
    }
  };

  const restoreCategory = async (categoryId) => {
    try {
      const response = await categoryAPI.restore(categoryId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to restore category",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to restore category",
      };
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        deleteCategory,
        archiveCategory,
        restoreCategory,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
