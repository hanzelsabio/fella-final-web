import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useSystemUser } from "../context/SystemUserContext";
import { uploadAPI } from "../../../../../services";
import { Save, ArrowLeft, ImagePlus, X } from "lucide-react";

const ROLE_OPTIONS = ["staff", "manager", "admin"];

const CreateUserForm = () => {
  const { addUser } = useSystemUser();
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const imageInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage({ file, preview: reader.result });
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const uploadImage = async (imgData) => {
    if (!imgData?.file) return null;
    try {
      const res = await uploadAPI.uploadImage(imgData.file, "system-users");
      return res.data?.data?.url || null;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter first and last name");
      return;
    }
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    let imageUrl = null;
    if (image?.file) {
      imageUrl = await uploadImage(image);
      if (!imageUrl) {
        alert("Image upload failed. Please try again.");
        return;
      }
    }

    if (!password.trim()) {
      alert("Please enter a password");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const result = await addUser({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim(),
      email: email.trim() || null,
      contact_no: contactNo.trim() || null,
      birthdate: birthdate || null,
      home_address: homeAddress.trim() || null,
      role,
      image: imageUrl,
      password: password.trim(),
    });

    if (result.success) {
      alert("User added successfully!");
      navigate("/admin/system-users");
    } else {
      alert("Failed to add user: " + result.message);
    }
  };

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-md font-bold">Add New System User</h2>
            <p className="text-xs text-gray-600">
              Fill in the details to create a new system user
            </p>
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
                    Image selected
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

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6">
        <div className="flex justify-end text-xs">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span className="font-medium">Save User</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
