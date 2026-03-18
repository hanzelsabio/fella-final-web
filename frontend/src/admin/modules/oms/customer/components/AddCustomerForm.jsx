import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useCustomer } from "../context/CustomerContext";
import { Save, ArrowLeft } from "lucide-react";

const AddCustomerForm = () => {
  const { addCustomer } = useCustomer();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a customer name");
      return;
    }

    const result = await addCustomer({
      name: name.trim(),
      contact_no: contactNo.trim() || null,
      email: email.trim() || null,
      description: description.trim() || null,
    });

    if (result.success) {
      alert("Customer added successfully!");
      navigate(`${basePath}/customers`);
    } else {
      alert("Failed to add customer: " + result.message);
    }
  };

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-md font-bold">Add New Customer</h2>
            <p className="text-xs text-gray-600">
              Fill in the details to add a new customer
            </p>
          </div>
          <div className="flex flex-wrap text-xs gap-2 flex-shrink-0 px-4 sm:px-6">
            <Link
              to={`${basePath}/customers`}
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
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
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

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Email{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@email.com"
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
                placeholder="Enter customer notes or description..."
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
            onClick={handleSave}
            className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span className="font-medium">Save Customer</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerForm;
