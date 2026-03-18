import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSupplier } from "../context/SupplierContext";
import { Save, ArrowLeft } from "lucide-react";

const EditSupplierForm = () => {
  const { slug } = useParams();
  const { suppliers, updateSupplier } = useSupplier();
  const navigate = useNavigate();

  const [supplierId, setSupplierId] = useState(null);
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) loadSupplier();
  }, [slug, suppliers]);

  const loadSupplier = async () => {
    // Try context first
    let supplier = suppliers.find((s) => s.slug === slug);

    // Fallback to direct API call
    if (!supplier) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/suppliers/slug/${slug}`,
        );
        const data = await response.json();
        if (data.success && data.data) supplier = data.data;
      } catch (error) {
        console.error("Error loading supplier:", error);
      }
    }

    if (supplier) {
      setSupplierId(supplier.id);
      setName(supplier.name || "");
      setContactNo(supplier.contact_no || "");
      setDescription(supplier.description || "");
    }

    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      alert("Please enter a supplier name");
      return;
    }

    const result = await updateSupplier(supplierId, {
      name: name.trim(),
      contact_no: contactNo.trim() || null,
      description: description.trim() || null,
    });

    if (result.success) {
      alert("Supplier updated successfully!");
      navigate("/admin/suppliers");
    } else {
      alert("Failed to update supplier: " + result.message);
    }
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

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-md font-bold">Edit Supplier</h2>
            <p className="text-xs text-gray-600">Update the supplier details</p>
          </div>
          <div className="flex flex-wrap text-xs gap-2 flex-shrink-0 px-4 sm:px-6">
            <Link
              to="/admin/suppliers"
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Fields */}
        <div className="px-4 sm:px-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter supplier name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
              />
            </div>

            {/* Contact No. */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Contact No.{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                placeholder="e.g. 09171234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
              />
            </div>

            {/* Description */}
            <div className="col-span-full">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Description{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter supplier description..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6">
        <div className="flex justify-end text-xs">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span className="font-medium">Update Supplier</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSupplierForm;
