import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import AnnouncementLayout from "../../../components/layout/Announcement/AnnouncementLayout";
import HeaderLayout from "../../../components/layout/Header/HeaderLayout";
import FooterLayout from "../../../components/layout/Footer/FooterLayout";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import FeaturedSection from "./FeaturedSection";
import ProductModal from "./ProductModal";

import {
  useProductData,
  useProductImages,
  useProductServices,
  useFeaturedProducts,
  useRecentlyViewed,
} from "../../../components/hooks/useProductDetails";

import slugify from "../../../components/helper/slugify";
import BackToTop from "../../../components/helper/BackToTop";

import "../assets/styles/product.css";
import { useProducts } from "../context/ProductContext";

function ProductDetails() {
  const { slug } = useParams();
  const { products, services } = useProducts();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /** States */
  const [isFading, setIsFading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  /** Custom hooks */
  const { product } = useProductData(slug, products, services);
  const {
    activeImage,
    setActiveImage,
    selectedColorName,
    setSelectedColorName,
    thumbnails,
  } = useProductImages(product);
  const { featuredPackage, featuredProduct } = useFeaturedProducts(
    products,
    slug,
  );
  const recentlyViewed = useRecentlyViewed(product);

  /** Effects */
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedService(null);
    setSearchParams({});
  }, [slug, setSearchParams]);

  useEffect(() => {
    if (!services.length) return;
    const serviceSlug = searchParams.get("service");
    const service = services.find(
      (s) => slugify(s.title || s.name) === serviceSlug,
    );
    setSelectedService(service || null);
  }, [services, searchParams]);

  /** Handlers */
  const handleProductClick = (item) => {
    setIsFading(true);
    setTimeout(() => {
      navigate(`/package/${item.slug || slugify(item.title)}`); // ← fixed: was /product/
      setIsFading(false);
    }, 300);
  };

  const handleSwatchSelect = (swatch) => {
    setSelectedColorName(swatch.name);
    setActiveImage(swatch.image || product.image);
  };

  const handleGetQuote = () => {
    navigate("/inquiry-form", { state: { service: selectedService, product } });
  };

  const openModal = (service) => setSelectedService(service);
  const closeModal = () => setSelectedService(null);

  /** Loading & Error */
  if (!products.length && !services.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product_section flex justify-center items-center h-screen">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <>
      <AnnouncementLayout />
      <HeaderLayout />
      <div className="product_section">
        <div
          className={`transition-opacity duration-300 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Product Details */}
          <section className="product_details_section max-w-6xl mx-auto py-10 md:py-20 px-8 sm:px-20">
            <div className="product_details_body grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <ProductImage
                activeImage={activeImage}
                product={product}
                thumbnails={thumbnails}
                setActiveImage={setActiveImage}
              />
              <ProductInfo
                product={product}
                selectedColorName={selectedColorName}
                onSwatchSelect={handleSwatchSelect}
                services={services}
                openModal={openModal}
              />
            </div>
          </section>

          {/* Featured Packages */}
          <FeaturedSection
            title="Featured Packages"
            items={featuredPackage}
            onItemClick={handleProductClick}
          />

          {/* Featured Products */}
          <FeaturedSection
            title="Featured Products"
            items={featuredProduct}
            onItemClick={handleProductClick}
          />

          <FooterLayout />
        </div>

        {/* Modal */}
        <ProductModal
          selectedService={selectedService}
          product={product}
          onClose={closeModal}
          onGetQuote={handleGetQuote}
        />
      </div>
      <BackToTop />
    </>
  );
}

export default ProductDetails;
