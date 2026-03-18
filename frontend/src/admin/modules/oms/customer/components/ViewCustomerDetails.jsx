import { Link, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCustomer } from "../context/CustomerContext";
import { ArrowLeft, Edit } from "lucide-react";

const ViewCustomerDetails = () => {
  const { slug } = useParams();
  const { customers } = useCustomer();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  useEffect(() => {
    if (slug) loadCustomer();
  }, [slug, customers]);

  const loadCustomer = async () => {
    // Always fetch via API to get description field
    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/slug/${slug}`,
      );
      const data = await response.json();
      if (data.success && data.data) {
        setCustomer(data.data);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }

    // Fallback to context
    const found = customers.find((c) => c.slug === slug);
    setCustomer(found || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64 m-20">
        <div className="text-sm text-center">
          <p className="text-gray-600">Customer not found</p>
          <Link
            to={`${basePath}/customers`}
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Customers
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
            <h2 className="text-lg font-bold">Customer Details</h2>
            <p className="text-xs text-gray-600">
              View complete customer information
            </p>
          </div>
          <div className="flex flex-wrap text-xs gap-3 flex-shrink-0 px-4 sm:px-6">
            <Link
              to={`${basePath}/customers`}
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </Link>
            <Link
              to={`${basePath}/customers/edit/${customer.slug}`}
              className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700"
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>Edit Customer</span>
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
                  Customer ID
                </label>
                <p className="text-sm text-gray-900">{customer.id}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Customer Name
                </label>
                <p className="text-sm text-gray-900">{customer.name}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Slug
                </label>
                <p className="text-sm text-gray-900">{customer.slug}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Contact No.
                </label>
                <p className="text-sm text-gray-900">
                  {customer.contact_no || "—"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{customer.email || "—"}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    customer.status === "archived"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {customer.status === "archived" ? "Archived" : "Active"}
                </span>
              </div>

              {customer.description && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {customer.description}
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
                  {customer.created_at
                    ? new Date(customer.created_at).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {customer.updated_at
                    ? new Date(customer.updated_at).toLocaleString()
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

export default ViewCustomerDetails;
