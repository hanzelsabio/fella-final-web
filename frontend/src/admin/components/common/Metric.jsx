const Metric = ({ metricTitle, metricValue }) => {
  return (
    <div className="border border-gray-200 bg-white rounded-xl p-5">
      <p className="text-sm text-gray-500">{metricTitle}</p>
      <p className="text-3xl font-bold mt-2">{metricValue}</p>
    </div>
  );
};

export default Metric;
