import { useState, useEffect, useRef } from "react";
import { Save, ImagePlus, X } from "lucide-react";
import { uploadAPI, getImageUrl } from "../../../../../services";
import api from "../../../../../services/api";
import Breadcrumb from "../../../../components/common/Breadcrumb";

const AboutDetails = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null); // { file, preview } or null
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const imageInputRef = useRef(null);

  // ── Fetch current about data ────────────────────────────────────
  useEffect(() => {
    api
      .get("/about")
      .then((res) => {
        const data = res.data.data;
        setHeading(data.heading || "");
        setSubheading(data.subheading || "");
        setBody(data.body || "");
        setExistingImage(data.image || null);
      })
      .catch(() =>
        setMessage({ type: "error", text: "Failed to load about content" }),
      )
      .finally(() => setLoading(false));
  }, []);

  // ── Image handler ───────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage({ file, preview: reader.result });
    reader.readAsDataURL(file);
  };

  // ── Save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!heading.trim())
      return setMessage({ type: "error", text: "Heading is required" });
    setSaving(true);
    setMessage(null);
    try {
      let imageUrl = existingImage;
      if (image?.file) {
        const res = await uploadAPI.uploadImage(image.file, "about");
        imageUrl = res.data?.data?.url || imageUrl;
      }

      await api.put("/about", {
        heading: heading.trim(),
        subheading: subheading.trim() || null,
        body: body.trim() || null,
        image: imageUrl,
      });

      setExistingImage(imageUrl);
      setImage(null);
      setMessage({ type: "success", text: "About page updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-6">
        <div className="border border-gray-200 bg-white rounded-lg p-6 text-center text-sm text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage About</h2>
            <p className="text-xs text-gray-600">
              Edit the content displayed on the About section of your website.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors flex items-center gap-2 self-end sm:self-auto disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 space-y-6">
        {message && (
          <p
            className={`text-xs font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {message.text}
          </p>
        )}

        {/* Image */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Background Image{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          {image?.preview || existingImage ? (
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={image?.preview || getImageUrl(existingImage)}
                  alt="About"
                  className="w-32 h-20 object-cover rounded border border-gray-200"
                />
                {image && (
                  <button
                    onClick={() => setImage(null)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                Change image
              </button>
            </div>
          ) : (
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <ImagePlus className="w-4 h-4 text-gray-400" />
              <span>Upload background image</span>
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

        {/* Heading */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Heading <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. Quality Prints. Crafted With Purpose."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
          />
        </div>

        {/* Subheading */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Subheading{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            placeholder="e.g. We specialize in custom clothing printing..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Body Text{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. Fella Screen Prints is a service that..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
          />
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div
            className="relative rounded-lg overflow-hidden min-h-[160px] flex items-center justify-center"
            style={{
              backgroundImage:
                image?.preview || existingImage
                  ? `url(${image?.preview || getImageUrl(existingImage)})`
                  : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor:
                !image?.preview && !existingImage ? "#111" : undefined,
            }}
          >
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative z-10 text-white text-center px-6 py-8">
              {heading && <h2 className="text-lg font-bold mb-2">{heading}</h2>}
              {subheading && (
                <p className="text-xs text-gray-300 mb-3">{subheading}</p>
              )}
              {body && (
                <p className="text-xs text-gray-400 max-w-md mx-auto">{body}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDetails;
