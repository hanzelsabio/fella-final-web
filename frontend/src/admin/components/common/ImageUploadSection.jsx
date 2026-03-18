import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";

const ImageUploadSection = ({
  onImagesChange,
  onSizeChartChange,
  initialProductImages = [],
  initialSizeChart = null,
}) => {
  const [productImages, setProductImages] = useState(initialProductImages);
  const [sizeChart, setSizeChart] = useState(initialSizeChart);
  const [dragActive, setDragActive] = useState({
    product: false,
    sizeChart: false,
  });
  const [error, setError] = useState({ product: "", sizeChart: "" });

  // Use ref to prevent infinite loops
  const isInitialMount = useRef(true);
  const prevProductImages = useRef(initialProductImages);
  const prevSizeChart = useRef(initialSizeChart);

  const MAX_PRODUCT_IMAGES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Load initial data only once
  useEffect(() => {
    if (isInitialMount.current) {
      if (initialProductImages && initialProductImages.length > 0) {
        setProductImages(initialProductImages);
      }
      if (initialSizeChart) {
        setSizeChart(initialSizeChart);
      }
      isInitialMount.current = false;
    }
  }, []);

  // Notify parent only when images actually change (not on initial load)
  useEffect(() => {
    if (!isInitialMount.current && onImagesChange) {
      // Only call if the reference has actually changed
      if (prevProductImages.current !== productImages) {
        onImagesChange(productImages);
        prevProductImages.current = productImages;
      }
    }
  }, [productImages, onImagesChange]);

  // Notify parent only when size chart actually changes (not on initial load)
  useEffect(() => {
    if (!isInitialMount.current && onSizeChartChange) {
      // Only call if the reference has actually changed
      if (prevSizeChart.current !== sizeChart) {
        onSizeChartChange(sizeChart);
        prevSizeChart.current = sizeChart;
      }
    }
  }, [sizeChart, onSizeChartChange]);

  const handleImageUpload = (files, type) => {
    if (!files || files.length === 0) return;

    // Clear previous errors
    setError((prev) => ({ ...prev, [type]: "" }));

    if (type === "product") {
      // Check if adding these files would exceed the limit
      const remainingSlots = MAX_PRODUCT_IMAGES - productImages.length;

      if (remainingSlots === 0) {
        setError((prev) => ({
          ...prev,
          product: `Maximum ${MAX_PRODUCT_IMAGES} images allowed. Please remove some images first.`,
        }));
        return;
      }

      if (files.length > remainingSlots) {
        setError((prev) => ({
          ...prev,
          product: `You can only add ${remainingSlots} more image${
            remainingSlots > 1 ? "s" : ""
          }. (Max: ${MAX_PRODUCT_IMAGES} images)`,
        }));
        return;
      }

      // Process multiple files
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newImages = [];
      let processedCount = 0;

      filesToProcess.forEach((file, index) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError((prev) => ({
            ...prev,
            product: `${file.name} is not a valid image file`,
          }));
          return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          setError((prev) => ({
            ...prev,
            product: `${file.name} exceeds 5MB limit`,
          }));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage = {
            file,
            preview: reader.result,
            id: Date.now() + index,
          };

          newImages.push(newImage);
          processedCount++;

          // Update state only when all files are processed
          if (processedCount === filesToProcess.length) {
            setProductImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      // Size chart - only 1 image allowed
      if (sizeChart) {
        setError((prev) => ({
          ...prev,
          sizeChart:
            "Only 1 size chart image is allowed. Please remove the existing one first.",
        }));
        return;
      }

      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError((prev) => ({
          ...prev,
          sizeChart: "Please upload a valid image file",
        }));
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError((prev) => ({
          ...prev,
          sizeChart: "File size must be less than 5MB",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newSizeChart = { file, preview: reader.result };
        setSizeChart(newSizeChart);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files, type);
    }
  };

  const removeImage = (type, imageId = null) => {
    setError((prev) => ({ ...prev, [type]: "" }));

    if (type === "product") {
      setProductImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      setSizeChart(null);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
      {/* Header */}
      <div className="border-b border-gray-200 mb-5">
        <div className="flex-1 pb-5 px-4 sm:px-6">
          <h2 className="text-lg font-bold">Image Uploads</h2>
          <p className="text-xs text-gray-600">
            Upload product images and size chart for better customer experience
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6">
        {/* Product Images Upload (Multiple - Max 10) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Product Images
            </h3>
            <span className="text-xs text-gray-500">
              Required • {productImages.length}/{MAX_PRODUCT_IMAGES} uploaded
            </span>
          </div>

          {/* Error Message for Product Images */}
          {error.product && (
            <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error.product}</p>
            </div>
          )}

          {/* Upload Zone - Only show if under limit */}
          {productImages.length < MAX_PRODUCT_IMAGES && (
            <label
              htmlFor="product-image"
              onDragEnter={(e) => handleDrag(e, "product")}
              onDragLeave={(e) => handleDrag(e, "product")}
              onDragOver={(e) => handleDrag(e, "product")}
              onDrop={(e) => handleDrop(e, "product")}
              className={`shadow-sm group block cursor-pointer rounded-lg border-2 border-dashed transition-all ${
                dragActive.product
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <div className="flex justify-center py-10">
                <div className="flex max-w-[280px] flex-col items-center gap-3">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-2 transition ${
                      dragActive.product
                        ? "border-blue-500 text-blue-500 bg-blue-100"
                        : "border-gray-300 text-gray-600 group-hover:border-blue-500 group-hover:text-blue-500"
                    }`}
                  >
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {dragActive.product
                        ? "Drop images here"
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF (max. 5MB each)
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {MAX_PRODUCT_IMAGES - productImages.length} slot
                      {MAX_PRODUCT_IMAGES - productImages.length !== 1
                        ? "s"
                        : ""}{" "}
                      remaining
                    </p>
                  </div>
                </div>
              </div>
              <input
                type="file"
                id="product-image"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files, "product")}
              />
            </label>
          )}

          {/* Max limit reached message */}
          {productImages.length === MAX_PRODUCT_IMAGES && (
            <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">
                Maximum limit reached ({MAX_PRODUCT_IMAGES} images). Remove some
                to add more.
              </p>
            </div>
          )}

          {/* Uploaded Images Grid - Below Upload Zone */}
          {productImages.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {productImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="w-full aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-white">
                      <img
                        src={image.preview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Remove button - appears on hover */}
                    <button
                      type="button"
                      onClick={() => removeImage("product", image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="mt-1 text-xs text-gray-600 truncate">
                      {image.file?.name || "Image"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {image.file?.size
                        ? (image.file.size / 1024).toFixed(1) + " KB"
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Size Chart Upload (Single Image) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Size Chart</h3>
            <span className="text-xs text-gray-500">
              Optional • {sizeChart ? "1/1 uploaded" : "0/1 uploaded"}
            </span>
          </div>

          {/* Error Message for Size Chart */}
          {error.sizeChart && (
            <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error.sizeChart}</p>
            </div>
          )}

          {/* Upload Zone */}
          {!sizeChart && (
            <label
              htmlFor="size-chart"
              onDragEnter={(e) => handleDrag(e, "sizeChart")}
              onDragLeave={(e) => handleDrag(e, "sizeChart")}
              onDragOver={(e) => handleDrag(e, "sizeChart")}
              onDrop={(e) => handleDrop(e, "sizeChart")}
              className={`shadow-sm group block cursor-pointer rounded-lg border-2 border-dashed transition-all ${
                dragActive.sizeChart
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <div className="flex justify-center py-10">
                <div className="flex max-w-[280px] flex-col items-center gap-3">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-2 transition ${
                      dragActive.sizeChart
                        ? "border-blue-500 text-blue-500 bg-blue-100"
                        : "border-gray-300 text-gray-600 group-hover:border-blue-500 group-hover:text-blue-500"
                    }`}
                  >
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {dragActive.sizeChart
                        ? "Drop image here"
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF (max. 5MB)
                    </p>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                      Only 1 image allowed
                    </p>
                  </div>
                </div>
              </div>
              <input
                type="file"
                id="size-chart"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files, "sizeChart")}
              />
            </label>
          )}

          {/* Uploaded Size Chart - Below Upload Zone */}
          {sizeChart && (
            <div className="mt-4">
              <div className="inline-block">
                <div className="relative group">
                  <div className="w-30 h-30 rounded-lg border-2 border-gray-200 overflow-hidden bg-white">
                    <img
                      src={sizeChart.preview}
                      alt="Size chart preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Remove button - appears on hover */}
                  <button
                    type="button"
                    onClick={() => removeImage("sizeChart")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-1 text-xs text-gray-600 max-w-[120px] truncate">
                    {sizeChart.file?.name || "Size Chart"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {sizeChart.file?.size
                      ? (sizeChart.file.size / 1024).toFixed(2) + " KB"
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-blue-900 mb-2">
            Image Upload Guidelines
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Product images: Maximum {MAX_PRODUCT_IMAGES} images</li>
            <li>• Size chart: Only 1 image allowed</li>
            <li>• Use high-quality images with good lighting</li>
            <li>• Recommended dimensions: 800x800px or larger</li>
            <li>• File formats: JPG, PNG, SVG, or GIF</li>
            <li>• Maximum file size: 5MB per image</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadSection;
