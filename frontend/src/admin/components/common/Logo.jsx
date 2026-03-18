import { Link, useLocation } from "react-router-dom";

function Logo({ className = "" }) {
  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff" : "/admin";

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
