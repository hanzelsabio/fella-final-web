import { Link } from "react-router-dom";
import useBasePath from "../hooks/useBasePath";

function Logo({ className = "" }) {
  const basePath = useBasePath();

  return (
    <Link to={`${basePath}/dashboard`}>
      <img
        src="/fella-screen-prints-logo.png"
        alt="Fella Screen Prints Logo"
        className={`w-40 ${className}`}
      />
    </Link>
  );
}

export default Logo;
