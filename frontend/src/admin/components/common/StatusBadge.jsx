/**
 * StatusBadge
 * Renders a colored pill for active / archived status.
 * Used in every table — extracted to avoid repeating the same className logic.
 */
const StatusBadge = ({ status }) => {
  const isArchived = status === "archived";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isArchived ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"
      }`}
    >
      {isArchived ? "Archived" : "Active"}
    </span>
  );
};

export default StatusBadge;
