import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

export default function FooterLayout() {
  return (
    <footer className="footer_section bg-transparent text-xs text-center py-4">
      {/* Center logo */}
      <div className="flex justify-center py-20">
        <Link to="/">
          <img
            src="/fella-screen-prints-logo.png"
            className="w-40"
            alt="Brand Logo"
          />
        </Link>
      </div>

      <p className="lg:text-start px-14 py-8">
        © {new Date().getFullYear()} Fella Screen Prints. All rights reserved.
      </p>
    </footer>
  );
}
