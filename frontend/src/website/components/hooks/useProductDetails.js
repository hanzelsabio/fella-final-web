import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import slugify from "../helper/slugify";
import { getImageUrl } from "../../modules/product/services/productAPI";

// ─── useProductData ────────────────────────────────────────────────────────────
export const useProductData = (slug, products, services) => {
  const allProducts = useMemo(
    () => [...products, ...services],
    [products, services],
  );

  const product = useMemo(
    () => allProducts.find((p) => p.slug === slug || slugify(p.title) === slug),
    [allProducts, slug],
  );

  return { product, allProducts };
};

// ─── useProductImages ──────────────────────────────────────────────────────────
// Normalise any image value to a display-ready absolute URL string.
// productImages is now [{ url }] objects from the controller.
const resolveImg = (img) => {
  if (!img) return null;
  if (typeof img === "string") return getImageUrl(img);
  if (typeof img === "object" && img.url) return getImageUrl(img.url);
  if (typeof img === "object" && img.preview) return getImageUrl(img.preview);
  return null;
};

export const useProductImages = (product) => {
  const location = useLocation();

  const [activeImage, setActiveImage] = useState(null);
  const [selectedColorName, setSelectedColorName] = useState(
    location.state?.color?.name || null,
  );

  const selectedSwatch = useMemo(() => {
    if (!product || !selectedColorName) return null;
    return product.colorways?.find((c) => c.name === selectedColorName);
  }, [product, selectedColorName]);

  // Resolve every thumbnail to an absolute URL string
  const thumbnails = useMemo(() => {
    if (!product) return [];
    const imgs = product.productImages;
    if (Array.isArray(imgs) && imgs.length > 0) {
      const resolved = imgs.map(resolveImg).filter(Boolean);
      if (resolved.length > 0) return resolved;
    }
    const fallback = resolveImg(product.image);
    return fallback ? [fallback] : [];
  }, [product]);

  useEffect(() => {
    if (!product) return;

    if (product.colorways?.length) {
      const black = product.colorways.find(
        (c) => c.name.toLowerCase() === "black",
      );
      const defaultColor =
        location.state?.color || black || product.colorways[0];

      setSelectedColorName(defaultColor.name);
      // colorways[].image is already resolved by shapeProduct in ProductContext
      setActiveImage(
        defaultColor.image ||
          resolveImg(product.productImages?.[0]) ||
          resolveImg(product.image),
      );
    } else {
      setActiveImage(
        resolveImg(product.productImages?.[0]) ||
          resolveImg(product.image) ||
          null,
      );
    }
  }, [product, location.state]);

  return {
    activeImage,
    setActiveImage,
    selectedColorName,
    setSelectedColorName,
    selectedSwatch,
    thumbnails,
  };
};

// ─── useProductServices ────────────────────────────────────────────────────────
export const useProductServices = (services) => {
  const clothingLineService20 = useMemo(
    () =>
      services.find((s) => s.title?.toLowerCase().includes("20 pcs clothing")),
    [services],
  );

  const noMinimumService = useMemo(
    () => services.find((s) => s.title?.toLowerCase().includes("no minimum")),
    [services],
  );

  return { clothingLineService20, noMinimumService };
};

// ─── useFeaturedProducts ───────────────────────────────────────────────────────
export const useFeaturedProducts = (products, slug) => {
  const featuredPackage = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.categoryName === "Package" &&
          p.status === "active" &&
          p.slug !== slug &&
          slugify(p.title) !== slug,
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [products, slug]);

  const featuredProduct = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.categoryName === "Exclusive" &&
          p.status === "active" &&
          p.slug !== slug &&
          slugify(p.title) !== slug,
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [products, slug]);

  return { featuredPackage, featuredProduct };
};

// ─── useRecentlyViewed ─────────────────────────────────────────────────────────
export const useRecentlyViewed = (product) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (!product) return;
    const stored = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const updated = stored.filter((p) => String(p.id) !== String(product.id));
    // Resolve image to a plain string before storing
    const firstImage =
      resolveImg(product.productImages?.[0]) ||
      resolveImg(product.image) ||
      null;
    updated.unshift({
      id: product.id,
      title: product.title,
      image: firstImage,
    });
    localStorage.setItem("recentlyViewed", JSON.stringify(updated.slice(0, 5)));
    setRecentlyViewed(updated.slice(0, 5));
  }, [product]);

  return recentlyViewed;
};
