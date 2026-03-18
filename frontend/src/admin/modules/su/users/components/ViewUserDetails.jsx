import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getImageUrl } from "../../../../../services/api";
import { ArrowLeft, Edit, User } from "lucide-react";

const roleBadge = (role) => {
  const map = {
    admin: "bg-purple-100 text-purple-700",
    manager: "bg-blue-100 text-blue-700",
    staff: "bg-gray-100 text-gray-600",
  };
  return map[role] || "bg-gray-100 text-gray-600";
};

const ViewUserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/system-users/${id}`);
        const data = await res.json();
        setUser(data.success ? data.data : null);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading user...</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center h-64 m-20">
        <div className="text-sm text-center">
          <p className="text-gray-600">User not found</p>
          <Link
            to="/admin/system-users"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to System Users
          </Link>
        </div>
      </div>
    );

  const profileImage = user.image ? getImageUrl(user.image) : null;

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-lg font-bold">User Details</h2>
            <p className="text-xs text-gray-600">
              View complete system user information
            </p>
          </div>
          <div className="flex flex-wrap text-xs gap-3 flex-shrink-0 px-4 sm:px-6">
            <Link
              to="/admin/system-users"
              className="bg-white text-black border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </Link>
            <Link
              to={`/admin/system-users/edit/${user.id}`}
              className="bg-blue-600 text-white rounded-md px-3 md:px-6 py-3 hover:bg-blue-700"
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>Edit User</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-6">
          {/* Profile card */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-16 h-16 rounded-full object-cover border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-base font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge(user.role)}`}
                >
                  {user.role}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}
                >
                  {user.status === "archived" ? "Archived" : "Active"}
                </span>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  User ID
                </label>
                <p className="text-sm font-mono text-gray-900">
                  {user.user_id}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Username
                </label>
                <p className="text-sm text-gray-900">@{user.username}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{user.email || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Role
                </label>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge(user.role)}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  First Name
                </label>
                <p className="text-sm text-gray-900">{user.first_name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Name
                </label>
                <p className="text-sm text-gray-900">{user.last_name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Contact No.
                </label>
                <p className="text-sm text-gray-900">
                  {user.contact_no || "—"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Birthdate
                </label>
                <p className="text-sm text-gray-900">
                  {user.birthdate
                    ? new Date(user.birthdate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              {user.home_address && (
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Home Address
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {user.home_address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Login
                </label>
                <p className="text-sm text-gray-900">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {user.updated_at
                    ? new Date(user.updated_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserDetails;
