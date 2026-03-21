/**
 * Input primitives
 * Single source of truth for all repeated form input styles.
 *
 * Components:
 *   <Input>      — standard text input
 *   <Textarea>   — standard textarea
 *   <FormField>  — Label + Input/Textarea wrapper with optional hint
 */

import { Label, Optional, Required } from "./Typography";

const INPUT_CLASS =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm";

export const Input = ({ className = "", ...props }) => (
  <input
    className={`${INPUT_CLASS}${className ? ` ${className}` : ""}`}
    {...props}
  />
);

export const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`${INPUT_CLASS}${className ? ` ${className}` : ""}`}
    {...props}
  />
);

/**
 * FormField
 * Wraps a label + input/textarea + optional hint text.
 *
 * Props:
 *   label      — label text
 *   htmlFor    — input id
 *   optional   — show (Optional) hint
 *   required   — show * required marker
 *   hint       — small text below the input
 *   children   — the <Input> or <Textarea> (or any input element)
 */
export const FormField = ({
  label,
  htmlFor,
  optional,
  required,
  hint,
  children,
}) => (
  <div>
    <Label htmlFor={htmlFor}>
      {label}
      {optional && <Optional />}
      {required && <Required />}
    </Label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);
