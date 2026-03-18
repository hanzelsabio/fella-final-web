import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useInquiries } from "../context/InquiryContext.jsx";

const InquiriesStats = () => {
  const { inquiries } = useInquiries();

  const today = new Date().toDateString();

  const stats = [
    {
      label: "Total Inquiries",
      value: inquiries.filter((i) => i.status !== "archived").length,
    },
    {
      label: "Today's Inquiries",
      value: inquiries.filter(
        (i) => new Date(i.created_at).toDateString() === today,
      ).length,
    },
    {
      label: "Pending Inquiries",
      value: inquiries.filter((i) => i.status === "pending").length,
    },
    {
      label: "Responded",
      value: inquiries.filter((i) => i.status === "responded").length,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      {/* Header */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          <div>
            <h2 className="text-lg font-bold">Overview</h2>
            <p className="text-xs text-gray-600">
              Monitor and manage your inquiries here.
            </p>
          </div>
          <div className="flex text-xs gap-3 flex-shrink-0 self-end sm:self-auto">
            <Link
              to="/package"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-3"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span>New Inquiry</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 bg-white rounded-lg p-4 md:p-5"
          >
            <p className="text-xs md:text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl md:text-3xl font-medium mt-1 md:mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InquiriesStats;
