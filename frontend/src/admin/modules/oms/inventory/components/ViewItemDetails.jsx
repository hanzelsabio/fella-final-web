import { Link, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useInventory } from "../context/InventoryContext";
import { getImageUrl } from "../../../../../services";
import { ArrowLeft, Edit, Package } from "lucide-react";

const ViewItemDetails = () => {
  const { slug } = useParams();
  const { inventory } = useInventory();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  useEffect(() => {
    const loadItem = async () => {
      // Try context first
      const found = inventory.find((i) => i.slug === slug);
      if (found) {
        setItem(found);
        setLoading(false);
        return;
      }

      // Fallback to direct API call
      try {
        const response = await fetch(
          `http://localhost:5000/api/inventory/slug/${slug}`,
        );
        const data = await response.json();
        if (data.success && data.data) setItem(data.data);
      } catch (error) {
        console.error("Error fetching inventory item:", error);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [slug, inventory]);

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return (
        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
          Out of Stock
        </span>
      );
    if (quantity <= 10)
      return (
        <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
          Low Stock ({quantity})
        </span>
      );
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        In Stock ({quantity})
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-64 m-20">
        <div className="text-sm text-center">
          <p className="text-gray-600">Inventory item not found</p>
          <Link
            to={`${basePath}/inventory`}
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = item.image ? getImageUrl(item.image) : null;

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-lg font-bold">Item Details</h2>
            <p className="text-xs text-gray-600">
              View complete inventory item information
            </p>
          </div>
          <div className="flex flex-wrap text-xs gap-3 flex-shrink-0 px-4 sm:px-6">
            <Link
              to={`${basePath}/inventory`}
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </Link>
            <Link
              to={`${basePath}/inventory/edit/${item.slug}`}
              className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700"
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>Edit Item</span>
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
                  Item ID
                </label>
                <p className="text-sm text-gray-900">{item.id}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Item Name
                </label>
                <p className="text-sm text-gray-900">{item.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Slug
                </label>
                <p className="text-sm text-gray-900">{item.slug}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.status === "archived"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.status === "archived" ? "Archived" : "Active"}
                </span>
              </div>
              {item.description && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Quantity
                </label>
                {getStockStatus(item.quantity)}
              </div>
            </div>
          </div>

          {/* Item Image */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Item Image
            </h3>
            {imageUrl ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden inline-block">
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="max-w-xs w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="max-w-xs w-full h-48 bg-gray-100 items-center justify-center hidden">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {item.updated_at
                    ? new Date(item.updated_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewItemDetails;
