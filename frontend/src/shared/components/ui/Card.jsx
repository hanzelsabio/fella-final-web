/**
 * Card
 * The repeated white bordered card container used across all table headers,
 * CMS sections, and form blocks.
 *
 * Variants:
 *   default  — "border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4"
 *   flush    — same but no bottom margin (for stacking)
 *   section  — same padding, no margin (for use inside a parent card)
 */

const VARIANTS = {
  default: "border border-gray-200 bg-white rounded-lg p-4 sm:p-6 mb-4",
  flush: "border border-gray-200 bg-white rounded-lg p-4 sm:p-6",
  section: "border border-gray-200 bg-white rounded-lg p-4 sm:p-6 space-y-6",
};

const Card = ({ children, variant = "default", className = "" }) => (
  <div className={`${VARIANTS[variant]}${className ? ` ${className}` : ""}`}>
    {children}
  </div>
);

export default Card;
