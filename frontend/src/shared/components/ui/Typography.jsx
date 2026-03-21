/**
 * Typography primitives
 * Single source of truth for all repeated text styles.
 * Change a class here and it updates everywhere.
 *
 * Components:
 *   <Text>          — "text-sm text-gray-500"           table cell body copy, muted
 *   <TextPrimary>   — "text-sm text-gray-900 font-medium" table cell primary name/title
 *   <TextMono>      — "text-sm text-gray-500 font-mono"   code/ID values
 *   <TextMuted>     — "text-xs text-gray-400"             hints, placeholders, footnotes
 *   <Label>         — "block text-xs font-medium text-gray-700 mb-1" form field label
 *   <SectionTitle>  — "text-sm font-semibold text-gray-800" card section heading (h3)
 *   <PageSubtitle>  — "text-xs text-gray-600"             subtitle under page headers
 *   <Optional>      — "text-gray-400 font-normal"          "(Optional)" hint in labels
 */

export const Text = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-500${className ? ` ${className}` : ""}`}>
    {children}
  </p>
);

export const TextPrimary = ({ children, className = "" }) => (
  <span
    className={`text-sm text-gray-900 font-medium${className ? ` ${className}` : ""}`}
  >
    {children}
  </span>
);

export const TextMono = ({ children, className = "" }) => (
  <p
    className={`text-sm text-gray-500 font-mono${className ? ` ${className}` : ""}`}
  >
    {children}
  </p>
);

export const TextMuted = ({ children, className = "" }) => (
  <p className={`text-xs text-gray-400${className ? ` ${className}` : ""}`}>
    {children}
  </p>
);

export const Label = ({ children, htmlFor, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-xs font-medium text-gray-700 mb-1${className ? ` ${className}` : ""}`}
  >
    {children}
  </label>
);

export const SectionTitle = ({ children, className = "" }) => (
  <h3
    className={`text-sm font-semibold text-gray-800${className ? ` ${className}` : ""}`}
  >
    {children}
  </h3>
);

export const PageSubtitle = ({ children, className = "" }) => (
  <p className={`text-xs text-gray-600${className ? ` ${className}` : ""}`}>
    {children}
  </p>
);

export const Optional = () => (
  <span className="text-gray-400 font-normal"> (Optional)</span>
);

export const Required = () => <span className="text-red-500"> *</span>;
