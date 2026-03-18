import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSupplier } from "../context/SupplierContext";
import { ArrowLeft, Edit } from "lucide-react";

const ViewSupplierDetails = () => {
  const { slug } = useParams();
  const { suppliers } = useSupplier();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) loadSupplier();
  }, [slug, suppliers]);

  const loadSupplier = async () => {
    // Try context first
    let found = suppliers.find((s) => s.slug === slug);

    // Fallback to direct API call (context may not have description)
    if (!found) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/suppliers/slug/${slug}`,
        );
        const data = await response.json();
        if (data.success && data.data) found = data.data;
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    } else {
      // Re-fetch to get description field (getAllSuppliers doesn't return it)
      try {
        const response = await fetch(
          `http://localhost:5000/api/suppliers/slug/${slug}`,
        );
        const data = await response.json();
        if (data.success && data.data) found = data.data;
      } catch {
        // use context data as fallback
      }
    }

    setSupplier(found || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading supplier...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex items-center justify-center h-64 m-20">
        <div className="text-sm text-center">
          <p className="text-gray-600">Supplier not found</p>
          <Link
            to="/admin/suppliers"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Suppliers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-lg font-bold">Supplier Details</h2>
            <p className="text-xs text-gray-600">
              View complete supplier information
            </p>
          </div>
          <div className="flex flex-wrap text-xs gap-3 flex-shrink-0 px-4 sm:px-6">
            <Link
              to="/admin/suppliers"
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </Link>
            <Link
              to={`/admin/suppliers/edit/${supplier.slug}`}
              className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700"
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>Edit Supplier</span>
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
                  Supplier ID
                </label>
                <p className="text-sm text-gray-900">{supplier.id}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Supplier Name
                </label>
                <p className="text-sm text-gray-900">{supplier.name}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Slug
                </label>
                <p className="text-sm text-gray-900">{supplier.slug}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Contact No.
                </label>
                <p className="text-sm text-gray-900">
                  {supplier.contact_no || "—"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    supplier.status === "archived"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {supplier.status === "archived" ? "Archived" : "Active"}
                </span>
              </div>

              {supplier.description && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {supplier.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {supplier.created_at
                    ? new Date(supplier.created_at).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {supplier.updated_at
                    ? new Date(supplier.updated_at).toLocaleString()
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

export default ViewSupplierDetails;
