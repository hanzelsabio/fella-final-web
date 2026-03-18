import axios from "axios";

export const API_BASE_URL = "http://localhost:5000"; // ← exported so components can use it

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Image URL helper ──────────────────────────────────────────────────────────
// Always call this before rendering any image src from the backend.
// - Already absolute URLs (http/https) are returned as-is
// - Relative /uploads/... paths get the backend base URL prepended
// - base64 data: URIs are returned as-is (draft previews)
// - null/undefined returns empty string (no broken img tags)
export const getImageUrl = (url) => {
  if (!url) return null;

  if (typeof url === "object" && url.url) {
    url = url.url;
  }

  if (typeof url !== "string") return null;

  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;

  return null;
};

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

// Upload
export const uploadAPI = {
  uploadImage: (file, folder = "products") => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        api
          .post("/upload/image", {
            image: reader.result,
            folder,
          })
          .then(resolve)
          .catch(reject);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

export default api;
