import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, AlertCircle } from "lucide-react";

import {
  SectionTitle,
  PageSubtitle,
} from "../../../../shared/components/ui/Typography";

import {
  DropZone,
  UploadError,
  ImageThumb,
  UploadGuidelines,
  UploadSectionHeader,
} from "../../../../shared/components/ui/UploadPrimitives";

const MAX_PRODUCT_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const GUIDELINES = [
  `Product images: Maximum ${MAX_PRODUCT_IMAGES} images`,
  "Size chart: Only 1 image allowed",
  "Use high-quality images with good lighting",
  "Recommended dimensions: 800x800px or larger",
  "File formats: JPG, PNG, SVG, or GIF",
  "Maximum file size: 5MB per image",
];

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

  // Refs to prevent infinite loops and skip-on-mount notifications
  const isInitialMount = useRef(true);
  const prevProductImages = useRef(initialProductImages);
  const prevSizeChart = useRef(initialSizeChart);

  useEffect(() => {
    if (isInitialMount.current) {
      if (initialProductImages?.length > 0)
        setProductImages(initialProductImages);
      if (initialSizeChart) setSizeChart(initialSizeChart);
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    if (
      !isInitialMount.current &&
      onImagesChange &&
      prevProductImages.current !== productImages
    ) {
      onImagesChange(productImages);
      prevProductImages.current = productImages;
    }
  }, [productImages, onImagesChange]);

  useEffect(() => {
    if (
      !isInitialMount.current &&
      onSizeChartChange &&
      prevSizeChart.current !== sizeChart
    ) {
      onSizeChartChange(sizeChart);
      prevSizeChart.current = sizeChart;
    }
  }, [sizeChart, onSizeChartChange]);

  // ── Validation helper ───────────────────────────────────────────────────────
  const validateFile = (file, type) => {
    if (!file.type.startsWith("image/")) {
      setError((prev) => ({
        ...prev,
        [type]: `${file.name} is not a valid image file`,
      }));
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError((prev) => ({
        ...prev,
        [type]: `${file.name} exceeds 5MB limit`,
      }));
      return false;
    }
    return true;
  };

  // ── Upload handler ──────────────────────────────────────────────────────────
  const handleImageUpload = (files, type) => {
    if (!files || files.length === 0) return;
    setError((prev) => ({ ...prev, [type]: "" }));

    if (type === "product") {
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
          product: `You can only add ${remainingSlots} more image${remainingSlots > 1 ? "s" : ""}. (Max: ${MAX_PRODUCT_IMAGES} images)`,
        }));
        return;
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newImages = [];
      let processedCount = 0;

      filesToProcess.forEach((file, index) => {
        if (!validateFile(file, "product")) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            file,
            preview: reader.result,
            id: Date.now() + index,
          });
          processedCount++;
          if (processedCount === filesToProcess.length)
            setProductImages((prev) => [...prev, ...newImages]);
        };
        reader.readAsDataURL(file);
      });
    } else {
      if (sizeChart) {
        setError((prev) => ({
          ...prev,
          sizeChart:
            "Only 1 size chart image is allowed. Please remove the existing one first.",
        }));
        return;
      }
      const file = files[0];
      if (!validateFile(file, "sizeChart")) return;
      const reader = new FileReader();
      reader.onloadend = () => setSizeChart({ file, preview: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({
      ...prev,
      [type]: e.type === "dragenter" || e.type === "dragover",
    }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));
    if (e.dataTransfer.files?.[0])
      handleImageUpload(e.dataTransfer.files, type);
  };

  const removeImage = (type, imageId = null) => {
    setError((prev) => ({ ...prev, [type]: "" }));
    if (type === "product")
      setProductImages((prev) => prev.filter((img) => img.id !== imageId));
    else setSizeChart(null);
  };

  const remainingSlots = MAX_PRODUCT_IMAGES - productImages.length;

  return (
    <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
      {/* Header */}
      <div className="border-b border-gray-200 mb-5 pb-5 px-4 sm:px-6">
        <SectionTitle className="text-lg font-bold">Image Uploads</SectionTitle>
        <PageSubtitle>
          Upload product images and size chart for better customer experience
        </PageSubtitle>
      </div>

      <div className="px-4 sm:px-6 space-y-6">
        {/* ── Product Images ─────────────────────────────────────────────────── */}
        <div>
          <UploadSectionHeader
            title="Product Images"
            badge={`Required • ${productImages.length}/${MAX_PRODUCT_IMAGES} uploaded`}
          />
          <UploadError message={error.product} />

          {productImages.length < MAX_PRODUCT_IMAGES && (
            <DropZone
              inputId="product-image"
              active={dragActive.product}
              multiple
              onDragEnter={(e) => handleDrag(e, "product")}
              onDragLeave={(e) => handleDrag(e, "product")}
              onDragOver={(e) => handleDrag(e, "product")}
              onDrop={(e) => handleDrop(e, "product")}
              onChange={(e) => handleImageUpload(e.target.files, "product")}
              hint={`${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} remaining`}
              hintColor="text-blue-600"
            />
          )}

          {productImages.length === MAX_PRODUCT_IMAGES && (
            <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">
                Maximum limit reached ({MAX_PRODUCT_IMAGES} images). Remove some
                to add more.
              </p>
            </div>
          )}

          {productImages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {productImages.map((image) => (
                <ImageThumb
                  key={image.id}
                  src={image.preview}
                  alt="Product preview"
                  onRemove={() => removeImage("product", image.id)}
                  size="w-full aspect-square"
                  fileName={image.file?.name || "Image"}
                  fileSize={
                    image.file?.size
                      ? `${(image.file.size / 1024).toFixed(1)} KB`
                      : ""
                  }
                  iconSize="sm"
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Size Chart ─────────────────────────────────────────────────────── */}
        <div>
          <UploadSectionHeader
            title="Size Chart"
            badge={`Optional • ${sizeChart ? "1/1" : "0/1"} uploaded`}
          />
          <UploadError message={error.sizeChart} />

          {!sizeChart && (
            <DropZone
              inputId="size-chart"
              active={dragActive.sizeChart}
              onDragEnter={(e) => handleDrag(e, "sizeChart")}
              onDragLeave={(e) => handleDrag(e, "sizeChart")}
              onDragOver={(e) => handleDrag(e, "sizeChart")}
              onDrop={(e) => handleDrop(e, "sizeChart")}
              onChange={(e) => handleImageUpload(e.target.files, "sizeChart")}
              icon={ImageIcon}
              hint="Only 1 image allowed"
            />
          )}

          {sizeChart && (
            <div className="mt-4 inline-block">
              <ImageThumb
                src={sizeChart.preview}
                alt="Size chart preview"
                onRemove={() => removeImage("sizeChart")}
                size="w-30 h-30"
                fileName={sizeChart.file?.name || "Size Chart"}
                fileSize={
                  sizeChart.file?.size
                    ? `${(sizeChart.file.size / 1024).toFixed(2)} KB`
                    : ""
                }
              />
            </div>
          )}
        </div>

        <UploadGuidelines items={GUIDELINES} />
      </div>
    </div>
  );
};

export default ImageUploadSection;
