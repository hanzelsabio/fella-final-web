/**
 * DateCell
 * Renders a formatted date string or a fallback inside a standard table cell paragraph.
 *
 * Props:
 *   value    — date string / timestamp
 *   fallback — text shown when value is null/undefined (default "N/A")
 */
const DateCell = ({ value, fallback = "N/A" }) => (
  <p className="text-sm text-gray-500">
    {value ? new Date(value).toLocaleDateString() : fallback}
  </p>
);

export default DateCell;
