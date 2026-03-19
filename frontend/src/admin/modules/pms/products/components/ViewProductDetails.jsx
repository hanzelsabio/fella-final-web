import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProducts } from "../context/ProductContext";
import { getImageUrl } from "../../../../../services";
import { ArrowLeft, Edit } from "lucide-react";

const ViewProductDetails = () => {
  const { slug } = useParams();
  const { products, services, colors } = useProducts();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  useEffect(() => {
    const loadProduct = async () => {
      const foundProduct = products.find((p) => p.slug === slug);

      if (foundProduct) {
        setProduct({
          ...foundProduct,
          productImages: foundProduct.productImages || [],
          sizeChartImage:
            foundProduct.size_chart || foundProduct.sizeChartImage || null,
        });
        setLoading(false);
      } else {
        try {
          const response = await fetch(`/api/products/slug/${slug}`);
          const data = await response.json();
          if (data.success && data.data) {
            setProduct({
              ...data.data,
              productImages: data.data.productImages || [],
              sizeChartImage:
                data.data.size_chart || data.data.sizeChartImage || null,
            });
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching product:", error);
          setLoading(false);
        }
      }
    };

    loadProduct();
  }, [slug]);

  const parseBody = (body) => {
    if (!body) return null;
    if (Array.isArray(body)) return body.filter(Boolean);
    if (typeof body === "string") {
      try {
        const parsed = JSON.parse(body);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        // not JSON — fall through to newline split
      }
      const lines = body
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return lines.length > 0 ? lines : null;
    }
    return null;
  };

  const getServiceNames = (serviceIds) => {
    if (!serviceIds || serviceIds.length === 0) return "None";
    return serviceIds
      .map((id) => {
        const service = services.find((s) => s.id === id);
        return service ? service.name || service.title : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  const getColorNames = (colorIds) => {
    if (!colorIds || colorIds.length === 0) return "None";
    return colorIds
      .map((id) => {
        const color = colors.find((c) => c.id === id);
        return color ? color.name : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64 m-20">
        <div className="text-sm text-center">
          <p className="text-gray-600">Product not found</p>
          <Link
            to={`${basePath}/products`}
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const bodyItems = parseBody(product.body);

  return (
    <div className="pb-6">
      <div className="border-b border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-lg font-bold">Product Details</h2>
            <p className="text-xs text-gray-600">
              View complete product information
            </p>
          </div>
          <div className="flex flex-wrap text-xs gap-3 flex-shrink-0 px-4 sm:px-6">
            <Link
              to={`${basePath}/products`}
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </Link>
            <Link
              to={`${basePath}/products/edit/${product.slug}`}
              className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700"
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>Edit Product</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Product ID
                </label>
                <p className="text-sm text-gray-900">{product.id}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Product Name
                </label>
                <p className="text-sm text-gray-900">{product.title}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Slug
                </label>
                <p className="text-sm text-gray-900">{product.slug}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Category
                </label>
                <p className="text-sm text-gray-900">
                  {product.categoryName || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Price
                </label>
                <p className="text-sm text-gray-900">
                  {product.price && parseFloat(product.price) > 0
                    ? `PHP ${parseFloat(product.price).toFixed(2)}`
                    : "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.status === "archived"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {product.status === "archived" ? "Archived" : "Active"}
                </span>
              </div>

              {product.heading && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Product Heading
                  </label>
                  <p className="text-sm text-gray-900">{product.heading}</p>
                </div>
              )}

              {product.description && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Short Description
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {bodyItems && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Product Details
                  </label>
                  <ul className="space-y-1">
                    {bodyItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-900"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Availability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Available Services
                </label>
                <p className="text-sm text-gray-900">
                  {getServiceNames(product.services)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Available Colors
                </label>
                <p className="text-sm text-gray-900">
                  {getColorNames(product.colors)}
                </p>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Product Images
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {product.productImages && product.productImages.length > 0 ? (
                product.productImages.map((image, index) => {
                  // ← getImageUrl resolves /uploads/... → http://localhost:5000/uploads/...
                  const rawSrc =
                    typeof image === "string"
                      ? image
                      : image.url || image.preview || image;
                  const imageSrc = getImageUrl(rawSrc);
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={imageSrc}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 col-span-full">
                  No images available
                </p>
              )}
            </div>
          </div>

          {/* Size Chart */}
          {product.sizeChartImage && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Size Chart
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden inline-block">
                <img
                  // ← getImageUrl resolves /uploads/... → http://localhost:5000/uploads/...
                  src={getImageUrl(
                    typeof product.sizeChartImage === "string"
                      ? product.sizeChartImage
                      : product.sizeChartImage.url ||
                          product.sizeChartImage.preview ||
                          product.sizeChartImage,
                  )}
                  alt="Size Chart"
                  className="max-w-md w-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(product.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(product.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductDetails;
