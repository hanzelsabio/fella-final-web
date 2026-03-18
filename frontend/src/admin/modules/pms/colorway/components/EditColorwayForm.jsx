import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useColorways } from "../context/ColorwayContext";
import { Save, ArrowLeft } from "lucide-react";

const EditColorwayForm = () => {
  const { id } = useParams();
  const { colors, refreshData } = useColorways();
  const navigate = useNavigate();

  const [colorName, setColorName] = useState("");
  const [colorSlug, setColorSlug] = useState("");
  const [hexCode, setHexCode] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  // Load color data
  useEffect(() => {
    const color = colors.find((c) => c.id === parseInt(id));
    if (color) {
      setColorName(color.name || "");
      setColorSlug(color.slug || "");
      setHexCode(color.hex_code || "");
      setStatus(color.status || "active");
      setLoading(false);
    } else {
      // Fetch from API if not in context
      fetchColor();
    }
  }, [id, colors]);

  const fetchColor = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/colors/${id}`);
      const data = await response.json();

      if (data.success && data.data) {
        const color = data.data;
        setColorName(color.name || "");
        setColorSlug(color.slug || "");
        setHexCode(color.hex_code || "");
        setStatus(color.status || "active");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching colorway:", error);
      setLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setColorName(name);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setColorSlug(slug);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!colorName.trim()) {
      alert("Please enter a color name");
      return;
    }

    if (!colorSlug.trim()) {
      alert("Please enter a color slug");
      return;
    }

    if (!hexCode.trim()) {
      alert("Please enter a hex code");
      return;
    }

    // Validate hex code format
    const hexPattern = /^#?([0-9A-F]{3}){1,2}$/i;
    let formattedHex = hexCode.trim();

    // Add # if not present
    if (!formattedHex.startsWith("#")) {
      formattedHex = "#" + formattedHex;
    }

    if (!hexPattern.test(formattedHex)) {
      alert("Please enter a valid hex code (e.g., #FF5733 or FF5733)");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/colors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: colorName,
          slug: colorSlug,
          hex_code: formattedHex,
          status: status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Colorway updated successfully!");
        await refreshData();
        navigate(`${basePath}/colorways`);
      } else {
        alert("Failed to update colorway: " + data.message);
      }
    } catch (error) {
      console.error("Error updating colorway:", error);
      alert("Failed to update colorway");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading colorway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <form onSubmit={handleSubmit}>
        <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
          <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
            <div className="flex-1 pb-5 px-4 sm:px-6">
              <h2 className="text-lg font-bold">Edit Colorway</h2>
              <p className="text-xs text-gray-600">
                Update colorway information
              </p>
            </div>
            <div className="flex flex-wrap text-xs gap-2 flex-shrink-0 px-4 sm:px-6">
              <Link
                to={`${basePath}/colorways`}
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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Color Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={colorName}
                  onChange={handleNameChange}
                  placeholder="Enter color name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Color Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={colorSlug}
                  onChange={(e) => setColorSlug(e.target.value)}
                  placeholder="color-slug"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  HEX Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                      #
                    </span>
                    <input
                      type="text"
                      value={hexCode.replace("#", "")}
                      onChange={(e) =>
                        setHexCode(e.target.value.replace("#", ""))
                      }
                      placeholder="FF5733"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700"
                      required
                    />
                  </div>
                  {hexCode && (
                    <div
                      className="w-10 h-10 border border-gray-300 rounded-md"
                      style={{
                        backgroundColor: hexCode.startsWith("#")
                          ? hexCode
                          : `#${hexCode}`,
                      }}
                      title="Color preview"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-sm text-gray-700 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
          <div className="flex justify-end items-end text-xs gap-2">
            <div className="flex flex-wrap text-xs gap-3 flex-shrink-0">
              <Link
                to={`${basePath}/colorways`}
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
                  <span className="ps-2">Update Colorway</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditColorwayForm;
