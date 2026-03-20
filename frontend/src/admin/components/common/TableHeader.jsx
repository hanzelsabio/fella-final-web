import { Link } from "react-router-dom";

/**
 * TableHeader
 * The top card with title, subtitle, and action buttons.
 *
 * Props:
 *   title    — e.g. "Manage Products"
 *   subtitle — e.g. "Manage and track all your products from here."
 *   actions  — array of:
 *     { label, to, icon, variant }        — renders a <Link>
 *     { label, onClick, icon, variant }   — renders a <button>
 */
const TableHeader = ({ title, subtitle, actions = [] }) => (
  <div className="border border-gray-200 rounded-lg bg-white p-4 sm:p-6 mb-4">
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div>
        <h2 className="text-md font-semibold">{title}</h2>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>
      {actions.length > 0 && (
        <div className="flex text-xs gap-3 flex-shrink-0 self-end sm:self-auto">
          {actions.map(
            ({ label, to, onClick, icon: Icon, variant = "secondary" }) => {
              const cls = `rounded-md px-4 py-3 transition-colors ${
                variant === "primary"
                  ? "bg-black hover:bg-gray-800 text-white"
                  : "bg-white border border-gray-300 text-black"
              }`;
              const content = (
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{label}</span>
                </div>
              );
              return onClick ? (
                <button key={label} onClick={onClick} className={cls}>
                  {content}
                </button>
              ) : (
                <Link key={label} to={to} className={cls}>
                  {content}
                </Link>
              );
            },
          )}
        </div>
      )}
    </div>
  </div>
);

export default TableHeader;
