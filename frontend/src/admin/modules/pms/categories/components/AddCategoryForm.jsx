import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useCategories } from "../context/CategoryContext";
import { ChevronDown, Save, ArrowLeft } from "lucide-react";
import SingleImageUpload from "../../../../components/common/SingleImageUpload";

const AddCategoryForm = () => {
  const { refreshData } = useCategories();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [status, setStatus] = useState("active");

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setCategoryName(name);

    // Auto-generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setCategorySlug(slug);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!categoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    if (!categorySlug.trim()) {
      alert("Please enter a category slug");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
          slug: categorySlug,
          description: categoryDescription,
          image: categoryImage,
          status: status,
          product_count: 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Category created successfully!");
        await refreshData();
        navigate(`${basePath}/categories`);
      } else {
        alert("Failed to create category: " + data.message);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    }
  };

  return (
    <div className="pb-6">
      <form onSubmit={handleSubmit}>
        <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
          <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
            {/* Header Section */}
            <div className="flex-1 pb-5 px-4 sm:px-6">
              <h2 className="text-lg font-bold">Add New Category</h2>
              <p className="text-xs text-gray-600">
                Create a new category for organizing products
              </p>
            </div>
            <div className="flex flex-wrap text-xs gap-2 flex-shrink-0 px-4 sm:px-6">
              <Link
                to={`${basePath}/categories`}
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
              {/* Category Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={handleNameChange}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
                  required
                />
              </div>

              {/* Category Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Category Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  placeholder="category-slug"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from category name
                </p>
              </div>

              {/* Status */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700 bg-white appearance-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 top-5 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Category Description */}
              <div className="col-span-full">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Category Description (Optional)
                </label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Enter category description here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-gray-700"
                  rows="6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
          <div className="border-b border-gray-200 mb-5">
            <div className="flex-1 pb-5 px-4 sm:px-6">
              <h2 className="text-lg font-bold">Category Image</h2>
              <p className="text-xs text-gray-600">
                Upload an image to represent this category
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-6">
            <SingleImageUpload
              onImageChange={setCategoryImage}
              initialImage={categoryImage}
              label="Category Image"
              folder="categories"
              required={false}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
          <div className="flex justify-end items-end text-xs gap-2">
            <div className="flex flex-wrap text-xs gap-3 flex-shrink-0">
              <Link
                to={`${basePath}/categories`}
                className="border border-gray-400 bg-white text-black rounded-md px-3 md:px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="font-medium">Cancel</span>
                </div>
              </Link>
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center">
                  <Save className="w-4 h-4" />
                  <span className="ps-2">Publish Category</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCategoryForm;
