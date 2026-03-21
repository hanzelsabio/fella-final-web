/**
 * Button primitives
 * Single source of truth for all repeated button styles.
 *
 * Components:
 *   <BtnPrimary>    — black filled button  (main CTA)
 *   <BtnSecondary>  — white bordered button (secondary action)
 *   <BtnDanger>     — red filled button    (delete)
 *   <BtnGhost>      — borderless text link style (e.g. "Change image")
 *   <IconBtn>       — square icon-only button (edit/archive/delete in CMS tables)
 */

// ── Base ─────────────────────────────────────────────────────────────────────
const base =
  "rounded-md px-4 py-3 text-xs transition-colors flex items-center gap-2 disabled:opacity-50";

export const BtnPrimary = ({ children, className = "", ...props }) => (
  <button
    className={`${base} bg-black hover:bg-gray-800 text-white ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const BtnSecondary = ({ children, className = "", ...props }) => (
  <button
    className={`${base} bg-white border border-gray-300 text-black hover:bg-gray-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const BtnDanger = ({ children, className = "", ...props }) => (
  <button
    className={`${base} bg-red-600 hover:bg-red-500 text-white ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const BtnGhost = ({ children, className = "", ...props }) => (
  <button
    className={`text-xs text-blue-500 hover:text-blue-600 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

/**
 * IconBtn
 * Small square button used for edit/archive/delete in CMS inline tables.
 *
 * Props:
 *   variant — "default" | "danger"
 *   title   — tooltip
 */
export const IconBtn = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const variantClass =
    variant === "danger"
      ? "border border-red-200 hover:bg-red-50"
      : "border border-gray-300 hover:bg-gray-100";
  return (
    <button
      className={`p-1.5 rounded-md transition-colors ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
