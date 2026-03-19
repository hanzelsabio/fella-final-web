import { API_BASE_URL } from "./api";

/**
 * Resolves an image URL from the backend into a renderable src string.
 *
 * - Already absolute URLs (http/https) → returned as-is
 * - Relative /uploads/... paths       → backend base URL prepended
 * - base64 data: URIs                 → returned as-is (draft previews)
 * - Object with a .url property       → unwrapped and resolved
 * - null / undefined / unknown        → returns null (no broken <img> tags)
 */
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
