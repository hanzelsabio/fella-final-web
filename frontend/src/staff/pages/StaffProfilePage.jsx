import { useState, useRef } from "react";
import { useAuth } from "../../modules/auth/context/AuthContext";
import { uploadAPI, getImageUrl } from "../../services/api";
import { Save, ImagePlus, X, Lock } from "lucide-react";
import Breadcrumb from "../../admin/components/common/Breadcrumb";

const StaffProfilePage = () => {
  const { staff, setStaff } = useAuth();

  const [firstName, setFirstName] = useState(staff?.first_name || "");
  const [lastName, setLastName] = useState(staff?.last_name || "");
  const [username, setUsername] = useState(staff?.username || "");
  const [email, setEmail] = useState(staff?.email || "");
  const [contactNo, setContactNo] = useState(staff?.contact_no || "");
  const [homeAddress, setHomeAddress] = useState(staff?.home_address || "");
  const [birthdate, setBirthdate] = useState(
    staff?.birthdate?.split("T")[0] || "",
  );
  const [image, setImage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [message, setMessage] = useState(null);
  const [pwMessage, setPwMessage] = useState(null);

  const imageInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage({ file, preview: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      let imageUrl = staff?.image || null;

      if (image?.file) {
        const res = await uploadAPI.uploadImage(image.file, "system-users");
        imageUrl = res.data?.data?.url || null;
      }

      const token = localStorage.getItem("staff_token");
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          contact_no: contactNo,
          home_address: homeAddress,
          birthdate: birthdate || null,
          image: imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const updatedUser = {
        ...staff,
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        contact_no: contactNo,
        home_address: homeAddress,
        birthdate,
        image: imageUrl,
      };
      localStorage.setItem("staff_user", JSON.stringify(updatedUser));
      setStaff(updatedUser);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setImage(null);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setPwMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }
    setChangingPw(true);
    try {
      const token = localStorage.getItem("staff_token");
      const res = await fetch("/api/profile/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMessage({
        type: "error",
        text: err.message || "Failed to change password",
      });
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="pb-6">
      <Breadcrumb title="Profile" />

      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-4">
        <h2 className="text-md font-bold mb-1">Profile Information</h2>
        <p className="text-xs text-gray-500 mb-6">
          Update your personal details and profile photo.
        </p>

        {message && (
          <p
            className={`text-xs mb-4 font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {message.text}
          </p>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={image?.preview || getImageUrl(staff?.image)}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
            />
            {image && (
              <button
                onClick={() => setImage(null)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:border-gray-400 hover:bg-gray-50"
          >
            <ImagePlus className="w-4 h-4" />
            <span>{image ? "Change photo" : "Upload photo"}</span>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Contact No.
            </label>
            <input
              type="text"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Birthdate
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div className="col-span-full">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Home Address
            </label>
            <textarea
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-3 rounded-md transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-gray-600" />
          <h2 className="text-md font-bold">Change Password</h2>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Make sure your new password is at least 8 characters.
        </p>

        {pwMessage && (
          <p
            className={`text-xs mb-4 font-medium ${pwMessage.type === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {pwMessage.text}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleChangePassword}
            disabled={changingPw}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs px-6 py-3 rounded-md transition-colors disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{changingPw ? "Updating..." : "Update Password"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;
