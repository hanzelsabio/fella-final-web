import { useLocation } from "react-router-dom";

/**
 * useBasePath
 * Returns "/staff" or "/admin" based on the current route.
 * Replaces the repeated useLocation + basePath pattern in every table and form.
 *
 * Usage:
 *   const basePath = useBasePath();
 */
const useBasePath = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/staff") ? "/staff" : "/admin";
};

export default useBasePath;
