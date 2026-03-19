import { useState, useEffect, useCallback } from "react";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import api from "../../../../../services/api";

const PLATFORM_OPTIONS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Twitter/X",
  "YouTube",
  "LinkedIn",
  "Pinterest",
  "Threads",
  "Custom",
];

const ContactDetails = () => {
  const [form, setForm] = useState({
    location_text: "",
    map_embed_url: "",
    mobile: "",
    email: "",
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [originalForm, setOriginalForm] = useState(null);
  const [originalSocialLinks, setOriginalSocialLinks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .get("/contact")
      .then((res) => {
        const data = res.data.data || {};
        const formData = {
          location_text: data.location_text || "",
          map_embed_url: data.map_embed_url || "",
          mobile: data.mobile || "",
          email: data.email || "",
        };
        const links = data.social_links || [];
        setForm(formData);
        setSocialLinks(links);
        // ✅ Store originals for comparison
        setOriginalForm(formData);
        setOriginalSocialLinks(links);
      })
      .catch(() =>
        setMessage({ type: "error", text: "Failed to load contact settings" }),
      )
      .finally(() => setLoading(false));
  }, []);

  // ✅ Detect changes by comparing current vs original
  const hasChanges = useCallback(() => {
    if (!originalForm || !originalSocialLinks) return false;
    const formChanged = JSON.stringify(form) !== JSON.stringify(originalForm);
    const linksChanged =
      JSON.stringify(socialLinks) !== JSON.stringify(originalSocialLinks);
    return formChanged || linksChanged;
  }, [form, socialLinks, originalForm, originalSocialLinks]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addSocialLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      { id: `${Date.now()}`, platform: "Facebook", url: "", text: "" },
    ]);
  };

  const updateSocialLink = (id, key, value) => {
    setSocialLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [key]: value } : link)),
    );
  };

  const removeSocialLink = (id) => {
    setSocialLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/contact", { ...form, social_links: socialLinks });
      // ✅ Update originals after successful save so the bar disappears
      setOriginalForm({ ...form });
      setOriginalSocialLinks([...socialLinks]);
      setMessage({
        type: "success",
        text: "Contact settings saved successfully!",
      });
    } catch {
      setMessage({ type: "error", text: "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-200 bg-white rounded-lg p-6 text-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Manage Contact</h2>
            <p className="text-xs text-gray-600">
              Customize your contact details, social links, and map shown on
              your website.
            </p>
          </div>
          <button
            onClick={addSocialLink}
            className="flex items-center gap-2 text-xs bg-black hover:bg-gray-800 text-white rounded-md px-4 py-3 self-end md:self-auto transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Social Link</span>
          </button>
        </div>
      </div>
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-xs font-medium border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-600"
              : "bg-red-50 border-red-200 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}
      {/* Social Links */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Social Links
            </h3>
            <p className="text-xs text-gray-500">
              Add, edit, or remove social media accounts shown on your contact
              page.
            </p>
          </div>
        </div>

        {socialLinks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg mt-4">
            <p className="text-sm text-gray-400">No social links yet.</p>
            <button
              onClick={addSocialLink}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600"
            >
              + Add your first social link
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <div className="hidden md:grid grid-cols-12 gap-3 px-2">
              <div className="col-span-1" />
              <p className="col-span-3 text-xs font-medium text-gray-500 uppercase">
                Platform
              </p>
              <p className="col-span-4 text-xs font-medium text-gray-500 uppercase">
                URL
              </p>
              <p className="col-span-3 text-xs font-medium text-gray-500 uppercase">
                Display Text
              </p>
              <div className="col-span-1" />
            </div>

            {socialLinks.map((link) => (
              <div
                key={link.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 items-center"
              >
                <div className="hidden md:flex col-span-1 justify-center">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">
                    Platform
                  </label>
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateSocialLink(link.id, "platform", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm bg-white"
                  >
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">
                    URL
                  </label>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(link.id, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">
                    Display Text
                  </label>
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) =>
                      updateSocialLink(link.id, "text", e.target.value)
                    }
                    placeholder="@yourhandle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  />
                </div>
                <div className="md:col-span-1 flex justify-end md:justify-center">
                  <button
                    onClick={() => removeSocialLink(link.id)}
                    className="p-1.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Contact Info */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Contact Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="+639876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="text"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="yourmail@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
        </div>
      </div>
      {/* Location & Map */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Location & Map
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location Text
              </label>
              <textarea
                value={form.location_text}
                onChange={(e) => handleChange("location_text", e.target.value)}
                placeholder="e.g. Upper Plaza 16-H A.Mabini St Makati City..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Google Maps Embed URL
              </label>
              <textarea
                value={form.map_embed_url}
                onChange={(e) => handleChange("map_embed_url", e.target.value)}
                placeholder="Paste the src URL from the Google Maps embed code..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                In Google Maps → Share → Embed a map → copy only the{" "}
                <code className="bg-gray-100 px-1 rounded">src="..."</code>{" "}
                value.
              </p>
            </div>
          </div>
          {form.map_embed_url && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">
                Map Preview
              </p>
              <iframe
                title="map preview"
                src={form.map_embed_url}
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      {/*  Sticky save bar — only visible when changes are detected */}
      {hasChanges() && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-lg px-4 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-500">You have unsaved changes.</p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black hover:bg-gray-800 text-white text-xs rounded-md px-4 py-3 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetails;
