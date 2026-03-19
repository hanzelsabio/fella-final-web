import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useInventory } from "../context/InventoryContext";
import { uploadAPI, getImageUrl } from "../../../../../services";
import { Save, ArrowLeft, ImagePlus, X } from "lucide-react";

const EditItemForm = () => {
  const { slug } = useParams();
  const { inventory, updateItem } = useInventory();
  const navigate = useNavigate();

  const [itemId, setItemId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const imageInputRef = useRef(null);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  useEffect(() => {
    if (slug) loadItem();
  }, [slug, inventory]);

  const loadItem = async () => {
    let item = inventory.find((i) => i.slug === slug);

    if (!item) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/inventory/slug/${slug}`,
        );
        const data = await response.json();
        if (data.success && data.data) item = data.data;
      } catch (error) {
        console.error("Error loading item:", error);
      }
    }

    if (item) {
      setItemId(item.id);
      setItemName(item.name || "");
      setDescription(item.description || "");
      setQuantity(String(item.quantity ?? ""));
      if (item.image) {
        const fullUrl = getImageUrl(item.image);
        setImage({ preview: fullUrl, url: item.image, file: null });
      } else {
        setImage(null);
      }
    }

    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage({ file, preview: reader.result, url: null });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const uploadImage = async (imgData) => {
    if (imgData?.url && !imgData.url.startsWith("data:") && !imgData.file)
      return imgData.url;
    if (!imgData?.file) return null;
    try {
      const response = await uploadAPI.uploadImage(imgData.file, "inventory");
      return response.data?.data?.url || null;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    }
  };

  const handleUpdate = async () => {
    if (!itemName.trim()) {
      alert("Please enter an item name");
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      alert("Please enter a valid quantity");
      return;
    }

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image);
      if (image.file && !imageUrl) {
        alert("Image upload failed. Please try again.");
        return;
      }
    }

    const result = await updateItem(itemId, {
      name: itemName.trim(),
      description: description.trim() || null,
      quantity: qty,
      image: imageUrl,
    });

    if (result.success) {
      alert("Item updated successfully!");
      navigate(`${basePath}/inventory`);
    } else {
      alert("Failed to update item: " + result.message);
    }
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

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-md font-bold">Edit Item</h2>
            <p className="text-xs text-gray-600">
              Update the inventory item details
            </p>
          </div>
          <div className="flex flex-wrap text-xs gap-2 flex-shrink-0 px-4 sm:px-6">
            <Link
              to={`${basePath}/inventory`}
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
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
                placeholder="Enter item description..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Item Image{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            {image ? (
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={image.preview}
                    alt="Item preview"
                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {image.file
                      ? "New image selected"
                      : "Current image (saved)"}
                  </p>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-xs text-blue-500 hover:text-blue-600 mt-0.5"
                  >
                    Change image
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 w-full md:w-64 px-4 py-3 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <ImagePlus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Click to upload an image</span>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
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
              <span className="font-medium">Update Item</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemForm;
