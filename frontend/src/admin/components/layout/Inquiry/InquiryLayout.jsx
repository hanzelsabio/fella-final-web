import Metric from "../../common/Metric";

const InquiryStats = () => {
  return (
    <div className="space-y-6 pb-4">
      <h2 className="text-2xl font-bold">Inquiry Summary</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Metric metricTitle="Total Inquiries" metricValue="3" />
        <Metric metricTitle="Today Inquiries" metricValue="4" />
        <Metric metricTitle="To Call" metricValue="0" />
        <Metric metricTitle="Called" metricValue="3" />
      </div>
    </div>
  );
};

export default InquiryStats;
