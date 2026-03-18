import { useState } from "react";
import { X, Upload, AlertCircle } from "lucide-react";

const SingleImageUpload = ({
  onImageChange,
  initialImage = null,
  label = "Image",
  required = false,
  folder = "general", // services, categories, products
}) => {
  const [image, setImage] = useState(initialImage);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const uploadToServer = async (base64Image) => {
    try {
      setUploading(true);
      const response = await fetch("http://localhost:5000/api/upload/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          folder: folder,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setError("");

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        // Upload to server
        const imageUrl = await uploadToServer(reader.result);

        // Set the uploaded image URL
        const newImage = {
          file,
          preview: `http://localhost:5000${imageUrl}`,
          url: imageUrl,
        };

        setImage(newImage);

        if (onImageChange) {
          onImageChange(imageUrl); // Send the server URL, not base64
        }
      } catch (error) {
        setError("Failed to upload image: " + error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = async () => {
    setError("");

    // Delete from server if it's a server URL
    if (image?.url) {
      try {
        await fetch("http://localhost:5000/api/upload/image", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: image.url,
          }),
        });
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    setImage(null);

    if (onImageChange) {
      onImageChange(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </h3>
        <span className="text-xs text-gray-500">
          {image ? "1/1 uploaded" : "0/1 uploaded"}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Zone */}
      {!image && !uploading && (
        <label
          htmlFor="single-image-upload"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`shadow-sm group block cursor-pointer rounded-lg border-2 border-dashed transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <div className="flex justify-center py-10">
            <div className="flex max-w-[280px] flex-col items-center gap-3">
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-2 transition ${
                  dragActive
                    ? "border-blue-500 text-blue-500 bg-blue-100"
                    : "border-gray-300 text-gray-600 group-hover:border-blue-500 group-hover:text-blue-500"
                }`}
              >
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {dragActive
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
            id="single-image-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
        </label>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="flex justify-center items-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Uploading image...</p>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {image && !uploading && (
        <div className="mt-4">
          <div className="inline-block">
            <div className="relative group">
              <div className="w-40 h-40 rounded-lg border-2 border-gray-200 overflow-hidden bg-white">
                <img
                  src={
                    image.preview
                      ? image.preview
                      : image.startsWith("http")
                      ? image
                      : image.startsWith("data:image")
                      ? image
                      : `http://localhost:5000${image}`
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image load error:", e);
                    e.target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160"%3E%3Crect width="160" height="160" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="16" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
              {image.file && (
                <>
                  <div className="mt-1 text-xs text-gray-600 max-w-[160px] truncate">
                    {image.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(image.file.size / 1024).toFixed(2)} KB
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <h4 className="text-xs font-semibold text-blue-900 mb-1">
          📸 Image Guidelines
        </h4>
        <ul className="text-xs text-blue-800 space-y-0.5">
          <li>• Only 1 image allowed</li>
          <li>• Recommended size: 800x800px or larger</li>
          <li>• Formats: JPG, PNG, SVG, or GIF</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>
    </div>
  );
};

export default SingleImageUpload;
