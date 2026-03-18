const Button = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-black text-sm text-white py-3 px-8 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {children}
    </button>
  );
};

export default Button;
