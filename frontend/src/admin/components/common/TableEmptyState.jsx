import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

/**
 * TableEmptyState
 * Shared empty-state cell shown when a table has no rows.
 *
 * Props:
 *   icon        — Lucide icon component to display
 *   title       — bold message e.g. "No products found"
 *   subtitle    — secondary hint
 *   colSpan     — number of columns the cell should span
 *   createLink  — (optional) href for a CTA button
 *   createLabel — (optional) button label e.g. "New Product"
 */
const TableEmptyState = ({
  icon: Icon,
  title,
  subtitle,
  colSpan,
  createLink,
  createLabel,
}) => (
  <tr>
    <td colSpan={colSpan} className="px-4 sm:px-6 py-12 text-center">
      <div className="flex flex-col items-center justify-center gap-3">
        {Icon && (
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
        {createLink && createLabel && (
          <Link
            to={createLink}
            className="mt-2 bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-3 h-3" />
              <span>{createLabel}</span>
            </div>
          </Link>
        )}
      </div>
    </td>
  </tr>
);

export default TableEmptyState;
