/**
 * Td
 * Standard table data cell with consistent padding.
 * Replaces the repeated <td className="px-4 sm:px-6 py-5"> in every table row.
 *
 * Props:
 *   children  — cell content
 *   className — optional extra classes (e.g. "text-end" for actions column)
 */
const Td = ({ children, className = "" }) => (
  <td className={`px-4 sm:px-6 py-5${className ? ` ${className}` : ""}`}>
    {children}
  </td>
);

export default Td;
