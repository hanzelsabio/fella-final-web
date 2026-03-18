import { Link, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail } from "lucide-react";

const ViewInquiriesDetails = () => {
  const { inquiry_number } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

  useEffect(() => {
    const loadInquiry = async () => {
      try {
        const response = await fetch(`/api/inquiries/${inquiry_number}`);
        const data = await response.json();

        if (data.success && data.data) {
          setInquiry(data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching inquiry:", error);
        setLoading(false);
      }
    };

    loadInquiry();
  }, [inquiry_number]);

  const handleReplyViaEmail = () => {
    const to = encodeURIComponent(inquiry.email || "");
    const subject = encodeURIComponent(
      `Re: Inquiry #${inquiry.inquiry_number}`,
    );
    window.location.href = `mailto:${to}?subject=${subject}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-600",
      responded: "bg-blue-100 text-blue-600",
      cancelled: "bg-orange-100 text-orange-600",
      archived: "bg-gray-100 text-gray-600",
    };
    const labels = {
      pending: "Pending",
      responded: "Responded",
      cancelled: "Cancelled",
      archived: "Archived",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inquiry...</p>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="flex items-center justify-center h-64 m-20">
        <div className="text-sm text-center">
          <p className="text-gray-600">Inquiry not found</p>
          <Link
            to={`${basePath}/inquiries`}
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Inquiries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="border border-gray-200 rounded-lg bg-white py-4 sm:py-6 mb-4">
        {/* Page Header */}
        <div className="flex justify-between items-start border-b border-gray-200 gap-5 mb-5">
          <div className="flex-1 pb-5 px-4 sm:px-6">
            <h2 className="text-lg font-bold">Inquiry Details</h2>
            <p className="text-xs text-gray-600">
              View complete inquiry information
            </p>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0 px-4 sm:px-6">
            {/* Back */}
            <Link
              to={`${basePath}/inquiries`}
              className="bg-white text-black text-xs border border-gray-400 rounded-md px-3 md:px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-6">
          {/* Inquiry Information */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Inquiry Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Inquiry Number
                </label>
                <p className="text-sm text-gray-900">
                  {inquiry.inquiry_number || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Customer Name
                </label>
                <p className="text-sm text-gray-900">{inquiry.name || "N/A"}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Primary Contact
                </label>
                <p className="text-sm text-gray-900">
                  {inquiry.contact || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Primary Email
                </label>
                <p className="text-sm text-gray-900">
                  {inquiry.email || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Product Type
                </label>
                <p className="text-sm text-gray-900">
                  {inquiry.product_type || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Service Type
                </label>
                <p className="text-sm text-gray-900">
                  {inquiry.service_type || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Priority
                </label>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    inquiry.priority === "high"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {inquiry.priority === "high" ? "High" : "Normal"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                {getStatusBadge(inquiry.status)}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Messages
            </h3>
            {inquiry.messages && inquiry.messages.length > 0 ? (
              <div className="flex flex-col gap-3">
                {inquiry.messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(msg.sent_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No messages available</p>
            )}
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Created On
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(inquiry.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={handleReplyViaEmail}
                disabled={!inquiry.email}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md px-4 py-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInquiriesDetails;
