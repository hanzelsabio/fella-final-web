import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useServices } from "../context/ServiceContext";
import { Save, ArrowLeft } from "lucide-react";
import SingleImageUpload from "../../../../components/common/SingleImageUpload";

const EditServiceForm = () => {
  const { id } = useParams();
  const { services, refreshData } = useServices();
  const navigate = useNavigate();

  const [serviceName, setServiceName] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [descriptionLines, setDescriptionLines] = useState("");
  const [serviceImage, setServiceImage] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);

  // Convert a stored JSON body back into newline-separated text for the textarea
  const bodyToLines = (body) => {
    if (!body) return "";
    if (Array.isArray(body)) return body.join("\n");
    try {
      const parsed = JSON.parse(body);
      return Array.isArray(parsed) ? parsed.join("\n") : body;
    } catch {
      return body;
    }
  };

  // Load service data
  useEffect(() => {
    const service = services.find((s) => s.id === parseInt(id));
    if (service) {
      setServiceName(service.name || "");
      setServiceSlug(service.slug || "");
      setServiceDescription(service.description || "");
      setDescriptionLines(bodyToLines(service.body));
      setServiceImage(service.image || "");
      setStatus(service.status || "active");
      setLoading(false);
    } else {
      fetchService();
    }
  }, [id, services]);

  const fetchService = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/services/${id}`);
      const data = await response.json();
      if (data.success && data.data) {
        const service = data.data;
        setServiceName(service.name || "");
        setServiceSlug(service.slug || "");
        setServiceDescription(service.description || "");
        setDescriptionLines(bodyToLines(service.body));
        setServiceImage(service.image || "");
        setStatus(service.status || "active");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching service:", error);
      setLoading(false);
    }
  };

  // Parse textarea lines into a clean array (ignore blank lines)
  const getListItems = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  const listItems = getListItems(descriptionLines);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceName.trim()) {
      alert("Please enter a service name");
      return;
    }
    if (!serviceSlug.trim()) {
      alert("Please enter a service slug");
      return;
    }

    const bodyJson = listItems.length > 0 ? JSON.stringify(listItems) : null;

    try {
      const response = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceName,
          slug: serviceSlug,
          description: serviceDescription,
          body: bodyJson,
          image: serviceImage,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Service updated successfully!");
        await refreshData();
        navigate("/admin/services");
      } else {
        alert("Failed to update service: " + data.message);
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Failed to update service");
    }
  };

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

  return (
    <div className="pb-6">
      <form onSubmit={handleSubmit}>
        <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
          <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
            <div className="flex-1 pb-5 px-4 sm:px-6">
              <h2 className="text-lg font-bold">Edit Service</h2>
              <p className="text-xs text-gray-600">
                Update service information
              </p>
            </div>
            <div className="flex flex-wrap text-xs gap-2 flex-shrink-0 px-4 sm:px-6">
              <Link
                to="/admin/services"
                className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
              >
                <div className="flex items-center">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="ps-2">Back</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="space-y-4 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Enter service name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Service Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serviceSlug}
                  onChange={(e) => setServiceSlug(e.target.value)}
                  placeholder="service-slug"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Short Description */}
              <div className="col-span-full">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Short Description{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="A brief summary shown at the top of the service modal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-gray-700"
                  rows="3"
                />
              </div>

              {/* List Details */}
              <div className="col-span-full">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Service Details{" "}
                  <span className="text-gray-400 font-normal">
                    (Optional) — one item per line, displays as numbered list in
                    modal
                  </span>
                </label>
                <textarea
                  value={descriptionLines}
                  onChange={(e) => setDescriptionLines(e.target.value)}
                  placeholder={`e.g.\nMinimum of 20 pieces per order\nFull sublimation printing\nFree design mockup`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-gray-700"
                  rows="6"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Press Enter to start a new list item.
                </p>

                {/* Live preview */}
                {listItems.length > 0 && (
                  <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Preview
                    </p>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                      {listItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
          <div className="border-b border-gray-200 mb-5">
            <div className="flex-1 pb-5 px-4 sm:px-6">
              <h2 className="text-lg font-bold">Service Image</h2>
              <p className="text-xs text-gray-600">
                Upload an image to represent this service
              </p>
            </div>
          </div>
          <div className="px-4 sm:px-6">
            <SingleImageUpload
              onImageChange={setServiceImage}
              initialImage={serviceImage}
              label="Service Image"
              folder="services"
              required={false}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
          <div className="flex justify-end items-end text-xs gap-2">
            <div className="flex flex-wrap text-xs gap-3 flex-shrink-0">
              <Link
                to="/admin/services"
                className="border border-gray-400 bg-white text-black rounded-md px-3 md:px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">Cancel</span>
              </Link>
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Update Service</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditServiceForm;
