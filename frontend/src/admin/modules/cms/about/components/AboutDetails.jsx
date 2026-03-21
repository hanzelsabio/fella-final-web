import { useState, useEffect, useRef } from "react";
import { Save, ImagePlus, X } from "lucide-react";
import { uploadAPI, getImageUrl } from "../../../../../services";
import api from "../../../../../services/api";

import TableHeader from "../../../../components/common/Table/TableHeader";
import Card from "../../../../../shared/components/ui/Card";
import {
  FormField,
  Input,
  Textarea,
} from "../../../../../shared/components/ui/Inputs";
import {
  BtnPrimary,
  BtnGhost,
} from "../../../../../shared/components/ui/Buttons";
import { Text } from "../../../../../shared/components/ui/Typography";

const AboutDetails = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const imageInputRef = useRef(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage({ file, preview: reader.result });
    reader.readAsDataURL(file);
  };

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
    } catch {
      setMessage({ type: "error", text: "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-6">
        <Card>
          <Text>Loading...</Text>
        </Card>
      </div>
    );
  }

  const previewSrc = image?.preview || getImageUrl(existingImage);

  return (
    <div className="pb-6">
      <TableHeader
        title="Manage About"
        subtitle="Edit the content displayed on the About section of your website."
      />

      <Card variant="section">
        {message && (
          <p
            className={`text-xs font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {message.text}
          </p>
        )}

        <FormField label="Background Image" optional>
          {previewSrc ? (
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={previewSrc}
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
              <BtnGhost onClick={() => imageInputRef.current?.click()}>
                Change image
              </BtnGhost>
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
        </FormField>

        <FormField label="Heading" required>
          <Input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. Quality Prints. Crafted With Purpose."
          />
        </FormField>

        <FormField label="Subheading" optional>
          <Textarea
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            placeholder="e.g. We specialize in custom clothing printing..."
            rows={2}
          />
        </FormField>

        <FormField label="Body Text" optional>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. Fella Screen Prints is a service that..."
            rows={5}
          />
        </FormField>

        <FormField label="Preview">
          <div
            className="relative rounded-lg overflow-hidden min-h-[160px] flex items-center justify-center"
            style={{
              backgroundImage: previewSrc ? `url(${previewSrc})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: !previewSrc ? "#111" : undefined,
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
        </FormField>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-lg px-4 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <Text>Save your changes to update the About section.</Text>
          <BtnPrimary onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
};

export default AboutDetails;
