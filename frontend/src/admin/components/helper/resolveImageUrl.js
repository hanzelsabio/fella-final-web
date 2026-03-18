// Resolves a stored image path to a full URL.
// The DB stores relative paths like "uploads/services/image.png"
// but images are served from the Express backend, not the Vite frontend.

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const resolveImageUrl = (path) => {
  if (!path || path.trim() === "") return null;
  // Already a full URL (http/https or blob/data)
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  // Relative path — prefix with backend base URL
  return `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
};

export default resolveImageUrl;
