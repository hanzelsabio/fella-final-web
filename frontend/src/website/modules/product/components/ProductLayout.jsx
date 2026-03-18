import SectionTitle from "../../../components/common/SectionTitle";
import ProductCard from "./ProductCard";

import { useProducts } from "../context/ProductContext";

import "../assets/styles/product.css";

const ProductLayout = () => {
  const { products, loading, error } = useProducts();

  // Products are already shaped in ProductContext (colorways, image, category)
  // Just filter for active Package products
  const packageProducts = products.filter(
    (product) =>
      product.categoryName === "Package" && product.status === "active",
  );

  if (loading) {
    return (
      <section className="collection_section">
        <div className="collection_content max-w-6xl mx-auto py-24 px-8">
          <div className="collection_body grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="p-4 flex flex-col justify-between rounded-lg mt-30"
              >
                <div className="w-full h-70 bg-gray-200 rounded mb-10" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                <div className="flex justify-center gap-2 mt-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="collection_content max-w-6xl mx-auto py-80 px-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section id="services" className="collection_section">
      <div className="collection_content max-w-6xl mx-auto py-30 px-8">
        <SectionTitle title="CHOOSE YOUR PACKAGE" />
        <div className="collection_body grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {packageProducts.length > 0 ? (
            packageProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-3 text-center py-10">
              No packages available at the moment.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductLayout;
