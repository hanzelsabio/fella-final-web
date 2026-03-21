import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useProducts } from "../context/ProductContext";
import { uploadAPI, getImageUrl } from "../../../../../services";
import {
  Save,
  ArrowLeft,
  ChevronDown,
  Trash2,
  X,
  ImagePlus,
} from "lucide-react";

import ImageUploadSection from "../../../../components/common/ImageUpload/ImageUploadSection";

const DraftProductForm = () => {
  const { id: draftId } = useParams();
  const navigate = useNavigate();
  const {
    deleteDraft,
    saveDraft,
    getDraft,
    publishDraft,
    services,
    categories,
    colors,
  } = useProducts();

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [colorImages, setColorImages] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productName, setProductName] = useState("");
  const [productHeading, setProductHeading] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [descriptionLines, setDescriptionLines] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [sizeChartImage, setSizeChartImage] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(true);

  const colorImageInputRefs = useRef({});
  const autoSaveRef = useRef(null); // ← tracks interval so we can clear it on publish

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  const activeServices = services.filter((s) => s.status === "active");
  const activeCategories = categories.filter((c) => c.status === "active");
  const activeColors = colors.filter((c) => c.status === "active");

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

  const getListItems = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  const listItems = getListItems(descriptionLines);

  useEffect(() => {
    const loadDraft = async () => {
      if (draftId) {
        setLoading(true);
        try {
          const draft = await getDraft(draftId);
          if (draft) {
            setProductName(draft.productName || draft.product_name || "");
            setSelectedCategory(draft.category || "");
            setProductHeading(draft.heading || "");
            setProductPrice(draft.price || "");
            setProductDescription(draft.description || "");
            setDescriptionLines(bodyToLines(draft.body));
            setSelectedServices(draft.services || []);
            setSelectedColors(draft.colors || []);

            if (draft.colorImages && typeof draft.colorImages === "object") {
              const loaded = {};
              Object.entries(draft.colorImages).forEach(([colorId, url]) => {
                if (url) {
                  const fullUrl = getImageUrl(url);
                  loaded[colorId] = { preview: fullUrl, url };
                }
              });
              setColorImages(loaded);
            }

            const transformedImages = (draft.productImages || []).map(
              (img, index) => {
                const rawUrl = img?.url || img?.preview || img;
                return {
                  id: Date.now() + index,
                  preview: getImageUrl(
                    typeof rawUrl === "string" ? rawUrl : "",
                  ),
                  url: typeof rawUrl === "string" ? rawUrl : "",
                };
              },
            );
            setProductImages(transformedImages);

            const rawSizeChart = draft.sizeChartImage
              ? draft.sizeChartImage?.url ||
                draft.sizeChartImage?.preview ||
                draft.sizeChartImage
              : null;
            setSizeChartImage(
              rawSizeChart
                ? { preview: getImageUrl(rawSizeChart), url: rawSizeChart }
                : null,
            );
            setLastSaved(draft.lastSaved || draft.last_saved || null);
          }
        } catch (error) {
          console.error("Error loading draft:", error);
          alert("Failed to load draft");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadDraft();
  }, [draftId, getDraft]);

  // Auto-save every 30 seconds — stored in ref so publish can cancel it
  useEffect(() => {
    if (!loading && draftId) {
      autoSaveRef.current = setInterval(() => {
        handleSaveDraft(true);
      }, 30000);
      return () => clearInterval(autoSaveRef.current);
    }
  }, [
    loading,
    draftId,
    productName,
    selectedCategory,
    productHeading,
    productPrice,
    productDescription,
    descriptionLines,
    selectedServices,
    selectedColors,
    colorImages,
    productImages,
    sizeChartImage,
  ]);

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setProductPrice(value);
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice === 0) return "N/A";
    return `PHP ${numPrice.toFixed(2)}`;
  };

  const handleServiceChange = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleSelectAllServices = (e) => {
    if (e.target.checked) {
      setSelectedServices(activeServices.map((s) => s.id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleColorChange = (colorId) => {
    setSelectedColors((prev) => {
      const isSelected = prev.includes(colorId);
      if (isSelected) {
        setColorImages((imgs) => {
          const updated = { ...imgs };
          delete updated[colorId];
          return updated;
        });
        return prev.filter((id) => id !== colorId);
      }
      return [...prev, colorId];
    });
  };

  const handleSelectAllColors = (e) => {
    if (e.target.checked) {
      setSelectedColors(activeColors.map((c) => c.id));
    } else {
      setSelectedColors([]);
      setColorImages({});
    }
  };

  const handleColorImageChange = (colorId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setColorImages((prev) => ({
        ...prev,
        [colorId]: { preview: reader.result, file },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveColorImage = (colorId) => {
    setColorImages((prev) => {
      const updated = { ...prev };
      delete updated[colorId];
      return updated;
    });
    if (colorImageInputRefs.current[colorId]) {
      colorImageInputRefs.current[colorId].value = "";
    }
  };

  // Upload color image — pass through existing URLs, upload new files
  const uploadColorImage = async (colorId, imgData) => {
    if (imgData?.url && !imgData?.file) return imgData.url;
    if (!imgData?.file) return null;
    try {
      const response = await uploadAPI.uploadImage(imgData.file, "products");
      return response.data?.data?.url || null;
    } catch (err) {
      console.error(`Color image upload failed for color ${colorId}:`, err);
      throw new Error("Failed to upload color image. Please try again.");
    }
  };

  // Upload any productImages that have a file but no url, return final array of { url }
  const uploadPendingImages = async (images) => {
    return Promise.all(
      images.map(async (img) => {
        // Already has a real uploaded url — pass through
        if (img?.url && !img.url.startsWith("data:")) {
          return { url: img.url };
        }
        // Has a raw file that needs uploading
        if (img?.file) {
          try {
            const response = await uploadAPI.uploadImage(img.file, "products");
            const url = response.data?.data?.url || null;
            return { url };
          } catch (err) {
            console.error("Product image upload failed:", err);
            return { url: null };
          }
        }
        return { url: null };
      }),
    );
  };

  // Upload sizeChart if it has a file but no url, return url string or null
  const uploadPendingSizeChart = async (sizeChart) => {
    if (!sizeChart) return null;
    if (sizeChart?.url && !sizeChart.url.startsWith("data:"))
      return sizeChart.url;
    if (sizeChart?.file) {
      try {
        const response = await uploadAPI.uploadImage(
          sizeChart.file,
          "products",
        );
        return response.data?.data?.url || null;
      } catch (err) {
        console.error("Size chart upload failed:", err);
        return null;
      }
    }
    return null;
  };

  const allServicesSelected =
    activeServices.length > 0 &&
    selectedServices.length === activeServices.length;

  const allColorsSelected =
    activeColors.length > 0 && selectedColors.length === activeColors.length;

  const handleSaveDraft = async (silent = false) => {
    // Upload any pending images before saving so URLs are stored, not base64
    const uploadedImages = await uploadPendingImages(productImages);
    const sizeChartUrl = await uploadPendingSizeChart(sizeChartImage);

    // Upload pending color images
    const colorImagesForDraft = {};
    for (const [colorId, imgData] of Object.entries(colorImages)) {
      if (imgData?.url && !imgData.url.startsWith("data:")) {
        colorImagesForDraft[colorId] = imgData.url;
      } else if (imgData?.file) {
        const url = await uploadColorImage(colorId, imgData);
        if (url) colorImagesForDraft[colorId] = url;
      }
    }

    const bodyJson = listItems.length > 0 ? JSON.stringify(listItems) : null;

    const draftData = {
      id: draftId ? parseInt(draftId) : null,
      productName,
      category: selectedCategory,
      heading: productHeading,
      price: productPrice,
      description: productDescription,
      body: bodyJson,
      services: selectedServices,
      colors: selectedColors,
      colorImages: colorImagesForDraft,
      productImages: uploadedImages.filter((img) => img?.url),
      sizeChartImage: sizeChartUrl || null,
      lastSaved: new Date().toISOString(),
      status: "draft",
    };

    try {
      const result = await saveDraft(draftData);
      if (result.success) {
        setLastSaved(new Date().toISOString());
        if (!silent) alert("Draft saved successfully!");
      } else {
        if (!silent) alert("Failed to save draft: " + result.message);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      if (!silent) alert("Failed to save draft");
    }
  };

  const handleDeleteDraft = async () => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      try {
        const result = await deleteDraft(draftId);
        if (result.success) {
          alert("Draft deleted successfully");
          navigate(`${basePath}/products/drafts`);
        } else {
          alert("Failed to delete draft: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting draft:", error);
        alert("Failed to delete draft");
      }
    }
  };

  const handlePublishDraft = async () => {
    if (!productName.trim()) {
      alert("Please enter a product name");
      return;
    }
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }
    if (productImages.length === 0) {
      alert("Please upload at least one product image");
      return;
    }

    if (!window.confirm("Are you sure you want to publish this draft?")) return;

    // Stop auto-save from firing after publish deletes the draft
    clearInterval(autoSaveRef.current);

    // Upload any product images that are still base64 (file not yet uploaded)
    const uploadedImages = await uploadPendingImages(productImages);
    const validImages = uploadedImages.filter(
      (img) => img.url && !img.url.startsWith("data:"),
    );

    if (validImages.length === 0) {
      alert("Image upload failed. Please try again.");
      return;
    }

    const sizeChartUrl = await uploadPendingSizeChart(sizeChartImage);

    // Upload any pending color images
    let uploadedColorImages = {};
    try {
      for (const [colorId, imgData] of Object.entries(colorImages)) {
        const url = await uploadColorImage(colorId, imgData);
        if (url) uploadedColorImages[colorId] = url;
      }
    } catch (err) {
      alert(err.message);
      return;
    }

    const bodyJson = listItems.length > 0 ? JSON.stringify(listItems) : null;

    // Save draft one final time with all uploaded URLs before publish
    const draftData = {
      id: draftId ? parseInt(draftId) : null,
      productName,
      category: selectedCategory,
      heading: productHeading,
      price: productPrice,
      description: productDescription,
      body: bodyJson,
      services: selectedServices,
      colors: selectedColors,
      colorImages: uploadedColorImages,
      productImages: validImages, // ← only real uploaded URLs
      sizeChartImage: sizeChartUrl,
      lastSaved: new Date().toISOString(),
      status: "draft",
    };

    try {
      await saveDraft(draftData);
      const result = await publishDraft(draftId);
      if (result.success) {
        alert("Draft published successfully!");
        navigate(`${basePath}/products`);
      } else {
        alert("Failed to publish draft: " + result.message);
      }
    } catch (error) {
      console.error("Error publishing draft:", error);
      alert("Failed to publish draft");
    }
  };

  const formatLastSaved = (timestamp) => {
    if (!timestamp) return "Never saved";
    const date = new Date(timestamp);
    const diffMins = Math.floor((new Date() - date) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Product Description */}
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 px-4 sm:px-6 sm:pb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-md font-bold">Product Description</h2>
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Draft
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Input your product details and description here
            </p>
            {lastSaved && (
              <p className="text-xs text-gray-500 mt-1">
                Last saved: {formatLastSaved(lastSaved)}
              </p>
            )}
          </div>
          <div className="flex text-xs gap-2 flex-shrink-0 self-end sm:self-auto px-4 sm:px-6 pb-4">
            <Link
              to={`${basePath}/products/drafts`}
              className="bg-white border border-gray-300 text-black rounded-md px-4 py-3 transition-colors"
            >
              <div className="flex items-center">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700 bg-white appearance-none cursor-pointer"
                  style={{ backgroundImage: "none" }}
                >
                  <option value="" className="text-gray-500">
                    Select a category
                  </option>
                  {activeCategories && activeCategories.length > 0 ? (
                    activeCategories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        className="text-gray-700 py-2"
                      >
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled className="text-gray-400">
                      No categories available
                    </option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Product Heading (Optional)
              </label>
              <input
                type="text"
                value={productHeading}
                onChange={(e) => setProductHeading(e.target.value)}
                placeholder="Your product heading text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">
                  Product Price (Optional)
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Display:{" "}
                  <span className="font-medium text-gray-700">
                    {formatPrice(productPrice)}
                  </span>
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                  PHP
                </span>
                <input
                  type="text"
                  value={productPrice}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
                />
                {parseFloat(productPrice) === 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 italic">
                    Will display as N/A
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Short Description{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="A brief summary shown on the product page..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-gray-700"
                rows="3"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Product Details{" "}
                <span className="text-gray-400 font-normal">
                  (Optional) — one item per line, displays as bullet list on
                  product page
                </span>
              </label>
              <textarea
                value={descriptionLines}
                onChange={(e) => setDescriptionLines(e.target.value)}
                placeholder={`e.g.\nYour Own Design!\nMain Print - A3 Size Back Print\nSleeve Tag & Hern Tag - 1x2 Inch`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-gray-700"
                rows="6"
              />
              <p className="text-xs text-gray-400 mt-1">
                Press Enter to start a new list item.
              </p>
              {listItems.length > 0 && (
                <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Preview
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {listItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Availability */}
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        <div className="border-b border-gray-200 gap-4 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-lg font-bold">Product Availability</h2>
            <p className="text-xs text-gray-600">
              Select available services and colors for your product.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 sm:px-6">
          {/* Services */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Service Availability
            </label>
            <div className="border border-gray-300 rounded-md">
              <div className="flex items-center ps-4 border-b border-gray-200 pb-2 my-2">
                <input
                  id="service-select-all"
                  type="checkbox"
                  checked={allServicesSelected}
                  onChange={handleSelectAllServices}
                  className="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium"
                />
                <label
                  htmlFor="service-select-all"
                  className="select-none w-full py-2 ms-2 text-xs font-medium text-gray-800"
                >
                  Select All
                </label>
              </div>
              <div className="my-2 max-h-64 overflow-y-auto">
                {activeServices.length > 0 ? (
                  activeServices.map((service) => (
                    <div key={service.id} className="flex items-center ps-4">
                      <input
                        id={`service-checkbox-${service.id}`}
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                        value={service.id}
                        name="service-availability"
                        className="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium"
                      />
                      <label
                        htmlFor={`service-checkbox-${service.id}`}
                        className="select-none w-full py-3 ms-2 text-xs font-medium text-heading"
                      >
                        {service.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-3 px-4">
                    No services available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Color Availability
            </label>
            <div className="border border-gray-300 rounded-lg">
              <div className="flex items-center ps-4 border-b border-gray-200 pb-2 my-2">
                <input
                  id="color-select-all"
                  type="checkbox"
                  checked={allColorsSelected}
                  onChange={handleSelectAllColors}
                  className="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium"
                />
                <label
                  htmlFor="color-select-all"
                  className="select-none w-full py-2 ms-2 text-xs font-medium text-gray-800"
                >
                  Select All
                </label>
              </div>

              <div className="my-2 max-h-[500px] overflow-y-auto">
                {activeColors.length > 0 ? (
                  activeColors.map((color) => {
                    const isChecked = selectedColors.includes(color.id);
                    const colorImg = colorImages[color.id];

                    return (
                      <div
                        key={color.id}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center ps-4 pe-3 py-2.5">
                          <input
                            id={`color-checkbox-${color.id}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleColorChange(color.id)}
                            value={color.id}
                            name="color-availability"
                            className="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium flex-shrink-0"
                          />
                          <label
                            htmlFor={`color-checkbox-${color.id}`}
                            className="select-none flex-1 ms-2 text-xs font-medium text-heading cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {color.hex_code && (
                                <span
                                  className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                  style={{ backgroundColor: color.hex_code }}
                                />
                              )}
                              {color.name}
                            </div>
                          </label>
                        </div>

                        {isChecked && (
                          <div className="px-4 pb-3">
                            {colorImg ? (
                              <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={colorImg.preview || colorImg.url}
                                    alt={`${color.name} product`}
                                    className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveColorImage(color.id)
                                    }
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-700 truncate">
                                    {colorImg.file
                                      ? `${color.name} image uploaded`
                                      : `${color.name} image (saved)`}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      colorImageInputRefs.current[
                                        color.id
                                      ]?.click()
                                    }
                                    className="text-xs text-blue-500 hover:text-blue-600 mt-0.5"
                                  >
                                    Change image
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  colorImageInputRefs.current[color.id]?.click()
                                }
                                className="flex items-center gap-2 w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                              >
                                <ImagePlus className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>
                                  Add image for{" "}
                                  <span className="font-medium text-gray-600">
                                    {color.name}
                                  </span>{" "}
                                  <span className="text-gray-400">
                                    (optional)
                                  </span>
                                </span>
                              </button>
                            )}

                            <input
                              ref={(el) =>
                                (colorImageInputRefs.current[color.id] = el)
                              }
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleColorImageChange(color.id, e)
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-500 py-3 px-4">
                    No colors available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageUploadSection
        onImagesChange={setProductImages}
        onSizeChartChange={setSizeChartImage}
        initialProductImages={productImages}
        initialSizeChart={sizeChartImage}
      />

      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex justify-between items-center text-xs gap-2">
          {draftId && (
            <button
              onClick={handleDeleteDraft}
              className="border border-red-300 bg-white text-red-600 rounded-md px-3 md:px-6 py-3 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center">
                <Trash2 className="w-4 h-4" />
                <span className="hidden md:flex ps-2 font-medium">
                  Delete Draft
                </span>
              </div>
            </button>
          )}
          <div className="flex flex-wrap text-xs gap-3 flex-shrink-0 ml-auto">
            <button
              onClick={() => handleSaveDraft(false)}
              className="bg-white border border-gray-300 text-black rounded-md px-3 md:px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Save className="w-4 h-4" />
                <span className="ps-2 font-medium">Save Draft</span>
              </div>
            </button>
            <button
              onClick={handlePublishDraft}
              className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center">
                <Save className="w-4 h-4" />
                <span className="ps-2">Publish</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftProductForm;
