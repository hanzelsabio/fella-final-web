import { useState, useEffect, useCallback } from "react";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import api from "../../../../../services/api";

import TableHeader from "../../../../components/common/Table/TableHeader";
import Card from "../../../../../shared/components/ui/Card";
import { Input, Textarea } from "../../../../../shared/components/ui/Inputs";
import { BtnPrimary } from "../../../../../shared/components/ui/Buttons";
import {
  SectionTitle,
  Text,
  TextMuted,
  Label,
} from "../../../../../shared/components/ui/Typography";

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
        setOriginalForm(formData);
        setOriginalSocialLinks(links);
      })
      .catch(() =>
        setMessage({ type: "error", text: "Failed to load contact settings" }),
      )
      .finally(() => setLoading(false));
  }, []);

  const hasChanges = useCallback(() => {
    if (!originalForm || !originalSocialLinks) return false;
    return (
      JSON.stringify(form) !== JSON.stringify(originalForm) ||
      JSON.stringify(socialLinks) !== JSON.stringify(originalSocialLinks)
    );
  }, [form, socialLinks, originalForm, originalSocialLinks]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const addSocialLink = () =>
    setSocialLinks((prev) => [
      ...prev,
      { id: `${Date.now()}`, platform: "Facebook", url: "", text: "" },
    ]);
  const updateSocialLink = (id, key, value) =>
    setSocialLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)),
    );
  const removeSocialLink = (id) =>
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/contact", { ...form, social_links: socialLinks });
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
      <div className="pb-6">
        <Card>
          <Text>Loading...</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <TableHeader
        title="Manage Contact"
        subtitle="Customize your contact details, social links, and map shown on your website."
        actions={[
          {
            label: "New Social Link",
            onClick: addSocialLink,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-xs font-medium border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-500"}`}
        >
          {message.text}
        </div>
      )}

      {/* Social Links */}
      <Card>
        <SectionTitle>Social Links</SectionTitle>
        <TextMuted className="mt-1 mb-4">
          Add, edit, or remove social media accounts shown on your contact page.
        </TextMuted>

        {socialLinks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Text>No social links yet.</Text>
            <button
              onClick={addSocialLink}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600"
            >
              + Add your first social link
            </button>
          </div>
        ) : (
          <div className="space-y-3">
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
                  <Label className="md:hidden">Platform</Label>
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
                  <Label className="md:hidden">URL</Label>
                  <Input
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(link.id, "url", e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-3">
                  <Label className="md:hidden">Display Text</Label>
                  <Input
                    value={link.text}
                    onChange={(e) =>
                      updateSocialLink(link.id, "text", e.target.value)
                    }
                    placeholder="@yourhandle"
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
      </Card>

      {/* Contact Info */}
      <Card>
        <SectionTitle className="mb-4">Contact Info</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Mobile Number</Label>
            <Input
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="+639876543210"
            />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="yourmail@gmail.com"
            />
          </div>
        </div>
      </Card>

      {/* Location & Map */}
      <Card>
        <SectionTitle className="mb-4">Location & Map</SectionTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Location Text</Label>
              <Textarea
                value={form.location_text}
                onChange={(e) => handleChange("location_text", e.target.value)}
                placeholder="e.g. Upper Plaza 16-H A.Mabini St Makati City..."
                rows={2}
              />
            </div>
            <div>
              <Label>Google Maps Embed URL</Label>
              <Textarea
                value={form.map_embed_url}
                onChange={(e) => handleChange("map_embed_url", e.target.value)}
                placeholder="Paste the src URL from the Google Maps embed code..."
                rows={2}
              />
              <TextMuted className="mt-1">
                In Google Maps → Share → Embed a map → copy only the{" "}
                <code className="bg-gray-100 px-1 rounded">src="..."</code>{" "}
                value.
              </TextMuted>
            </div>
          </div>
          {form.map_embed_url && (
            <div>
              <Label>Map Preview</Label>
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
      </Card>

      {/* Sticky save bar */}
      {hasChanges() && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-lg px-4 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <Text>You have unsaved changes.</Text>
            <BtnPrimary onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </BtnPrimary>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetails;
