import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSystemUser } from "../context/SystemUserContext";
import { uploadAPI, getImageUrl } from "../../../../../services/api";
import { Save, ArrowLeft, ImagePlus, X } from "lucide-react";

const ROLE_OPTIONS = ["staff", "manager", "admin"];

const EditUserForm = () => {
  const { id } = useParams();
  const { updateUser } = useSystemUser();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [role, setRole] = useState("staff");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/system-users/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          const u = data.data;
          setFirstName(u.first_name || "");
          setLastName(u.last_name || "");
          setUsername(u.username || "");
          setEmail(u.email || "");
          setContactNo(u.contact_no || "");
          setBirthdate(u.birthdate ? u.birthdate.split("T")[0] : "");
          setHomeAddress(u.home_address || "");
          setRole(u.role || "staff");
          if (u.image)
            setImage({
              preview: getImageUrl(u.image),
              url: u.image,
              file: null,
            });
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setImage({ file, preview: reader.result, url: null });
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
      const res = await uploadAPI.uploadImage(imgData.file, "system-users");
      return res.data?.data?.url || null;
    } catch {
      return null;
    }
  };

  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter first and last name");
      return;
    }
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image);
      if (image.file && !imageUrl) {
        alert("Image upload failed.");
        return;
      }
    }

    const result = await updateUser(id, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim(),
      email: email.trim() || null,
      contact_no: contactNo.trim() || null,
      birthdate: birthdate || null,
      home_address: homeAddress.trim() || null,
      role,
      image: imageUrl,
    });

    if (result.success) {
      alert("User updated successfully!");
      navigate("/admin/system-users");
    } else alert("Failed to update user: " + result.message);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading user...</p>
        </div>
      </div>
    );

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-md font-bold">Edit System User</h2>
            <p className="text-xs text-gray-600">Update the user's details</p>
          </div>
          <div className="flex flex-wrap text-xs gap-2 flex-shrink-0 px-4 sm:px-6">
            <Link
              to="/admin/system-users"
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Profile Image{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            {image ? (
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-full border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
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
                className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <ImagePlus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Click to upload a profile image</span>
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

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Birthdate{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Contact No.{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  placeholder="e.g. 09171234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Home Address{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="Enter home address..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. juan.delacruz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Email{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700 bg-white"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6">
        <div className="flex justify-end text-xs">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span className="font-medium">Update User</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;
