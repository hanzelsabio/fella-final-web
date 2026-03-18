import { Link } from "react-router-dom";

function Logo({ className = "" }) {
  return (
    <Link to="/">
      <img
        src="/fella-screen-prints-logo.png"
        alt="Fella Screen Prints Logo"
        className={`w-40 ${className}`}
      />
    </Link>
  );
}

export default Logo;
