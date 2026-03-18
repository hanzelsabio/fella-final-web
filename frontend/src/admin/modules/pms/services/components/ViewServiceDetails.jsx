import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useServices } from "../context/ServiceContext";
import { ArrowLeft, Edit } from "lucide-react";
import resolveImageUrl from "../../../../components/helper/resolveImageUrl";

const ViewServiceDetails = () => {
  const { slug } = useParams();
  const { services } = useServices();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const parseBody = (body) => {
    if (!body) return null;
    if (Array.isArray(body)) return body;
    try {
      const parsed = JSON.parse(body);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const found = services.find(
      (s) => s.slug === slug || String(s.id) === String(slug),
    );
    if (found) {
      setService(found);
      setLoading(false);
    } else {
      fetch(`http://localhost:5000/api/services/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) setService(data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching service:", err);
          setLoading(false);
        });
    }
  }, [slug, services]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64 m-20">
        <div className="text-sm text-center">
          <p className="text-gray-600">Service not found</p>
          <Link
            to="/admin/services"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const bodyItems = parseBody(service.body);
  const imageUrl = resolveImageUrl(service.image);

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-lg font-bold">Service Details</h2>
            <p className="text-xs text-gray-600">
              View complete service information
            </p>
          </div>
          <div className="flex flex-wrap text-xs gap-3 flex-shrink-0 px-4 sm:px-6">
            <Link
              to="/admin/services"
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </Link>
            <Link
              to={`/admin/services/edit/${service.id}`}
              className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700"
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>Edit Service</span>
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
                  Service ID
                </label>
                <p className="text-sm text-gray-900">{service.id}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Service Name
                </label>
                <p className="text-sm text-gray-900">{service.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Slug
                </label>
                <p className="text-sm text-gray-900">{service.slug || "N/A"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    service.status === "archived"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {service.status === "archived" ? "Archived" : "Active"}
                </span>
              </div>
              {service.description && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Short Description
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {service.description}
                  </p>
                </div>
              )}
              {bodyItems && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Service Details
                  </label>
                  <ol className="list-decimal list-inside text-sm text-gray-900 space-y-1">
                    {bodyItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Service Image */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Service Image
            </h3>
            {imageUrl ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden inline-block">
                <img
                  src={imageUrl}
                  alt={service.name}
                  className="max-w-md w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <p className="text-sm text-gray-500 p-4 hidden">
                  Failed to load image
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No image uploaded</p>
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
                  {service.created_at
                    ? new Date(service.created_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {service.updated_at
                    ? new Date(service.updated_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewServiceDetails;
