import { createContext, useContext, useState, useEffect } from "react";
import {
  productAPI,
  draftAPI,
  serviceAPI,
  categoryAPI,
  colorAPI,
  getImageUrl,
} from "../services/productAPI";

const ProductContext = createContext();

// ─── Shape raw DB product into what all components expect ──────────────────────
const shapeProduct = (product, colorsMap) => {
  // productImages is [{ url }] objects from the controller — extract the url string
  const rawImage =
    product.productImages?.[0]?.url ||
    product.productImages?.[0] ||
    product.image ||
    null;
  const image = getImageUrl(typeof rawImage === "string" ? rawImage : "");

  const colorways = (product.colors || [])
    .map((colorId) => {
      const match = colorsMap[colorId];
      if (!match) return null;

      // Per-color image comes from product.colorImages, not the color definition
      const rawColorImage = product.colorImages?.[colorId] || null;
      const colorImage = rawColorImage ? getImageUrl(rawColorImage) : image;

      return {
        name: match.name,
        color:
          match.hex_code ||
          match.hex ||
          match.color_hex ||
          match.color ||
          "#000000",
        image: colorImage,
      };
    })
    .filter(Boolean);

  return {
    ...product,
    image,
    colorways,
    category: product.categoryName || product.category,
  };
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [drafts, setDrafts] = useState([]);
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

      try {
        const productsRes = await productAPI.getAll();
        if (productsRes.data.success) {
          const shaped = (productsRes.data.data || []).map((p) =>
            shapeProduct(p, colorsMap),
          );
          setProducts(shaped);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      }

      try {
        const servicesRes = await serviceAPI.getAll();
        if (servicesRes.data.success) {
          setServices(servicesRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setServices([]);
      }

      try {
        const categoriesRes = await categoryAPI.getAll();
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }

      try {
        const draftsRes = await draftAPI.getAll();
        if (draftsRes.data.success) {
          const normalizedDrafts = (draftsRes.data.data || []).map((draft) => ({
            ...draft,
            productName: draft.productName || draft.product_name || draft.title,
            lastSaved: draft.lastSaved || draft.last_saved || draft.updatedAt,
          }));
          setDrafts(normalizedDrafts);
        }
      } catch (err) {
        console.error("Error fetching drafts:", err);
        setDrafts([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error in fetchAllData:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  // ==================== PRODUCT METHODS ====================

  const addProduct = async (productData) => {
    try {
      const response = await productAPI.create(productData);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to add product",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to add product",
      };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await productAPI.delete(productId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to delete product",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete product",
      };
    }
  };

  const archiveProduct = async (productId) => {
    try {
      const response = await productAPI.archive(productId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to archive product",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to archive product",
      };
    }
  };

  const restoreProduct = async (productId) => {
    try {
      const response = await productAPI.restore(productId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to restore product",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to restore product",
      };
    }
  };

  // ==================== DRAFT METHODS ====================

  const saveDraft = async (draftData) => {
    try {
      let response;
      if (draftData.id) {
        response = await draftAPI.update(draftData.id, draftData);
      } else {
        response = await draftAPI.save(draftData);
      }
      if (response.data.success) {
        await fetchAllData();
        return {
          success: true,
          message: response.data.message,
          id: response.data.data?.id,
        };
      }
      return {
        success: false,
        message: response.data.message || "Failed to save draft",
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save draft",
      };
    }
  };

  const getDraft = async (draftId) => {
    try {
      const response = await draftAPI.getById(draftId);
      if (response.data.success) return response.data.data;
      return null;
    } catch (err) {
      console.error("Error getting draft:", err);
      return null;
    }
  };

  const deleteDraft = async (draftId) => {
    try {
      const response = await draftAPI.delete(draftId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to delete draft",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete draft",
      };
    }
  };

  const publishDraft = async (draftId) => {
    try {
      const response = await draftAPI.publish(draftId);
      if (response.data.success) {
        await fetchAllData();
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to publish draft",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to publish draft",
      };
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
    <ProductContext.Provider
      value={{
        products,
        services,
        categories,
        colors,
        drafts,
        loading,
        error,
        addProduct,
        deleteProduct,
        archiveProduct,
        restoreProduct,
        saveDraft,
        getDraft,
        deleteDraft,
        publishDraft,
        deleteService,
        archiveService,
        restoreService,
        deleteCategory,
        archiveCategory,
        restoreCategory,
        deleteColor,
        archiveColor,
        restoreColor,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
